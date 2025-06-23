const router = require('express').Router()
const ctrls = require('../../controllers/product/warrantyCardController')

// Create
router.post('/', ctrls.createWarrantyCard)

// Get all
router.get('/', ctrls.getWarrantyCards)

// Get by ID
router.get('/:id', ctrls.getWarrantyById)

// Get by code
router.get('/code/:code', ctrls.getWarrantyByCode)

// Update
router.put('/:id', ctrls.updateWarrantyCard)

// Delete
router.delete('/:id', ctrls.deleteWarrantyCard)

module.exports = router