searchProduct = require('../../ultils/searchProduct');

const express = require('express');

const router = express.Router();

router.post('/h', searchProduct);

module.exports = router;