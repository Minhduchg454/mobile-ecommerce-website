import { useNavigate } from "react-router-dom";
import noPage from "../../assets/noPage.png";

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-[calc(100vh-100px)] flex flex-col items-center justify-center gap-3">
      <div className="rounded-3xl p-2 md:p-4 gap-2 flex flex-col justify-center items-center">
        <img src={noPage} alt="noPage" className="w-28 h-28 overflow-hidden" />
        <p className="text-lg font-medium mb-5">Trang web không tồn tại</p>
        <button
          onClick={() => navigate("/")}
          className="bg-button-bg-ac hover:bg-button-bg-hv text-white rounded-3xl px-4 py-1"
        >
          Quay về trang chủ
        </button>
      </div>
    </div>
  );
};
