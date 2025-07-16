import { useSelector } from "react-redux";

const useRole = () => {
  const { current, isLoggedIn } = useSelector((state) => state.user);
  const roleName = current?.roleId?.roleName?.toLowerCase();

  return {
    roleName,
    isLoggedIn,
    isAdmin: roleName === "admin",
    isUser: roleName === "user",
    current,
  };
};

export default useRole;
