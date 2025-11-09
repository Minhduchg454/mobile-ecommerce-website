import { OrderListCustomer } from "../../features/order/orderListCustomer";

export const OrderSucceededCustomerPage = () => {
  return (
    <div className="w-full animate-fadeIn">
      <OrderListCustomer statusOrder="Succeeded" />
    </div>
  );
};
