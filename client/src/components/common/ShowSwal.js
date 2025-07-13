import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const swalPresets = {
  default: {
    popup: "bg-white rounded-xl shadow-sm border",
    confirmButton:
      "focus:outline-none ml-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700",
    cancelButton:
      "focus:outline-none bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400",
  },
  success: {
    popup: "bg-white rounded-xl shadow-sm border",
    confirmButton:
      "focus:outline-none ml-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700",
    cancelButton:
      "focus:outline-none bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400",
  },
  danger: {
    popup: "bg-white rounded-xl shadow-sm border",
    confirmButton:
      "ml-3 focus:outline-none bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700",
    cancelButton:
      "focus:outline-none bg-gray-300 text-black px-4 py-2 border-none rounded hover:bg-gray-400",
  },
};

const ShowSwal = ({
  title = "Xác nhận",
  text = "Bạn có chắc chắn muốn tiếp tục?",
  icon = "question",
  showCancelButton,
  showConfirmButton,
  confirmText = "Đồng ý",
  cancelText = "Huỷ",
  timer,
  variant = "default",
}) => {
  const customClass = swalPresets[variant] || swalPresets["default"];

  const activeCustomClass = {
    popup: customClass.popup,
    confirmButton:
      showConfirmButton !== false ? customClass.confirmButton : undefined,
    cancelButton:
      showCancelButton !== false ? customClass.cancelButton : undefined,
  };

  return MySwal.fire({
    title,
    text,
    icon,
    showConfirmButton: showConfirmButton ?? true,
    showCancelButton: showCancelButton ?? false,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    timer,
    timerProgressBar: !!timer,
    reverseButtons: true,
    toast: false,
    position: "center",
    customClass: activeCustomClass,
    buttonsStyling: false,
  });
};

export default ShowSwal;
