const Preview = require('../../models/user/Preview');
const asyncHandler = require('express-async-handler');
const ProductVariation = require('../../models/product/ProductVariation');
const { updateProductRating } = require('../product/productController');

// Tính lại rating trung bình và tổng của một sản phẩm dựa trên các Preview
const updateProductVariationRating = async (productVariationId) => {
  // B1: Lấy toàn bộ đánh giá của biến thể này
    //Mảng chưa các Preview (đánh giá) của biến thể sản phẩm
  const previews = await Preview.find({ productVariationId });

  // B2: Tính tổng lượt đánh giá
  const totalRating = previews.length;

  // B3: Tính tổng số sao từ tất cả lượt đánh giá
    //Reduce: hàm chạy từng phân tử trong mảng previews để cộng dồn
    //Sum biến cộng dồn
    /*
        lượt 1: sum = 0 + 5 = 5
        lượt 2: sum = 5 + 3 = 8
        lượt 3: sum = 8 + 4 = 12
    */
  const totalStars = previews.reduce((sum, review) => sum + review.previewRating, 0);

  // B4: Tính trung bình (làm tròn 1 chữ số thập phân)
    // Nếu tổng rating > 0 thì tính trung bình, nếu không thì để là 0 và làm tròn 1 chữ số thập phân
  const averageRating = totalRating > 0 ? (totalStars / totalRating).toFixed(1) : 0;

  // B5: Ghi các giá trị này vào bảng ProductVariation
  await ProductVariation.findByIdAndUpdate(productVariationId, {
    rating: averageRating,
    totalRating
  });
};

// Tạo mới Preview (đánh giá sản phẩm)
exports.createPreview = asyncHandler(async (req, res) => {
    // Lấy dữ liệu từ body
    const { previewComment, previewRating, userId, productVariationId } = req.body;
    const missingFields = [];
    if (previewRating === undefined) missingFields.push('previewRating');
    if (!userId) missingFields.push('userId');
    if (!productVariationId) missingFields.push('productVariationId');
    if (missingFields.length > 0) {
        return res.status(400).json({ success: false, mes: `Missing required field(s): ${missingFields.join(', ')}` });
    }

    //Kiểm tra xem người dùng đã từng đánh giá biến thể này chưa
    const existingPreview = await Preview.findOne({ userId, productVariationId });

    let preview;
    if (existingPreview) {
        // Nếu đã có => cập nhật lại đánh giá cũ
        existingPreview.previewRating = previewRating;
        existingPreview.previewComment = previewComment;
        preview = await existingPreview.save();
    } else {
        // Nếu chưa có => tạo đánh giá mới
        preview = await Preview.create({
            previewComment,
            previewRating,
            userId,
            productVariationId
        });
    } 


    // Sau khi tạo/cập nhật xong → tính lại rating trung bình + tổng rating
    await updateProductVariationRating(productVariationId);
    
    const variation = await ProductVariation.findById(productVariationId).populate('productId');

    if (variation?.productId?._id) {
        //console.log('updateProductRating = ', updateProductRating);
        await updateProductRating(variation.productId._id);
    }
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
    
    if (updated) {
        const productVariationId = updated.productVariationId;

        await updateProductVariationRating(productVariationId);

        const variation = await ProductVariation.findById(productVariationId).populate('productId');
        if (variation?.productId?._id) {
            await updateProductRating(variation.productId._id);
        }
    }

    return res.json({ success: !!updated, preview: updated || 'Update failed' });
});


// Xóa Preview
exports.deletePreview = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deleted = await Preview.findByIdAndDelete(id);
    
    if (deleted) {
        const productVariationId = deleted.productVariationId;

        await updateProductVariationRating(productVariationId);

        const variation = await ProductVariation.findById(productVariationId).populate('productId');
        if (variation?.productId?._id) {
            await updateProductRating(variation.productId._id);
        }
    }

    return res.json({ success: !!deleted, mes: deleted ? 'Preview deleted' : 'Delete failed' });
});