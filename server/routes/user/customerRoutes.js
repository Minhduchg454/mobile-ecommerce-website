const express = require('express');
const router = express.Router();
const customerCtrl = require('../../controllers/user/customerController');

router.post('/', customerCtrl.createCustomer);
router.get('/:id', customerCtrl.getCustomerById);
router.put('/:id', customerCtrl.updateCustomer);
router.delete('/:id', customerCtrl.deleteCustomer);
router.get('/', customerCtrl.getAllCustomers);
router.get('/check-email', customerCtrl.checkEmailExists);
router.get('/check-mobile', customerCtrl.checkMobileExists);

module.exports = router; 