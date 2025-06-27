# Refactor Guide: Unified User-Customer-Admin System

## Tổng quan
Dự án đã được refactor để hợp nhất User, Customer và Admin thành một hệ thống thống nhất, loại bỏ sự trùng lặp và phức tạp không cần thiết.

## Thay đổi chính

### 1. **Model Changes**
- **User Schema**: Mở rộng để bao gồm `shoppingCart` field
- **ShoppingCart**: Thêm `userId` field để liên kết trực tiếp với User
- **Customer Model**: Có thể loại bỏ sau khi migration hoàn tất
- **Admin Model**: Có thể loại bỏ sau khi migration hoàn tất

### 2. **Controller Changes**
- **userController.js**: Mở rộng để bao gồm tất cả customer và admin functions
- **customerController.js**: Có thể loại bỏ sau khi migration
- **adminController.js**: Có thể loại bỏ sau khi migration

### 3. **Routes Changes**
- **__user.js**: Thêm customer và admin routes vào user router
- Tất cả customer endpoints giờ đây nằm dưới `/api/user/customer/*`
- Tất cả admin endpoints giờ đây nằm dưới `/api/user/admin/*`

## API Endpoints Mới

### Authentication
```
POST /api/user/register     - Đăng ký user
POST /api/user/login        - Đăng nhập
```

### User Management
```
GET    /api/user/current    - Lấy thông tin user hiện tại
PUT    /api/user/current    - Cập nhật thông tin user
GET    /api/user/           - Lấy danh sách users (admin)
DELETE /api/user/:uid       - Xóa user (admin)
```

### Customer Management
```
POST   /api/user/customer                    - Tạo customer mới
GET    /api/user/customer/:id                - Lấy thông tin customer
GET    /api/user/customer/:id/cart           - Lấy giỏ hàng
GET    /api/user/customer/:id/orders         - Lấy đơn hàng
GET    /api/user/customer/:id/previews       - Lấy đánh giá
```

### Admin Management
```
POST   /api/user/admin                       - Tạo admin mới (admin only)
GET    /api/user/admin/:id                   - Lấy thông tin admin
PUT    /api/user/admin/current               - Cập nhật admin (admin only)
DELETE /api/user/admin/:id                   - Xóa admin (disabled - 403)
```

## Migration Process

### 1. Chạy Migration Script
```bash
cd server
node migrateCustomerData.js
```

### 2. Kiểm tra dữ liệu
- Đảm bảo tất cả customer data đã được chuyển sang User
- Đảm bảo tất cả admin data đã được chuyển sang User
- Kiểm tra shopping cart relationships
- Kiểm tra role assignments

### 3. Cập nhật Frontend
- Sử dụng các API endpoints mới
- Cập nhật các component sử dụng customer/admin API

## Lợi ích của Refactor

### ✅ **Đơn giản hóa**
- Chỉ một hệ thống authentication
- Ít trùng lặp code
- Dễ maintain và debug

### ✅ **Tính nhất quán**
- User experience thống nhất
- Dữ liệu không bị phân tán
- Quan hệ rõ ràng

### ✅ **Hiệu suất**
- Ít database queries
- Ít joins phức tạp
- Cache hiệu quả hơn

### ✅ **Bảo mật**
- Centralized authorization
- Role-based access control
- Consistent security policies

## Cấu trúc dữ liệu mới

```javascript
User {
  // Basic info
  firstName, lastName, email, mobile, avatar,
  
  // Authentication & Authorization
  roleId, statusUserId, userName,
  
  // Customer-specific (nếu role = 'customer')
  shoppingCart: ObjectId
}

ShoppingCart {
  userId: ObjectId,  // Reference to User
  totalPrice: Number
}
```

## Role-based Access Control

```javascript
// Role types
'customer' - Có thể mua hàng, xem giỏ hàng, đánh giá
'admin'    - Có thể quản lý hệ thống, tạo admin mới
'staff'    - Có thể quản lý sản phẩm, đơn hàng
```

## Lưu ý quan trọng

1. **Backup dữ liệu** trước khi chạy migration
2. **Test kỹ** các API endpoints mới
3. **Cập nhật documentation** cho team
4. **Monitor performance** sau khi deploy
5. **Kiểm tra role permissions** sau migration

## Rollback Plan

Nếu cần rollback:
1. Restore database từ backup
2. Revert code changes
3. Restart services

## Next Steps

1. ✅ Hoàn thành migration script
2. 🔄 Test migration trên staging
3. 🔄 Update frontend components
4. 🔄 Deploy to production
5. 🔄 Monitor và optimize
6. 🔄 Remove old Customer/Admin models (optional)

## Security Considerations

- Admin deletion is disabled via API (403 response)
- Role validation on all admin endpoints
- Centralized authentication and authorization
- Consistent error handling across all endpoints 