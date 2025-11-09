import { useEffect } from "react";
import { APP_INFO } from "../../ultils/contants";
import shopRegister from "../../assets/shop-register.png";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import path from "../../ultils/path";

export const ManageSeller = () => {
  const { current } = useSelector((s) => s.user);
  const navigate = useNavigate();
  const isShop = current?.roles?.includes("shop");

  useEffect(() => {
    if (isShop) {
      navigate(`/${path.SELLER}/${current._id}/${path.S_DASHBOARD}`);
    }
  }, [isShop, navigate]);

  return (
    <div className="bg-white rounded-3xl p-2 md:p-4 flex flex-col items-center justify-center w-full h-[500px]">
      <img src={shopRegister} alt="" className="w-36 h-36 mb-2" />
      <p>Chào mừng đến với {APP_INFO.NAME}</p>
      <p className="text-center italic text-gray-400 mb-2">
        Vui lòng cung cấp thông tin để thành lập tài khoản người bán trên{" "}
        {APP_INFO.NAME}
      </p>
      <button
        onClick={() => navigate(`/${path.REGISTER_SHOP}`)}
        className="bg-button-bg-ac px-2 py-1 rounded-3xl text-white hover:bg-button-bg-hv"
      >
        Đăng ký bán hàng
      </button>
    </div>
  );
};
