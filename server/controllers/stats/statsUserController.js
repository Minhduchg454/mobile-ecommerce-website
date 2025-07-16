const User = require("../../models/user/User");
const mongoose = require("mongoose");

exports.getUserStats = async (req, res) => {
  try {
    const { from, to, type = "day" } = req.query;

    if (!from || !to)
      return res
        .status(400)
        .json({ success: false, mes: "Thiếu 'from' hoặc 'to'" });

    const fromDate = new Date(from);
    const toDate = new Date(to);

    // Định dạng thời gian theo loại
    let dateFormat = "%Y-%m-%d";
    if (type === "month") dateFormat = "%Y-%m";
    else if (type === "year") dateFormat = "%Y";

    const stats = await mongoose.model("User").aggregate([
      {
        $match: {
          createdAt: { $gte: fromDate, $lte: toDate },
        },
      },
      {
        $lookup: {
          from: "roles",
          localField: "roleId",
          foreignField: "_id",
          as: "role",
        },
      },
      { $unwind: "$role" },
      {
        $match: {
          "role.roleName": "customer",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return res.json({ success: true, data: stats });
  } catch (error) {
    console.error("getUserStats error:", error);
    return res.status(500).json({ success: false, mes: "Lỗi server" });
  }
};
