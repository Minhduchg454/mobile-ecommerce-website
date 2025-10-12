import React from "react";
import { useNavigate } from "react-router-dom";
import path from "../../ultils/path";
//truyen destructuring props
export const ThemeCard = ({
  name,
  slug,
  image,
  color = "#000",
  description,
}) => {
  const navigate = useNavigate();
  const handleNavigate = () => {
    navigate(`/${path.PRODUCTS}?theme=${slug}`);
  };

  return (
    <div
      onClick={handleNavigate}
      className="relative cursor-pointer overflow-hidden w-[150px] h-[250px] md:w-[300px] md:h-[450px] flex-shrink-0 card-default p-3"
      style={{
        backgroundImage: `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/10"></div>

      {/* Nội dung chữ */}
      <div className="absolute top-3 left-3 z-10  w-[120px] md:w-[200px] transition-all duration-300">
        <h3
          className="font-bold text-lg md:text-xl drop-shadow-md"
          style={{ color: color }}
        >
          {name}
        </h3>
        <p
          className="text-sm leading-tight mt-3 text-justify"
          style={{ color: color }}
        >
          {description}
        </p>
      </div>
    </div>
  );
};
