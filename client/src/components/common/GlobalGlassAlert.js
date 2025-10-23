import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GlassAlert } from "./GlassAlert";
import { showAlert } from "../../store/app/appSlice";
import { consumeHandlers } from "../../store/alert/alertBus";

export const GlobalGlassAlert = () => {
  const dispatch = useDispatch();
  const { isShowAlert, alertData } = useSelector((s) => s.app);

  // Auto close nếu có duration
  useEffect(() => {
    if (isShowAlert && alertData?.duration) {
      const timer = setTimeout(
        () => dispatch(showAlert(null)),
        alertData.duration
      );
      return () => clearTimeout(timer);
    }
  }, [isShowAlert, alertData?.duration, dispatch]);

  if (!isShowAlert) return null;

  const closeAnd = (kind) => () => {
    const { onConfirm, onCancel, onClose } = consumeHandlers(alertData?.id);
    try {
      if (kind === "confirm") onConfirm?.();
      else if (kind === "cancel") onCancel?.();
      else onClose?.();
    } finally {
      dispatch(showAlert(null));
    }
  };

  return (
    <GlassAlert
      open={isShowAlert}
      title={alertData?.title || "Thông báo"}
      message={alertData?.message || ""}
      variant={alertData?.variant || "default"}
      confirmText={alertData?.confirmText || "OK"}
      cancelText={alertData?.cancelText || "Huỷ"}
      showConfirmButton={alertData?.showConfirmButton !== false}
      showCancelButton={!!alertData?.showCancelButton}
      onConfirm={closeAnd("confirm")}
      onCancel={closeAnd("cancel")}
      onClose={closeAnd("close")}
    />
  );
};
