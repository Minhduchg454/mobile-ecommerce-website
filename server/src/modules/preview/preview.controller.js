const previewService = require("./preview.service");
// 1. Controller tạo Preview
exports.createPreview = async (req, res, next) => {
  try {
    const result = await previewService.createPreview(req.body, req.files);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

// 2. Controller lấy danh sách Preview
exports.getPreview = async (req, res, next) => {
  try {
    const result = await previewService.getPreview(req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// 3. Controller cập nhật Preview
exports.updatePreview = async (req, res, next) => {
  try {
    const { pId } = req.params;
    const result = await previewService.updatePreview(pId, req.body, req.files);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// 4. Controller xóa Preview
exports.deletePreview = async (req, res, next) => {
  try {
    const { pId } = req.params;
    const result = await previewService.deletePreview(pId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
