const mongoose = require("mongoose");
const Preview = require("./entities/preview.model");
const slugify = require("slugify");
const productsService = require("../product/product.service");

exports.recalcProductVariationRating = async (pvId) => {
  if (!mongoose.isValidObjectId(pvId)) {
    return;
  }

  // 1. Thực hiện Aggregation để tính tổng số sao và tổng số lượt đánh giá
  const aggregation = await Preview.aggregate([
    {
      $match: {
        pvId: mongoose.Types.ObjectId(pvId),
        isDeleted: false,
        previewRate: { $gte: 1, $lte: 5 },
      },
    },
    {
      $group: {
        _id: "$pvId",
        totalReviews: { $sum: 1 },
        totalScore: { $sum: "$previewRate" },
      },
    },
  ]);

  const result = aggregation[0];

  let newRateAvg = 5;
  let newRateCount = 0;

  if (result) {
    newRateCount = result.totalReviews;
    newRateAvg =
      result.totalReviews > 0
        ? (result.totalScore / result.totalReviews).toFixed(2)
        : 5;
  }

  // 2. Cập nhật ProductVariation BẰNG CÁCH GỌI PRODUCT SERVICE
  const updatePayload = {
    pvRateAvg: Number(newRateAvg),
    pvRateCount: newRateCount,
  };

  try {
    const updateResult = await productsService.updateProductVariation(
      { pvId },
      updatePayload,
      null
    );

    if (!updateResult.success) {
      const err = new Error(
        `Lỗi Service: Không thể cập nhật PV Rating cho ${pvId}. Chi tiết: ${updateResult.message}`
      );
      err.status = 500;
      throw err;
    }
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

exports.createPreview = async (body, files = {}) => {
  const { previewRate, customerId, pvId, orderId } = body;

  if (files?.previewImages?.length > 0) {
    body.previewImages = files?.previewImages.map((file) => file.path);
  }
  if (files?.previewVideos?.[0]?.path) {
    body.previewVideos = files?.previewVideos[0].path;
  }

  if (!previewRate || !customerId || !pvId || !orderId) {
    const err = new Error(
      "Thiếu thông tin bắt buộc: Điểm đánh giá, Khách hàng, Phiên bản sản phẩm, hoặc Đơn hàng."
    );
    err.status = 400;
    throw err;
  }
  if (previewRate < 1 || previewRate > 5) {
    const err = new Error("Điểm đánh giá phải nằm trong khoảng từ 1 đến 5.");
    err.status = 400;
    throw err;
  }

  const existingPreview = await Preview.findOne({
    customerId: customerId,
    pvId: pvId,
    orderId: orderId,
    isDeleted: false,
  });

  if (existingPreview) {
    const err = new Error(
      "Khách hàng đã đánh giá cho đơn hàng và sản phẩm này rồi."
    );
    err.status = 400;
    throw err;
  }

  const preview = await Preview.create(body);

  await exports.recalcProductVariationRating(body.pvId);
  return {
    success: true,
    message: "Tạo đánh giá thành công",
    preview,
  };
};

// 2. Hàm lấy danh sách Preview theo điều kiện (Lấy đánh giá)
exports.getPreview = async (query = {}) => {
  // ---------- 1. Đọc & chuẩn hoá ----------
  const {
    pvId,
    customerId,
    orderId,
    previewRate,
    isMedia,
    sort = "newest", // mặc định
    includeDeleted,
    isDeleted,
    page = 1,
    limit = 10,
  } = query;

  const pageNumber = Math.max(1, parseInt(page, 10) || 1);
  const limitNumber = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (pageNumber - 1) * limitNumber;

  // ---------- 2. Filter ----------
  const filter = {};

  // 2.1 Xóa mềm
  if (includeDeleted === "true" || includeDeleted === true) {
    if (isDeleted === "true" || isDeleted === true) filter.isDeleted = true;
    else if (isDeleted === "false" || isDeleted === false)
      filter.isDeleted = false;
  } else {
    filter.isDeleted = false;
  }

  // 2.2 pvId (hỗ trợ mảng hoặc 1 id)
  if (pvId) {
    const ids = Array.isArray(pvId) ? pvId : [pvId];
    filter.pvId = { $in: ids };
  }

  // 2.3 các id khác
  if (customerId) filter.customerId = customerId;
  if (orderId) {
    const orderIds = Array.isArray(orderId) ? orderId : [orderId];
    filter.orderId = { $in: orderIds };
  }

  // 2.4 Điểm sao (exact match)
  if (previewRate != null) {
    const rate = Number(previewRate);
    if (!isNaN(rate) && rate >= 1 && rate <= 5) {
      filter.previewRate = rate;
    }
  }

  // 2.5 Có media
  // 2.5 Có media: có ảnh (mảng rỗng) HOẶC có video (chuỗi không rỗng)
  if (isMedia === true || isMedia === "true") {
    filter.$or = [
      { previewImages: { $exists: true, $ne: [] } }, // Có ít nhất 1 ảnh
      { previewVideos: { $exists: true, $ne: "" } }, // Có video (chuỗi không rỗng)
    ];
  }
  // ---------- 3. Sort ----------
  const sortOption = {};
  switch (String(sort).toLowerCase()) {
    case "oldest":
      sortOption.previewDate = 1;
      sortOption.createdAt = 1;
      break;
    case "highest_rate":
      sortOption.previewRate = -1;
      sortOption.createdAt = -1;
      break;
    case "lowest_rate":
      sortOption.previewRate = 1;
      sortOption.createdAt = -1;
      break;
    case "newest":
    default:
      sortOption.previewDate = -1;
      sortOption.createdAt = -1;
      break;
  }

  // ---------- 4. Query ----------
  const totalCount = await Preview.countDocuments(filter);

  const previews = await Preview.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(limitNumber)
    .populate({
      path: "customerId",
      populate: {
        path: "_id",
        model: "User",
        select: "userAvatar userFirstName userLastName",
      },
    });

  // ---------- 5. Response ----------
  return {
    success: true,
    message: "Lấy danh sách đánh giá thành công",
    previews,
    totalCount,
    currentPage: pageNumber,
    limit: limitNumber,
  };
};

// 3. Hàm cập nhật Preview (Chỉ cho phép cập nhật nội dung, rate, ảnh/video)
exports.updatePreview = async (pId, body, files = {}) => {
  const { previewComment, previewRate } = body;

  const updateData = {
    previewComment,
    previewRate,
  };

  updateData.isEdited = true;

  if (files?.previewImages?.length > 0) {
    updateData.previewImages = files.previewImages.map((file) => file.path);
  } else if (body.previewImages) {
    updateData.previewImages = body.previewImages;
  }

  if (files?.previewVideos?.[0]?.path) {
    updateData.previewVideos = files.previewVideos[0].path;
  } else if (body.previewVideos) {
    updateData.previewVideos = body.previewVideos;
  }

  const preview = await Preview.findById(pId);
  if (!preview || preview.isDeleted) {
    const err = new Error("Đánh giá không tồn tại hoặc đã bị xóa.");
    err.status = 404;
    throw err;
  }

  // [Chưa xác minh] Chỉ cho phép cập nhật trong một khoảng thời gian nhất định (Tạm thời bỏ qua)

  if (
    updateData.previewRate &&
    (updateData.previewRate < 1 || updateData.previewRate > 5)
  ) {
    const err = new Error("Điểm đánh giá phải nằm trong khoảng từ 1 đến 5.");
    err.status = 400;
    throw err;
  }

  const updatedPreview = await Preview.findByIdAndUpdate(pId, updateData, {
    new: true,
  });

  await exports.recalcProductVariationRating(body.pvId);

  return {
    success: true,
    message: "Cập nhật đánh giá thành công",
    preview: updatedPreview,
  };
};

exports.deletePreview = async (pId) => {
  const preview = await Preview.findById(pId);

  if (!preview || preview.isDeleted) {
    const err = new Error("Đánh giá không tồn tại hoặc đã bị xóa.");
    err.status = 404;
    throw err;
  }

  // Thực hiện xóa mềm
  const deletedPreview = await Preview.findByIdAndUpdate(
    pId,
    {
      isDeleted: true,
      deletedAt: Date.now(),
    },
    { new: true }
  );

  await exports.recalcProductVariationRating(body.pvId);

  return {
    success: true,
    message: "Xóa đánh giá thành công",
    preview: deletedPreview,
  };
};
