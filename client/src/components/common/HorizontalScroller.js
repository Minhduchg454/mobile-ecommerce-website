import React, { useRef, useLayoutEffect, useState, useMemo } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import clsx from "clsx";

/**
 * @param {Object[]} items
 * @param {(item:any, idx:number)=>JSX.Element} renderItem
 * @param {(item:any, idx:number)=>string|number} keyExtractor
 * @param {number} stepRatio
 * @param {string} className
 * @param {string} contentClassName
 * @param {boolean} showArrowsOnHover
 * @param {number} edgePadding   padding hai bên của scroller (px), default 0 để bám trái
 */
export function HorizontalScroller({
  items = [],
  renderItem,
  keyExtractor,
  stepRatio = 0.8,
  className = "",
  contentClassName = "",
  showArrowsOnHover = true,
  edgePadding = 0,
  isLeft = true,
}) {
  const scrollerRef = useRef(null);
  const [isOverflow, setIsOverflow] = useState(false);

  // đo overflow mỗi khi items đổi hoặc container resize
  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const check = () => setIsOverflow(el.scrollWidth > el.clientWidth + 1);
    check();

    // quan sát resize để cập nhật chính xác
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [items]);

  const scrollBy = (dir = 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = Math.max(240, Math.floor(el.clientWidth * stepRatio));
    el.scrollTo({ left: el.scrollLeft + dir * step, behavior: "smooth" });
  };

  const arrowBase =
    "transition-opacity duration-200 absolute top-1/2 -translate-y-1/2 z-10 " +
    "h-12 w-6 rounded-full bg-white/60 hover:bg-white shadow-md backdrop-blur-sm " +
    (showArrowsOnHover ? "opacity-0 group-hover:opacity-100" : "");

  // lớp snap: chỉ bật khi overflow để tránh “lệch” khi ít item
  const snapClasses = useMemo(
    () => (isOverflow ? "snap-x snap-mandatory scroll-smooth" : ""),
    [isOverflow]
  );

  return (
    <div
      className={`relative ${showArrowsOnHover ? "group" : ""} ${className}`}
    >
      {/* Scroller */}
      <div
        ref={scrollerRef}
        style={{ paddingLeft: edgePadding, paddingRight: edgePadding }}
        className={`flex gap-4 md:gap-6 overflow-x-auto ${snapClasses} 
                    scrollbar-thin  scroll-hidden py-2 md:py-4
                    ${contentClassName}`}
      >
        {items.map((item, idx) => (
          <div
            key={keyExtractor ? keyExtractor(item, idx) : idx}
            className={`flex-shrink-0 ${
              isLeft ? "first:ml-2 first:md:ml-28" : ""
            }`}
          >
            {renderItem(item, idx)}
          </div>
        ))}
      </div>

      {/* Arrows: ẩn hoàn toàn khi không overflow để tránh “đẩy cảm giác layout” */}
      {isOverflow && (
        <>
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Prev"
            className={`${arrowBase} left-2 flex items-center justify-center`}
          >
            <FaChevronLeft />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Next"
            className={`${arrowBase} right-2 flex items-center justify-center`}
          >
            <FaChevronRight />
          </button>
        </>
      )}
    </div>
  );
}
