import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckOut1 } from "../../features";

export const CheckOutPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const raw = sessionStorage.getItem("checkoutPayload");
    if (!raw) {
      navigate("/");
      return;
    }
    const payload = JSON.parse(raw);
    setItems(payload.selectedItems);
  }, []);
  return (
    <div className="animate-fadeIn">
      <CheckOut1 items={items} />
    </div>
  );
};
