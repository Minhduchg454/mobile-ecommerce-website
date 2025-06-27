const express = require('express');
const router = express.Router();
const adminCtrl = require('../../controllers/user/adminController');

router.post('/', adminCtrl.createAdmin);
router.get('/:id', adminCtrl.getAdminById);
router.put('/:id', adminCtrl.updateAdmin);
router.delete('/:id', adminCtrl.deleteAdmin);
router.get('/', adminCtrl.getAllAdmins);

module.exports = router; 