const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../../models/user/User");
const Role = require("../../models/user/Role");
const StatusUser = require("../../models/user/StatusUser");
const Customer = require("../../models/user/Customer");
const Account = require("../../models/user/Account");
const ShoppingCart = require("../../models/user/ShoppingCart");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture } = ticket.getPayload();
    const [firstName, ...rest] = name.split(" ");
    const lastName = rest.join(" ");

    // Kiểm tra xem User đã tồn tại chưa
    let user = await User.findOne({ email });

    if (!user) {
      const role = await Role.findOne({ roleName: "customer" });
      const status = await StatusUser.findOne({ statusUserName: "active" });

      if (!role || !status) {
        return res.status(500).json({
          success: false,
          message: "Role hoặc StatusUser chưa được cấu hình",
        });
      }

      // Kiểm tra trùng userName trong Account
      const existedAccount = await Account.findOne({ userName: email });
      if (existedAccount) {
        return res.status(400).json({
          success: false,
          message: "Tài khoản đã tồn tại với email này",
        });
      }

      // Tạo Account (có thể để mật khẩu rỗng hoặc random hash)
      await Account.create({
        userName: email,
        fromGoogle: true, // Không cần password
      });

      // Tạo User
      const userData = {
        firstName,
        lastName,
        email,
        avatar: picture,
        userName: email,
        roleId: role._id,
        statusUserId: status._id,
      };

      // Xóa mọi field có giá trị null hoặc undefined
      Object.keys(userData).forEach(
        (key) => userData[key] == null && delete userData[key]
      );

      user = await User.create(userData);

      // Tạo Customer
      await Customer.create({ _id: user._id });

      //Tạo giỏ hàng
      const existingCart = await ShoppingCart.findOne({ userId: user._id });
      if (!existingCart) {
        await ShoppingCart.create({ userId: user._id, totalPrice: 0 });
      }
    }

    // Tạo JWT
    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(200).json({
      success: true,
      token: accessToken,
      user,
    });
  } catch (error) {
    console.error("Google login error:", error);
    return res.status(401).json({
      success: false,
      message: error.message || "Google login failed",
    });
  }
};
