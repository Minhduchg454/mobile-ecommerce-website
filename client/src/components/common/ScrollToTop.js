// components/ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Cách 1: Ép cuộn ngay lập tức
    window.scrollTo(0, 0);

    // Cách 2: Dùng requestAnimationFrame để đảm bảo sau khi render
    const scroll = () => {
      window.scrollTo(0, 0);
    };
    const raf = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(raf);
  }, [pathname, search]);

  return null;
};
