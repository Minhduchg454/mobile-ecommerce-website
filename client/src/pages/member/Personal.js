import { Button, InputForm } from "components";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import avatar from "assets/avatarDefault.png";
import { apiUpdateCurrent } from "apis";
import { getCurrent } from "store/user/asyncActions";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import withBaseComponent from "hocs/withBaseComponent";
import { FaLock, FaCheckCircle } from "react-icons/fa";
import { ConfirmModal, Loading } from "../../components";
import { useState } from "react";
import { showModal } from "store/app/appSlice";
import { ShowSwal } from "../../components";

const Personal = ({ navigate }) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    watch,
  } = useForm();
  const { current } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Reset form với dữ liệu hiện tại
  useEffect(() => {
    reset({
      firstName: current?.firstName,
      lastName: current?.lastName,
      mobile: current?.mobile,
      email: current?.email,
      avatar: current?.avatar,
      address: current?.address,
    });
  }, [current]);

  const handleUpdateInfor = async (data) => {
    const formData = new FormData();
    if (data.avatar?.length > 0) formData.append("avatar", data.avatar[0]);

    ["firstName", "lastName", "mobile", "address"].forEach((key) => {
      if (data[key]) formData.append(key, data[key]);
    });

    dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));

    try {
      const response = await apiUpdateCurrent(formData, current._id);

      if (response.success) {
        dispatch(getCurrent());
        setShowSuccessModal(true);
        setAvatarPreview(null);
        if (searchParams.get("redirect"))
          navigate(searchParams.get("redirect"));
      } else {
        toast.error(response.mes || "Cập nhật thất bại");
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi cập nhật. Vui lòng thử lại.");
      console.error("Update error:", error);
    } finally {
      dispatch(showModal({ isShowModal: false }));
    }
  };

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "avatar" && value.avatar?.length > 0) {
        const file = value.avatar[0];
        const reader = new FileReader();
        reader.onloadend = () => setAvatarPreview(reader.result);
        reader.readAsDataURL(file);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    if (showSuccessModal) {
      ShowSwal({
        title: "Cập nhật thành công",
        text: "",
        showCancelButton: false,
        showConfirmButton: false,
        timer: 2000,
        icon: "success",
      });

      setShowSuccessModal(false); // reset lại
    }
  }, [showSuccessModal]);

  const isBlocked = current?.isBlocked;

  return (
    <div className="w-full relative px-2">
      <form
        onSubmit={handleSubmit(handleUpdateInfor)}
        className="w-full mx-auto py-2 flex flex-col gap-4"
      >
        <div className="flex flex-col lg:flex-row justify-around gap-3">
          {/*Khối 1: Thông tin cá nhân */}
          <div className="flex flex-col gap-3">
            {/* Email (khóa) */}
            <div className="flex items-center">
              <label className="w-[120px] font-medium">Email:</label>
              <input
                readOnly
                tabIndex={-1}
                value={current?.email}
                className="bg-gray-100 text-gray-500 px-3 py-2 rounded-xl text-sm border border-gray-400 w-[300px] focus:outline-none focus:ring-0"
              />
            </div>

            {/* Họ và tên */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 flex items-center">
                <label className="w-[120px] font-medium">Họ:</label>
                <InputForm
                  register={register}
                  errors={errors}
                  id="lastName"
                  validate={{ required: "Không được để trống" }}
                />
              </div>
              <div className="flex-1 flex items-center">
                <label className="lg:w-[50px] w-[120px] font-medium">
                  Tên:
                </label>
                <InputForm
                  register={register}
                  errors={errors}
                  id="firstName"
                  validate={{ required: "Không được để trống" }}
                />
              </div>
            </div>

            {/* Số điện thoại */}
            <div className="flex items-center">
              <label className="w-[120px] font-medium">SĐT:</label>
              <InputForm
                register={register}
                errors={errors}
                id="mobile"
                validate={{
                  required: "Không được để trống",
                  pattern: {
                    value:
                      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4}$/gm,
                    message: "Số điện thoại không hợp lệ.",
                  },
                }}
              />
            </div>

            {/* Địa chỉ */}
            <div className="flex items-center">
              <label className="w-[120px] font-medium">
                Địa chỉ giao hàng:
              </label>
              <InputForm
                register={register}
                errors={errors}
                id="address"
                validate={{ required: "Không được để trống" }}
              />
            </div>

            {/* Trạng thái tài khoản */}
            <div className="flex items-center">
              <label className="w-[120px] font-medium">Trạng thái:</label>
              <div className="flex items-center gap-2 text-sm">
                {isBlocked ? (
                  <>
                    <FaLock className="text-red-500" />
                    <span className="text-red-500">Đã khóa</span>
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="text-green-600" />
                    <span className="text-green-600">Đang hoạt động</span>
                  </>
                )}
              </div>
            </div>

            {/* Vai trò */}
            <div className="flex items-center">
              <label className="w-[120px] font-medium">Vai trò:</label>
              <span>
                {+current?.role === 1945 ? "Quản trị viên" : "Thành viên"}
              </span>
            </div>

            {/* Nút cập nhật */}
            <div className="w-full flex justify-center mt-4">
              <Button type="submit">Cập nhật thông tin</Button>
            </div>
          </div>

          {/*Khối 2: Đường kẻ mờ */}
          <div className="w-[1px] bg-gray-300 hidden md:block" />

          {/*Khối 3 Avatar */}
          <div className="flex flex-col items-center gap-3">
            <label htmlFor="file" className="cursor-pointer">
              <img
                src={avatarPreview || current?.avatar || avatar}
                alt="avatar"
                className="aspect-square w-32 object-cover rounded-full border border-gray-300"
              />
            </label>
            <input type="file" id="file" {...register("avatar")} hidden />
            <span className="text-sm text-gray-600">
              Chọn để cập nhật ảnh đại diện
            </span>
          </div>
        </div>
      </form>
    </div>
  );
};

export default withBaseComponent(Personal);
