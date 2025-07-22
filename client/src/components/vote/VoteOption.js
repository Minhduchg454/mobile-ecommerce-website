import React, { memo, useRef, useEffect, useState } from "react";
import logo from "assets/logo.jpg";
import { voteOptions } from "ultils/contants";
import { AiFillStar } from "react-icons/ai";
import { Button } from "components";
import { useDispatch } from "react-redux";
import { showModal } from "store/app/appSlice";

const VoteOption = ({ nameProduct, handleSubmitVoteOption, pvid }) => {
  const modalRef = useRef();
  const [chosenScore, setChosenScore] = useState(null);
  const dispatch = useDispatch();
  const [comment, setComment] = useState("");
  const [score, setScore] = useState(null);

  const handleClose = () => {
    dispatch(showModal({ isShowModal: false, modalChildren: null }));
  };

  useEffect(() => {
    modalRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
  }, []);
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      ref={modalRef}
      className="bg-white w-[700px] p-4 flex-col gap-4 flex items-center justify-center rounded-xl"
    >
      <h2 className="text-center text-medium text-lg">{`Đánh giá sản phẩm ${nameProduct}`}</h2>
      <textarea
        className="form-textarea rounded-xl w-full placeholder:text-md placeholder:text-gray-500 text-md"
        placeholder="Nhập vào..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      ></textarea>
      <div className="w-full flex flex-col gap-4 text-md">
        <p>Bạn cảm thấy sản phẩm này như thế nào?</p>
        <div className="flex justify-center gap-4 items-center">
          {voteOptions.map((el) => (
            <div
              className="w-[100px] bg-gray-200 cursor-pointer rounded-xl p-1 h-[80px] flex items-center justify-center flex-col gap-2"
              key={el.id}
              onClick={() => {
                setChosenScore(el.id);
                setScore(el.id);
              }}
            >
              {Number(chosenScore) && chosenScore >= el.id ? (
                <AiFillStar color="orange" size={24} />
              ) : (
                <AiFillStar color="gray" size={24} />
              )}
              <span>{el.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full flex justify-end gap-3">
        <button onClick={handleClose} className="w-[100px]">
          Thoát
        </button>
        <button
          onClick={() => handleSubmitVoteOption({ comment, score, pvid })}
          className="w-[100px] border bg-[#00AFFF] rounded-xl p-2 text-white"
        >
          Gửi
        </button>
      </div>
    </div>
  );
};

export default memo(VoteOption);
