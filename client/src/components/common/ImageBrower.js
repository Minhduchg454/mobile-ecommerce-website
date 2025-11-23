import React, { useEffect, useRef, useState, useCallback } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

export const ImageBrowser = ({
  images = [],
  initialIndex = 0,
  showThumbnails = true,
  loop = true,
  className = "", // gán kích thước ở cha, ví dụ: "w-full h-[360px]"
}) => {
  const [index, setIndex] = useState(
    Math.min(Math.max(initialIndex, 0), Math.max(images.length - 1, 0))
  );
  const containerRef = useRef(null);

  const go = useCallback(
    (dir) => {
      if (!images.length) return;
      setIndex((i) => {
        let n = i + dir;
        if (loop) n = (n + images.length) % images.length;
        else n = Math.min(Math.max(n, 0), images.length - 1);
        return n;
      });
    },
    [images.length, loop]
  );

  const goTo = (i) => setIndex(i);

  // keyboard
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onKey = (e) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [go]);

  // swipe
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let startX = 0,
      moved = 0;
    const onTouchStart = (e) => {
      startX = e.touches[0].clientX;
      moved = 0;
    };
    const onTouchMove = (e) => {
      moved = e.touches[0].clientX - startX;
    };
    const onTouchEnd = () => {
      const t = 40;
      if (moved > t) go(-1);
      if (moved < -t) go(1);
    };
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [go]);

  if (!images.length) {
    return (
      <div
        className={`relative w-full h-full grid place-items-center rounded-2xl bg-gray-50 ${className}`}
      >
        <span className="text-sm text-gray-500">Không có hình ảnh</span>
      </div>
    );
  }

  const arrowBase =
    "h-12 w-6 border rounded-full bg-gray-action/70 hover:scale-103 hover:bg-white shadow-md backdrop-blur-sm";

  return (
    // Grid 2 hàng: 1fr (ảnh) + auto (thumb)
    <div
      ref={containerRef}
      tabIndex={0}
      className={`grid grid-rows-[1fr_auto] w-full h-full rounded-2xl overflow-hidden outline-none min-h-0`}
      aria-label="Trình duyệt ảnh sản phẩm"
    >
      {/* Ảnh chính */}
      <div
        className={`relative w-full h-full  flex items-center justify-center overflow-hidden rounded-3xl ${className} `}
      >
        <img
          src={images[index]}
          alt={`image-${index + 1}`}
          className="max-w-full max-h-full object-contain"
          draggable={false}
        />

        {/* Nút điều hướng */}
        <button
          type="button"
          aria-label="Ảnh trước"
          onClick={() => go(-1)}
          className={`absolute left-3 top-1/2 -translate-y-1/2 ${arrowBase}`}
        >
          <MdKeyboardArrowLeft size={22} />
        </button>

        <button
          type="button"
          aria-label="Ảnh sau"
          onClick={() => go(1)}
          className={`absolute right-3 top-1/2 -translate-y-1/2 ${arrowBase}`}
        >
          <MdKeyboardArrowRight size={22} />
        </button>
      </div>

      {/* Thumbnail */}
      {showThumbnails && images.length > 1 && (
        <div className="w-full pt-2">
          <div className="mx-auto max-w-full overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 justify-center">
              {images.map((src, i) => {
                const active = i === index;
                return (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`shrink-0 p-0.5 rounded-xl border transition ${
                      active
                        ? "border-cyan-700"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={src}
                      alt={`thumb-${i + 1}`}
                      className={`h-10 md:h-18 w-auto object-cover rounded-lg ${
                        active ? "opacity-100" : "opacity-80"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
