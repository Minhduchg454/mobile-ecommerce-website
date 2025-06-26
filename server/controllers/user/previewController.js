const Preview = require('../../models/user/Preview');
const asyncHandler = require('express-async-handler');

// Tạo mới Preview (đánh giá sản phẩm)
exports.createPreview = asyncHandler(async (req, res) => {
    // Lấy dữ liệu từ body
    const { previewComment, previewRating, userId, productVariationId } = req.body;
    if (!previewRating || !userId || !productVariationId) {
        return res.status(400).json({ success: false, mes: 'Missing required fields' });
    }
    // Tạo mới preview
    const preview = await Preview.create({ previewComment, previewRating, userId, productVariationId });
    return res.status(201).json({ success: true, preview });
});

// Lấy danh sách Preview theo userId
exports.getPreviews = asyncHandler(async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, mes: 'Missing userId' });
    const previews = await Preview.find({ userId });
    return res.json({ success: true, previews });
});

// Cập nhật Preview
exports.updatePreview = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updated = await Preview.findByIdAndUpdate(id, req.body, { new: true });
    return res.json({ success: !!updated, preview: updated || 'Update failed' });
});

// Xóa Preview
exports.deletePreview = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deleted = await Preview.findByIdAndDelete(id);
    return res.json({ success: !!deleted, mes: deleted ? 'Preview deleted' : 'Delete failed' });
}); 