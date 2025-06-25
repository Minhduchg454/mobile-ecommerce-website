// controllers/shippingProviderController.js
const ShippingProvider = require('../../models/order/ShippingProvider');

// @desc    Lấy tất cả các nhà cung cấp vận chuyển
// @route   GET /api/shippingproviders
// @access  Public
exports.getAllShippingProviders = async (req, res) => {
    try {
        const shippingProviders = await ShippingProvider.find();
        res.status(200).json({
            success: true,
            count: shippingProviders.length,
            data: shippingProviders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Lấy một nhà cung cấp vận chuyển theo ID
// @route   GET /api/shippingproviders/:id
// @access  Public
exports.getShippingProviderById = async (req, res) => {
    try {
        const shippingProvider = await ShippingProvider.findById(req.params.id);

        if (!shippingProvider) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy nhà cung cấp vận chuyển'
            });
        }

        res.status(200).json({
            success: true,
            data: shippingProvider
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Tạo một nhà cung cấp vận chuyển mới
// @route   POST /api/shippingproviders
// @access  Private (thường sẽ cần xác thực và phân quyền)
exports.createShippingProvider = async (req, res) => {
    try {
        const { providerName, providerWebsite, providerHotline } = req.body;

        // Kiểm tra xem providerName đã tồn tại chưa
        const existingProvider = await ShippingProvider.findOne({ providerName });
        if (existingProvider) {
            return res.status(400).json({
                success: false,
                error: 'Tên nhà cung cấp đã tồn tại.'
            });
        }

        const newShippingProvider = await ShippingProvider.create({
            providerName,
            providerWebsite,
            providerHotline
        });

        res.status(201).json({
            success: true,
            data: newShippingProvider
        });
    } catch (error) {
        // Xử lý lỗi validation từ Mongoose
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                error: messages.join(', ')
            });
        }
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Cập nhật một nhà cung cấp vận chuyển
// @route   PUT /api/shippingproviders/:id
// @access  Private (thường sẽ cần xác thực và phân quyền)
exports.updateShippingProvider = async (req, res) => {
    try {
        let shippingProvider = await ShippingProvider.findById(req.params.id);

        if (!shippingProvider) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy nhà cung cấp vận chuyển'
            });
        }

        const { providerName } = req.body;

        // Nếu người dùng muốn thay đổi tên nhà cung cấp, kiểm tra xem tên mới đã tồn tại chưa
        if (providerName && providerName !== shippingProvider.providerName) {
            const existingProvider = await ShippingProvider.findOne({ providerName });
            if (existingProvider) {
                return res.status(400).json({
                    success: false,
                    error: 'Tên nhà cung cấp đã tồn tại.'
                });
            }
        }

        shippingProvider = await ShippingProvider.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // Trả về tài liệu đã cập nhật
            runValidators: true // Chạy lại các trình xác thực schema
        });

        res.status(200).json({
            success: true,
            data: shippingProvider
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                error: messages.join(', ')
            });
        }
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Xóa một nhà cung cấp vận chuyển
// @route   DELETE /api/shippingproviders/:id
// @access  Private (thường sẽ cần xác thực và phân quyền)
exports.deleteShippingProvider = async (req, res) => {
    try {
        const shippingProvider = await ShippingProvider.findById(req.params.id);

        if (!shippingProvider) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy nhà cung cấp vận chuyển'
            });
        }

        await shippingProvider.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};