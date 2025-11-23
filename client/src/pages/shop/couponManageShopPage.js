import { CouponManage } from "../../features";
import { useSelector } from "react-redux";

export const CouponShopManagePage = () => {
  const { current } = useSelector((s) => s.seller);
  const shopId = current?._id || "";
  return (
    <div className="animate-fadeIn">
      <CouponManage createdById={shopId} />
    </div>
  );
};
