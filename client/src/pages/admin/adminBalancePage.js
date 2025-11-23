import { UserBalance } from "../../features";
export const AdminBalancePage = () => {
  return (
    <div className="animate-fadeIn">
      <UserBalance balanceFor={"admin"} />
    </div>
  );
};
