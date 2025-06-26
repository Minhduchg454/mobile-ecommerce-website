const Role = require('../../models/user/Role');

// Tạo mới role
exports.createRole = async (req, res) => {
  try {
    const { roleName } = req.body;
    if (!roleName) return res.status(400).json({ success: false, mes: 'Missing roleName' });
    const existed = await Role.findOne({ roleName });
    if (existed) return res.status(400).json({ success: false, mes: 'Role already exists' });
    const role = await Role.create({ roleName });
    res.json({ success: true, role });
  } catch (err) {
    res.status(500).json({ success: false, mes: err.message });
  }
};

// Lấy tất cả role
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.json({ success: true, roles });
  } catch (err) {
    res.status(500).json({ success: false, mes: err.message });
  }
};

// Cập nhật role
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { roleName } = req.body;
    const updated = await Role.findByIdAndUpdate(id, { roleName }, { new: true });
    res.json({ success: !!updated, role: updated || 'Update failed' });
  } catch (err) {
    res.status(500).json({ success: false, mes: err.message });
  }
};

// Xóa role
exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Role.findByIdAndDelete(id);
    res.json({ success: !!deleted, mes: deleted ? 'Role deleted' : 'Delete failed' });
  } catch (err) {
    res.status(500).json({ success: false, mes: err.message });
  }
}; 