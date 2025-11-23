import { UserBalance } from "../../features";
export const CustomerBalancePage = () => {
  return (
    <div className="animate-fadeIn">
      <UserBalance balanceFor={"customer"} />
    </div>
  );
};
