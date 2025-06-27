const express = require('express');
const router = express.Router();
const customerCtrl = require('../../controllers/user/customerController');

router.post('/', customerCtrl.createCustomer);
router.get('/:id', customerCtrl.getCustomerById);
router.put('/:id', customerCtrl.updateCustomer);
router.delete('/:id', customerCtrl.deleteCustomer);
router.get('/', customerCtrl.getAllCustomers);

module.exports = router; 