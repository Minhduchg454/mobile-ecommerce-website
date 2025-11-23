import { UserBalance } from "../../features";
export const ShopBalancePage = () => {
  return (
    <div className="animate-fadeIn">
      <UserBalance balanceFor={"shop"} />
    </div>
  );
};
