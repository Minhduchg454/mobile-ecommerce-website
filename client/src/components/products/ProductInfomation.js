import React, { memo, useState, useMemo } from "react";
import { Votebar, Button, VoteOption, Comment } from "..";
import { renderStarFromNumber } from "../../ultils/helpers";
import { apiRatings, apiCreatePreview } from "../../apis";
import { useDispatch, useSelector } from "react-redux";
import { showModal } from "../../store/app/appSlice";
import Swal from "sweetalert2";
import path from "../../ultils/path";
import { useNavigate } from "react-router-dom";
import defaultAvatar from "../../assets/avatarDefault.png";

const ProductInfomation = ({ ratings, nameProduct, pid, rerender }) => {
  const [activedTab, setActivedTab] = useState(1);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoggedIn, current } = useSelector((state) => state.user);

  // Tính toán tổng số đánh giá & trung bình sao
  const { totalRatings, averageRating } = useMemo(() => {
    const total = ratings?.length || 0;
    const totalStars = ratings?.reduce((sum, r) => sum + r.previewRating, 0);
    const average = total > 0 ? (totalStars / total).toFixed(1) : 0;
    return {
      totalRatings: total,
      averageRating: average,
    };
  }, [ratings]);

  //Gửi đánh giá
  const handleSubmitVoteOption = async ({ comment, score }) => {
    if (!comment || !pid || !score) {
      alert("Vui lòng chọn sao và nhập nhận xét!");
      return;
    }
    await apiCreatePreview({
      userId: current._id,
      productVariationId: pid,
      previewComment: comment,
      previewRating: score,
    });
    dispatch(showModal({ isShowModal: false, modalChildren: null }));
    rerender();
  };

  const canVoteOrUpdate = useMemo(() => {
    //Nếu chưa đăng nhập
    if (!current) return false;

    //Danh sách không có ai, hoặc danh sách rỗng
    if (!ratings || ratings.length === 0) return true;

    //Neu khong tim thay nguoi dung trong danh sach => cho phep danh gia true
    const myRating = ratings.find((r) => r.userId?._id === current._id);
    if (!myRating) return true;

    const votedAt = new Date(myRating.createdAt).getTime();
    const now = Date.now();
    const diffInDays = (now - votedAt) / (1000 * 60 * 60 * 24);

    return diffInDays < 7;
  }, [ratings, current]);

  const daysLeftToEdit = useMemo(() => {
    if (!current || !ratings || ratings.length === 0) return null;

    const myRating = ratings.find((r) => r.userId?._id === current._id);
    if (!myRating) return null;

    const votedAt = new Date(myRating.createdAt).getTime();
    const now = Date.now();
    const diffInDays = (now - votedAt) / (1000 * 60 * 60 * 24);

    if (diffInDays < 7) return Math.ceil(7 - diffInDays);
    return null;
  }, [ratings, current]);

  //Mở form đánh giá nếu đã đăng nhập
  const handleVoteNow = () => {
    if (!isLoggedIn) {
      Swal.fire({
        text: "Vui lòng đăng nhập để đánh giá",
        cancelButtonText: "Hủy",
        confirmButtonText: "Đăng nhập",
        title: "Oops!",
        showCancelButton: true,
      }).then((rs) => {
        if (rs.isConfirmed) navigate(`/${path.LOGIN}`);
      });
      return;
    }

    if (!canVoteOrUpdate) {
      Swal.fire({
        icon: "info",
        title: "Hết hạn chỉnh sửa",
        text: "Bạn đã đánh giá sản phẩm này hơn 7 ngày trước và không thể thay đổi.",
      });
      return;
    }

    dispatch(
      showModal({
        isShowModal: true,
        modalChildren: (
          <VoteOption
            nameProduct={nameProduct}
            handleSubmitVoteOption={handleSubmitVoteOption}
          />
        ),
      })
    );
  };

  return (
    <div>
      <div className="w-full flex flex-col p-4 border rounded-xl shadow-md">
        <div className="flex border rounded-xl">
          <div className="flex-4 flex-col flex items-center justify-center ">
            <span className="font-semibold text-3xl">{averageRating}/5</span>
            <span className="flex items-center gap-1">
              {(renderStarFromNumber(averageRating) || []).map((el, index) => (
                <span key={index}>{el}</span>
              ))}
            </span>
            <span className="text-sm">
              {totalRatings} lượt đánh giá và nhận xét
            </span>
          </div>

          <div className="flex-6 flex gap-2 flex-col p-4">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratings?.filter(
                (r) => r.previewRating === star
              ).length;
              return (
                <Votebar
                  key={star}
                  number={star}
                  ratingTotal={totalRatings}
                  ratingCount={count}
                />
              );
            })}
          </div>
        </div>

        {/* Thiết lập quyền sau */}
        {/* <div className="p-4 flex items-center justify-center text-sm flex-col gap-2">
          <span>Ý kiến về sản phẩm</span>
          <Button handleOnClick={handleVoteNow}>ĐÁNH GIÁ NGAY!</Button>

          {daysLeftToEdit !== null && (
            <span className="text-xs italic text-gray-500">
              Bạn còn <strong>{daysLeftToEdit} ngày</strong> để chỉnh sửa đánh
              giá của mình
            </span>
          )}
        </div> */}

        <div className="flex flex-col gap-4">
          {Array.isArray(ratings) &&
            ratings.map((el) => (
              <Comment
                key={el._id}
                star={el.previewRating}
                updatedAt={el.updatedAt}
                comment={el.previewComment}
                image={el.userId?._id.avatar || defaultAvatar}
                name={
                  el.userId
                    ? `${el.userId?._id.lastName || ""} ${
                        el.userId?._id.firstName || ""
                      }`
                    : "Tài khoản đã xoá"
                }
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default memo(ProductInfomation);
