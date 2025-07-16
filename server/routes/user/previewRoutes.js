const router = require("express").Router();
const ctrls = require("../../controllers/user/previewController");

// Tạo mới Preview
router.post("/", ctrls.createPreview); // POST /api/preview

// Lấy danh sách Preview theo userId
router.get("/", ctrls.getPreviews); // GET /api/preview?userId=...

// Cập nhật Preview
router.put("/:id", ctrls.updatePreview); // PUT /api/preview/:id

// Xóa Preview
router.delete("/:id", ctrls.deletePreview); // DELETE /api/preview/:id

// Route lọc đánh giá
router.get("/filter", ctrls.filterPreviews);

module.exports = router;

/* 
    Tạo đánh giá
        Post: http://localhost:5000/api/preview
        {
        "userId": "68728fc92345848c3bd6388f",
        "productVariationId": "68714619d39eff05f032c6ee",
        "previewComment": "Sản phầm tuyệt vời",
        "previewRating" : "3"
        }

    Tìm đánh giá theo id
        Post http://localhost:5000/api/preview?userId=68728fc92345848c3bd6388f

    

*/
