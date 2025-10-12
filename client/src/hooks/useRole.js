import { useSelector } from "react-redux";

const useRole = () => {
  const { current, isLoggedIn } = useSelector((state) => state.user);
  const roleName = current?.roleId?.roleName?.toLowerCase();

  return {
    roleName,
    isLoggedIn,
    isAdmin: current?.roles?.includes("admin"),
    isUser: current?.roles?.includes("customer"),
    isShop: current?.roles?.includes("shop"),
  };
};

export default useRole;
