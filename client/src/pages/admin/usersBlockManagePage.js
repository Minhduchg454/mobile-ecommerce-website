import { UserManage } from "../../features";
export const UsersBlockManagePage = () => {
  return (
    <div className="animate-fadeIn">
      <UserManage sortDir="block" sortKey="statusName" />
    </div>
  );
};
