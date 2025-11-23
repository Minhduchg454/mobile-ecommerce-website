import { OrdersShopManage } from "../../features";
export const OrdersCancelShopManagePage = () => {
  return (
    <div className="animate-fadeIn">
      <OrdersShopManage statusOrder="Cancelled" />
    </div>
  );
};
