import React, { Fragment, memo, useEffect, useState } from "react"
import logo from "assets/logo.jpg"
import icons from "ultils/icons"
import { Link } from "react-router-dom"
import path from "ultils/path"
import { useDispatch, useSelector } from "react-redux"
import { logout } from "store/user/userSlice"
import withBaseComponent from "hocs/withBaseComponent"
import { showCart } from "store/app/appSlice"

const { RiPhoneFill, MdEmail, BsHandbagFill, FaUserCircle } = icons
const Header = () => {
  const dispatch = useDispatch()
  const { current } = useSelector((state) => state.user)
  // Log giá trị current để debug đăng nhập
  console.log('Header user.current:', current);
  const [isShowOption, setIsShowOption] = useState(false)
  useEffect(() => {
    const handleClickoutOptions = (e) => {
      const profile = document.getElementById("profile")
      if (!profile?.contains(e.target)) setIsShowOption(false)
    }

    document.addEventListener("click", handleClickoutOptions)

    return () => {
      document.removeEventListener("click", handleClickoutOptions)
    }
  }, [])

  return (
    <div className="md:w-main w-full flex justify-between md:h-[110px] py-[8px]">
      <Link className="w-fit h-fit px-4" to={`/${path.HOME}`}>
        <img
          src={logo}
          alt="logo"
          className="h-[20px] md:w-[200px] md:h-fit object-contain"
        />
      </Link>
      <div className="flex text-[13px] py-[28px]">
        <div className="md:flex hidden flex-col px-6 border-r items-center">
          <span className="flex gap-4 items-center">
            <RiPhoneFill color="red" />
            <span className="font-semibold">0123456789</span>
          </span>
          <span>Mở cửa từ 8:00AM - 23:00PM</span>
        </div>
        <div className="md:flex hidden flex-col items-center px-6 border-r">
          <span className="flex gap-4 items-center">
            <MdEmail color="red" />
            <span className="font-semibold">hotro@student.ctu.edu.vn</span>
          </span>
          <span>Hỗ trợ 24/7</span>
        </div>
        {current && (
          // Nếu current tồn tại, coi như đã đăng nhập
          <Fragment>
            <div
              onClick={() => dispatch(showCart())}
              className="cursor-pointer flex items-center justify-center gap-2 px-6 border-r"
            >
              <span className="relative md:hidden inline-block">
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 flex items-center justify-center text-[10px] text-white rounded-full">
                  {current?.cart?.length || 0}
                </span>
                <BsHandbagFill size={20} color="red" />
              </span>
              <span className="hidden md:inline-block">{`${current?.cart?.length || 0
                } item(s)`}</span>
            </div>
            <div
              className="flex cursor-pointer items-center justify-center px-6 gap-2 relative"
              onClick={() => setIsShowOption((prev) => !prev)}
              id="profile"
            >
              <FaUserCircle size={20} color="red" />
              <span className="hidden md:inline-block">Tài khoản</span>
              {isShowOption && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-full flex-col flex right-4 md:left-[16px] bg-gray-100 border md:min-w-[150px] py-2"
                >
                  <Link
                    className="p-2 w-full hover:bg-sky-100"
                    to={`/${path.MEMBER}/${path.PERSONAL}`}
                  >
                    Thông tin cá nhân
                  </Link>
                  {+current.role === 1945 && (
                    <Link
                      className="p-2 w-full hover:bg-sky-100"
                      to={`/${path.ADMIN}/${path.DASHBOARD}`}
                    >
                      Quản lý cửa hàng
                    </Link>
                  )}
                  <span
                    onClick={() => dispatch(logout())}
                    className="p-2 w-full hover:bg-sky-100"
                  >
                    Đăng xuất
                  </span>
                </div>
              )}
            </div>
          </Fragment>
        )}
      </div>
    </div>
  )
}

export default Header
