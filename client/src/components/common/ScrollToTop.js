import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0); // Cuộn lên đầu trang
  }, [pathname]); // Mỗi khi pathname thay đổi (tức là route thay đổi)

  return null;
};
