const Account = require('../../models/user/Account');

// Tạo account mới
exports.createAccount = async (req, res) => {
  try {
    const { userName, password } = req.body;
    // 1. Kiểm tra các trường required, liệt kê chính xác trường thiếu
    const requiredFields = ['userName', 'password'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Missing required field(s): ${missingFields.join(', ')}` });
    }
    // 2. Kiểm tra định dạng email cho userName
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(userName)) {
      return res.status(400).json({ error: 'Invalid email format for userName' });
    }
    // 3. Kiểm tra userName đã tồn tại chưa
    const existed = await Account.findOne({ userName });
    if (existed) return res.status(400).json({ error: 'Account already exists with this userName' });
    // 4. Tạo account mới (password sẽ được hash tự động)
    const account = await Account.create({ userName, password });
    const { password: pw, ...accountWithoutPassword } = account.toObject();
    res.status(201).json({ account: accountWithoutPassword });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy danh sách tất cả account
exports.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find().select('-password');
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy chi tiết account theo id
exports.getAccountById = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id).select('-password');
    if (!account) return res.status(404).json({ error: 'Account not found' });
    res.json(account);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật password account
exports.updateAccount = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Missing required field: password' });
    // Chỉ cho phép đổi password
    const account = await Account.findByIdAndUpdate(req.params.id, { password }, { new: true });
    if (!account) return res.status(404).json({ error: 'Account not found' });
    res.json(account);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xóa account
exports.deleteAccount = async (req, res) => {
  try {
    const account = await Account.findByIdAndDelete(req.params.id);
    if (!account) return res.status(404).json({ error: 'Account not found' });
    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 