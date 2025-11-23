import React, { memo, useState, useMemo } from "react";
import { Votebar, Comment, Pagination } from "../../components"; // Đảm bảo đã import Pagination
import { renderStarFromNumber } from "../../ultils/helpers";
import defaultAvatar from "../../assets/avatarDefault.png";
import clsx from "clsx"; // Cần import clsx

const ProductInfomation = ({
  previews,
  productRateAvg,
  productRateCount,
  reviewPage,
  reviewLimit,
  reviewTotalCount,
  onPageChange,
  reviewSort,
  setReviewSort,
}) => {
  // Tính toán tổng số trang
  const totalPages = Math.ceil(reviewTotalCount / reviewLimit);

  const sortOption = [
    { label: "Tất cả", filterKey: "sort", filterValue: "newest" },
    { label: "5 sao", filterKey: "previewRate", filterValue: 5 },
    { label: "4 sao", filterKey: "previewRate", filterValue: 4 },
    { label: "3 sao", filterKey: "previewRate", filterValue: 3 },
    { label: "2 sao", filterKey: "previewRate", filterValue: 2 },
    { label: "1 sao", filterKey: "previewRate", filterValue: 1 },
    { label: "Có hình ảnh/video", filterKey: "isMedia", filterValue: true },
  ];

  // HÀM XỬ LÝ KHI CHỌN LỌC/SẮP XẾP
  const handleSort = (option) => {
    let newSort = {};

    if (option.filterKey === "sort" && option.filterValue === "newest") {
      newSort = { sort: "newest" };
    } else if (option.filterKey === "sort") {
      newSort = { sort: option.filterValue };
    } else {
      newSort = {
        sort: "newest",
        [option.filterKey]: option.filterValue,
      };
    }

    setReviewSort(newSort);
    onPageChange(1);
  };

  // HÀM KIỂM TRA NÚT NÀO ĐANG ĐƯỢC CHỌN (để gắn class active)
  const isOptionActive = (option) => {
    if (option.filterKey === "sort" && option.filterValue === "newest") {
      const hasFilter = reviewSort.previewRate || reviewSort.isMedia;
      return !hasFilter;
    }
    return reviewSort[option.filterKey] === option.filterValue;
  };
  return (
    <div>
      <div className="w-full flex flex-col gap-2 bg-white rounded-3xl p-2 md:p-4 shadow-md">
        {/* PHẦN VOTER BAR/THÔNG TIN TỔNG QUAN */}
        <div className="p-2 md:p-4 flex items-center justify-around border rounded-3xl bg-white mb-2 md:mb-4">
          <div className="flex-col flex items-center justify-center ">
            <span className="font-semibold text-xl md:text-2xl">
              {Number(productRateAvg).toFixed(1)} trên 5.0
            </span>
            <span className="flex items-center gap-1">
              {(renderStarFromNumber(productRateAvg) || []).map((el, index) => (
                <span key={index}>{el}</span>
              ))}
            </span>
            <span className="text-xs md:text-sm">
              {productRateCount} lượt đánh giá và nhận xét
            </span>
          </div>

          <div className="flex flex-wrap gap-2 justify-start items-center p-4">
            {sortOption.map((it, idx) => (
              <button
                key={idx}
                onClick={() => handleSort(it)}
                className={clsx(
                  "border rounded-3xl px-3 py-1 text-sm md:text-base cursor-pointer transition-colors",
                  isOptionActive(it)
                    ? "border-[2px] text-button-bg-ac border-button-bg-ac shadow-md"
                    : ""
                )}
              >
                {it.label}
              </button>
            ))}
          </div>
        </div>

        {/* PHẦN DANH SÁCH BÌNH LUẬN VÀ PHÂN TRANG */}
        <div className="flex flex-col gap-2 px-2">
          {/* 1. HIỂN THỊ DANH SÁCH BÌNH LUẬN (đã được phân trang) */}
          {Array.isArray(previews) &&
            previews.map((el) => (
              <Comment
                key={el._id}
                star={el.previewRate}
                updatedAt={el.updatedAt}
                images={el.previewImages}
                videos={el.previewVideos}
                comment={el.previewComment}
                variantName={el.pvName || ""}
                avatar={el.customerId?._id?.userAvatar || defaultAvatar}
                name={
                  el.customerId
                    ? `${el.customerId?._id?.userLastName || ""} ${
                        el.customerId?._id?.userFirstName || ""
                      }`
                    : "Tài khoản đã xoá"
                }
              />
            ))}

          {/* Hiển thị thông báo nếu không có đánh giá */}
          {reviewTotalCount === 0 && (
            <p className="text-gray-500 italic text-center py-4">
              Chưa có đánh giá nào được tìm thấy.
            </p>
          )}

          {/* 2. HIỂN THỊ PHÂN TRANG */}
          {reviewTotalCount > 0 && totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination
                currentPage={reviewPage}
                totalCount={reviewTotalCount}
                onPageChange={onPageChange}
                limit={reviewLimit}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(ProductInfomation);
