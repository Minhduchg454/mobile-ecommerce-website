const router = require('express').Router()
const ctrls = require('../../controllers/product/productController')
const uploadCloud = require('../../config/cloudinary.config') // đường dẫn đúng của bạn
// Create product (POST /api/products)
router.post('/', uploadCloud.single('thumb'), ctrls.createProduct)

// Get all products with filters, pagination (GET /api/products)
router.get('/', ctrls.getProducts)

// Get a single product by ID (GET /api/products/:pid)
router.get('/:pid', ctrls.getProduct)

// Update a product (PUT /api/products/:pid)
router.put('/:pid', uploadCloud.fields([{ name: 'thumb', maxCount: 1 }]), ctrls.updateProduct)

// Delete a product (DELETE /api/products/:pid)
router.delete('/:pid', ctrls.deleteProduct)
 
module.exports = router