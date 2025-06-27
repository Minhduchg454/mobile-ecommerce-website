const express = require('express');
const router = express.Router();
const userCtrl = require('../../controllers/user/userController');

router.post('/', userCtrl.register);
router.get('/:id', userCtrl.getCurrent);
router.put('/:id', userCtrl.updateUser);
router.delete('/:id', userCtrl.deleteUser);
router.get('/', userCtrl.getUsers);

module.exports = router; 