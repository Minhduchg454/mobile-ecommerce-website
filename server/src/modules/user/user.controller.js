const userService = require("./user.service");

exports.getCurrent = async (req, res, next) => {
  try {
    //Truyen qua query ?id=... =>req.query
    //Truyen qua params url: /__/__/current/:id
    const result = await userService.getCurrent(req.body, req.user);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const result = await userService.getUsers(req.query);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { uId } = req.params;
    const result = await userService.deleteUser(uId, req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { uId } = req.params;
    const result = await userService.updateUser(uId, req.body, req.file);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * Address
 */
exports.createAddress = async (req, res, next) => {
  try {
    const result = await userService.createAddress(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getAddresses = async (req, res, next) => {
  try {
    const result = await userService.getAddresses(req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const { userId } = req.body;
    const result = await userService.updateAddress(addressId, userId, req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.deleteAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const { userId } = req.body;
    const result = await userService.deleteAddress(addressId, userId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

//Bank
exports.createBank = async (req, res, next) => {
  try {
    const result = await userService.createBank(req.body, req.file);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getBank = async (req, res, next) => {
  try {
    const result = await userService.getBank(req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateBank = async (req, res, next) => {
  try {
    const result = await userService.updateBank(req.params, req.body, req.file);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.deleteBank = async (req, res, next) => {
  try {
    const { bId } = req.params;
    const result = await userService.deleteBank(bId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * PaymentAccount
 */

exports.createPaymentAccount = async (req, res, next) => {
  try {
    const userId = req.body.userId;
    const result = await userService.createPaymentAccount(req.body, userId);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getPaymentAccounts = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const result = await userService.getPaymentAccounts(req.query, userId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updatePaymentAccount = async (req, res, next) => {
  try {
    const userId = req.body.userId;
    const result = await userService.updatePaymentAccount(
      req.params,
      req.body,
      userId
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.deletePaymentAccount = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const { aId } = req.params;
    const result = await userService.deletePaymentAccount(aId, userId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * Balance
 */

// Lấy số dư của người dùng hiện tại theo loại sổ (Token + Query Param)
exports.getCurrentUserBalanceByFor = async (req, res, next) => {
  try {
    const { balanceFor, userId } = req.query;

    if (!balanceFor) {
      throw new Error(
        "Vui lòng cung cấp tham số 'userId' 'balanceFor' (shop, admin, customer)."
      );
    }
    const result = await userService.getBalanceByUserIdAndFor(
      userId,
      balanceFor.toUpperCase()
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateBalance = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const {
      amount,
      balanceFor,
      // Các trường thông tin giao dịch thêm vào
      tranType,
      tranDescriptions,
      tranRelatedId,
      tranRelatedModel,
    } = req.body;

    if (!balanceFor) {
      throw new Error("Thiếu tham số 'balanceFor' (shop/customer/admin).");
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum === 0) {
      throw new Error("Số tiền cập nhật (amount) không hợp lệ.");
    }

    if (!tranType) {
      throw new Error("Vui lòng cung cấp loại giao dịch (tranType).");
    }

    const result = await userService.updateBalance(
      userId,
      balanceFor,
      amountNum,
      {
        tranType,
        tranDescriptions,
        tranRelatedId,
        tranRelatedModel,
      }
    );

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

//Transaction
exports.getTransactions = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const finalUserId = userId || req.body.userId;

    if (!finalUserId) {
      const err = new Error("Thiếu userId.");
      err.status = 400;
      throw err;
    }

    const result = await userService.getTransactions(req.query, finalUserId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getTransactionDetail = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const { tId } = req.params;

    const finalUserId = userId || req.body.userId;

    if (!finalUserId) {
      const err = new Error("Thiếu userId.");
      err.status = 400;
      throw err;
    }

    const result = await userService.getTransactionById(tId, finalUserId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
