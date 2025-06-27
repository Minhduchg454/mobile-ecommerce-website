const express = require('express');
const router = express.Router();
const accountCtrl = require('../../controllers/user/accountController');

router.post('/', accountCtrl.createAccount);
router.get('/', accountCtrl.getAccounts);
router.get('/:id', accountCtrl.getAccountById);
router.put('/:id', accountCtrl.updateAccount);
router.delete('/:id', accountCtrl.deleteAccount);

module.exports = router; 