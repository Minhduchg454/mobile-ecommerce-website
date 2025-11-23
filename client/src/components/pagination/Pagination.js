import React, { memo, useMemo } from "react";
// Đảm bảo PagiItem đã được đặt trong thư mục components
import PagiItem from "./PagiItem";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";

// Hạn chế số lượng nút trang hiển thị (ví dụ: 5 nút trang + 2 nút điều hướng)
const SIBLING_COUNT = 1;

const Pagination = ({ totalCount, currentPage, limit, onPageChange }) => {
  // Tính toán tổng số trang
  const totalPages = Math.ceil(totalCount / limit);
  // 1. Logic tính phạm vi hiển thị đánh giá
  const rangeDisplay = useMemo(() => {
    if (!totalCount) return "0 - 0";
    const start = Math.min((currentPage - 1) * limit + 1, totalCount);
    const end = Math.min(currentPage * limit, totalCount);
    return `${start} - ${end}`;
  }, [totalCount, currentPage, limit]);

  // 2. Logic tính toán các nút trang [1, 2, ..., 5, 6, 7, ..., 10]
  const paginationRange = useMemo(() => {
    const totalPageNumbers = SIBLING_COUNT * 2 + 3; // Ví dụ: 1, ..., [2, 3], ..., 10

    // Trường hợp 1: Tổng số trang ít hơn giới hạn hiển thị (Không cần dấu '...')
    if (totalPageNumbers >= totalPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Tính toán các trang xung quanh trang hiện tại
    const leftSiblingIndex = Math.max(currentPage - SIBLING_COUNT, 2);
    const rightSiblingIndex = Math.min(
      currentPage + SIBLING_COUNT,
      totalPages - 1
    );

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    const lastPageIndex = totalPages;

    // Trường hợp 2: Chỉ hiển thị dấu '...' bên phải
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * SIBLING_COUNT; // [1, 2, 3, 4, 5, ...]
      const range = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...range, "...", lastPageIndex];
    }

    // Trường hợp 3: Chỉ hiển thị dấu '...' bên trái
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * SIBLING_COUNT;
      const start = lastPageIndex - rightItemCount + 1;
      const range = Array.from({ length: rightItemCount }, (_, i) => start + i);
      return [1, "...", ...range];
    }

    // Trường hợp 4: Hiển thị dấu '...' ở cả hai bên
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [1, "...", ...middleRange, "...", lastPageIndex];
    }

    return [1]; // Mặc định
  }, [totalPages, currentPage]);

  // 3. Xử lý trường hợp không cần phân trang
  if (!totalCount || totalPages <= 1) {
    return null;
  }

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <div className="flex w-full justify-center items-center gap-1">
      {/* Nút Prev */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirstPage}
        className="mx-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <MdArrowBackIos size={15} />
      </button>

      {/* Các nút trang */}
      {paginationRange?.map((el, index) =>
        typeof el === "number" ? (
          <PagiItem
            key={el}
            page={el}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
        ) : (
          <PagiItem key={index} isEllipsis={true} />
        )
      )}

      {/* Nút Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLastPage}
        className="mx-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <MdArrowForwardIos size={15} />
      </button>
    </div>
  );
};

export default memo(Pagination);
