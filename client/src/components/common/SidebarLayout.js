import React, { Fragment, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { AiOutlineCaretDown, AiOutlineCaretRight } from "react-icons/ai";
import { RiShareForwardLine } from "react-icons/ri";

const activedStyle =
  "px-4 py-2 flex items-center gap-2 bg-blue-selected text-white rounded-xl border border-blue-selected";
const notActivedStyle =
  "px-4 py-2 flex items-center gap-2 hover:bg-blue-100 rounded-xl transition-all";

const SidebarLayout = ({
  logo,
  title,
  sidebarItems = [],
  showBackHome = true,
}) => {
  const navigate = useNavigate();
  const [actived, setActived] = useState([]);

  const handleShowTabs = (tabID) => {
    if (actived.includes(tabID))
      setActived((prev) => prev.filter((el) => el !== tabID));
    else setActived((prev) => [...prev, tabID]);
  };

  return (
    <div className="bg-gray-sidebar h-full p-4 shadow">
      {/* Logo + tiêu đề */}
      <Link
        to="/"
        className="flex flex-col justify-center items-center p-5 gap-2 "
      >
        <img
          src={logo}
          alt="logo"
          className="w-[200px] h-[80px] object-contain"
        />
        <p className="font-bold">{title}</p>
      </Link>

      {/* Menu điều hướng */}
      <div>
        {sidebarItems.map((el) => (
          <Fragment key={el.id}>
            {el.type === "SINGLE" && (
              <NavLink
                to={el.path}
                className={({ isActive }) =>
                  clsx(isActive ? activedStyle : notActivedStyle)
                }
              >
                <span>{el.icon}</span>
                <span>{el.text}</span>
              </NavLink>
            )}

            {el.type === "PARENT" && (
              <div
                onClick={() => handleShowTabs(el.id)}
                className="flex flex-col"
              >
                <div className="flex items-center justify-between px-4 py-2 rounded-xl hover:bg-blue-100 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span>{el.icon}</span>
                    <span>{el.text}</span>
                  </div>
                  {actived.includes(el.id) ? (
                    <AiOutlineCaretRight />
                  ) : (
                    <AiOutlineCaretDown />
                  )}
                </div>
                {actived.includes(el.id) && (
                  <div className="flex flex-col">
                    {el.submenu.map((item, idx) => (
                      <NavLink
                        key={idx}
                        to={item.path}
                        onClick={(e) => e.stopPropagation()}
                        className={({ isActive }) =>
                          clsx(
                            isActive ? activedStyle : notActivedStyle,
                            "pl-16"
                          )
                        }
                      >
                        {item.text}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Fragment>
        ))}

        {/* Nút về trang chủ */}
        {showBackHome && (
          <div onClick={() => navigate(`/`)} className={notActivedStyle}>
            <span>
              <RiShareForwardLine />
            </span>
            <span>Về trang chủ</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarLayout;
