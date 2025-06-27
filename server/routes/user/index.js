const express = require('express');
const router = express.Router();

router.use('/users', require('./userRoutes'));
router.use('/customers', require('./customerRoutes'));
router.use('/admins', require('./adminRoutes'));
router.use('/statususer', require('./statusUserRoutes'));
router.use('/preview', require('./previewRoutes'));
router.use('/cartitem', require('./cartItemRoutes'));
router.use('/shoppingcart', require('./shoppingCartRoutes'));
router.use('/address', require('./addressRoutes'));
router.use('/role', require('./roleRoutes'));
router.use('/accounts', require('./accountRoutes'));

module.exports = router; 