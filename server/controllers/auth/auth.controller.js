const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../../models/user/User");
const Role = require("../../models/user/Role");
const StatusUser = require("../../models/user/StatusUser");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
  const { token } = req.body;
  //   console.log("Google Token:", token);
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      // Tách họ và tên
      const [firstName, ...rest] = name.split(" ");
      const lastName = rest.join(" ");

      // 🔍 Lấy roleId mặc định từ DB
      const defaultRole = await Role.findOne({ roleName: "customer" });
      const defaultStatus = await StatusUser.findOne({
        statusUserName: "active",
      });

      if (!defaultRole || !defaultStatus) {
        return res.status(500).json({
          success: false,
          message: "System setup missing role or status",
        });
      }

      user = await User.create({
        firstName,
        lastName,
        email,
        avatar: picture,
        userName: email.split("@")[0],
        roleId: defaultRole._id,
        statusUserId: defaultStatus._id,
      });
    }

    // Tạo JWT
    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      success: true,
      token: accessToken,
      user,
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(401).json({
      success: false,
      message: error.message || "Google login failed",
    });
  }
};
