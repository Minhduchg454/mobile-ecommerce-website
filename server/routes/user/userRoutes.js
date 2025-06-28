const express = require('express');
const router = express.Router();
const userCtrl = require('../../controllers/user/userController');

router.post('/login', userCtrl.login);
router.post('/', userCtrl.register);
router.get('/:id', userCtrl.getUserById);
router.put('/:id', userCtrl.updateUser);
router.delete('/:id', userCtrl.deleteUser);
router.get('/', userCtrl.getUsers);

module.exports = router; 