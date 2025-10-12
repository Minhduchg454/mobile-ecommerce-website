import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const swalPresets = {
  default: {
    popup: "!bg-white/60 !backdrop-blur-sm !rounded-2xl !shadow-sm !border",
    confirmButton:
      "!ml-3 !bg-blue-600 !text-white !px-4 !py-2 !rounded-2xl hover:bg-blue-700",
    cancelButton:
      "!bg-gray-300 !text-black !px-4 !py-2 !rounded-2xl hover:bg-gray-400",
  },
  success: {
    popup: "!bg-white/60 !backdrop-blur-sm !rounded-2xl !shadow-sm !border",
    confirmButton:
      "!ml-3 !bg-green-600 !text-white !px-4 !py-2 !rounded-2xl hover:bg-green-700",
    cancelButton:
      "!bg-gray-300 !text-black !px-4 !py-2 !rounded-2xl hover:bg-gray-400",
  },
  danger: {
    popup: "!bg-white/60 !backdrop-blur-sm !rounded-2xl !shadow-sm !border",
    confirmButton:
      "!ml-3 !bg-red-600 !text-white !px-4 !py-2 !rounded-2xl hover:bg-red-700",
    cancelButton:
      "!bg-gray-300 !text-black !px-4 !py-2 !rounded-2xl hover:bg-gray-400",
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
