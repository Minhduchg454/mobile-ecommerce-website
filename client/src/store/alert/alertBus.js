/**
  •	Redux không nên chứa function (callback) vì không serializable.
	•	Nhưng với alert xác nhận (OK/Huỷ), bạn muốn chạy hành động khi bấm nút.
    •	Giải pháp: tạo một registry ngoài Redux (gọi là alertBus) để
    •	đăng ký callback theo một id duy nhất
    •	Khi người dùng bấm nút trong alert, GlobalGlassAlert sẽ lấy callback bằng id và gọi.
 */

// Map: id -> { onConfirm, onCancel, onClose }
// Map lưu callback theo id
const handlers = new Map();
let _id = 1;

// tạo id mới cho mỗi alert
export const nextAlertId = () => ++_id;

// đăng ký callback cho id
export const registerHandlers = (id, h) => {
  handlers.set(id, {
    onConfirm: h?.onConfirm,
    onCancel: h?.onCancel,
    onClose: h?.onClose,
  });
};

// lấy ra và xoá callback khi dùng xong
export const consumeHandlers = (id) => {
  const h = handlers.get(id);
  handlers.delete(id);
  return h || {};
};
