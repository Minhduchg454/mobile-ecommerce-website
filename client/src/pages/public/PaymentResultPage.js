// src/pages/PaymentResult.jsx
import { useSearchParams, Link } from "react-router-dom";
import { formatMoney } from "ultils/helpers";
import path from "ultils/path";
import { useSelector } from "react-redux";
import orderSuccess from "../../assets/order-success.png";

export const PaymentResult = () => {
  const [params] = useSearchParams();
  const status = params.get("status");
  const amount = params.get("amount");
  const { current } = useSelector((state) => state.user);
  const reason = params.get("reason") || params.get("code") || "unknown";
  const paymentMethod = params.get("paymentMethod");
  const buttonAction =
    "rounded-3xl px-2 py-1 border border border-black  text-black hover:bg-button-hv transition-transform text-sm md:text-base";

  return (
    <div className="min-h-[300px] lg:mx-auto lg:w-[800px] bg-white m-4 rounded-3xl p-2 shadow-md md:p-4 flex flex-col justify-center items-center animate-fadeIn">
      {status === "success" ? (
        <>
          <img src={orderSuccess} alt="" className="w-36 h-36 mb-2" />
          <h1 className="text-2xl font-bold mb-2">Đặt hàng thành công</h1>
          {amount && (
            <p className="mb-1 ">
              Tổng tiền hàng: {formatMoney(Number(amount))}đ
            </p>
          )}
          <p className="mb-1">Trạng thái đơn hàng: Chờ xác nhận</p>
          <p className="mb-4">Phương thức thanh toán: {paymentMethod}</p>
          <div className="flex gap-2 justify-center items-center">
            <Link to="/" className={buttonAction}>
              Trang chủ
            </Link>
            <Link
              to={`/${path.CUSTOMER}/${current?._id}/${path.C_ORDER}/?orderStatusName=Pending`}
              className={buttonAction}
            >
              Đơn mua
            </Link>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-red-600">
            Thanh toán thất bại
          </h1>
          <p className="mt-2">Lý do: {reason}</p>
          <Link
            to="/checkout"
            className="text-blue-600 underline mt-4 inline-block"
          >
            Thử lại
          </Link>
        </>
      )}
    </div>
  );
};
