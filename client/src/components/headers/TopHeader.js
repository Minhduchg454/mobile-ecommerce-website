import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import path from "ultils/path";
import { getCurrent } from "store/user/asyncActions"; //lay thong tin nguoi dung tu token
import { useSelector, useDispatch } from "react-redux";
import icons from "ultils/icons";
import { logout, clearMessage } from "store/user/userSlice"; //logout: dang xuat, clearMessage xoa thong bao loi
import Swal from "sweetalert2";

const { AiOutlineMail, AiOutlinePhone, AiOutlineClockCircle } = icons;

const TopHeaders = () => {
  const { isLoggedIn, current, mes } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  //Lay thong tin nguoi dung, tranh goi api qua som hoac lien tuc
  useEffect(() => {
    const setTimeoutId = setTimeout(() => {
      if (isLoggedIn) dispatch(getCurrent());
    }, 300);

    return () => {
      clearTimeout(setTimeoutId);
    };
  }, [dispatch, isLoggedIn]);

  //Xu ly neu co loi, thi chuyen ve trang dang nhap
  useEffect(() => {
    if (mes)
      Swal.fire("Oops!", mes, "info").then(() => {
        dispatch(clearMessage());
        navigate(`/${path.LOGIN}`);
      });
  }, [mes]);

  return (
    <div className="w-full bg-header-footer ">
      {/* Bên trái - Thông tin cửa hàng */}
      <div className="xl:w-main w-full m-auto  min-h-9 py-2 px-4 flex flex-wrap items-center justify-between text-xs text-black">
        <div className="hidden lg:flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1">
            <AiOutlineClockCircle size={14} />
            8:00AM - 23:00PM
          </span>
          <span className="hidden md:inline-block">|</span>
          <span className="flex items-center gap-1">
            <AiOutlinePhone size={14} /> 0909 567 999
          </span>
          <span className="hidden md:inline-block">|</span>
          <span className="flex items-center gap-1">
            <AiOutlineMail size={14} /> hotro@student.ctu.edu.vn
          </span>
        </div>

        {/* Bên phải - lời chào hoặc link đăng nhập */}
        <div className="w-full md:w-fit flex justify-end mr-1 md:mt-0">
          {isLoggedIn && current ? (
            <span className="text-xs italic">
              {current.roleId?.roleName === "admin"
                ? "Chào quản trị viên, chúc bạn một ngày làm việc hiệu quả"
                : "Chúc bạn một ngày mua sắm vui vẻ"}
            </span>
          ) : (
            <Link className="hover:text-gray-800" to={`/${path.LOGIN}`}>
              Đăng nhập hoặc Đăng ký
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopHeaders;
