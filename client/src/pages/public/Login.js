import React, { useState, useCallback, useEffect } from "react"
import { apiRegister, apiLogin } from "apis/user"
import Swal from "sweetalert2"
import { useNavigate, Link, useSearchParams } from "react-router-dom"
import path from "ultils/path"
import { login } from "store/user/userSlice"
import { showModal } from "store/app/appSlice"
import { useDispatch, useSelector } from "react-redux"
import { getCurrent } from 'store/user/asyncActions';
// import { validate } from "ultils/helpers"
import { FaUser, FaLock, FaEnvelope, FaPhone, FaEye, FaEyeSlash, FaMobileAlt, FaLaptop, FaTabletAlt, FaHeadphones } from 'react-icons/fa';

const DEFAULT_ROLE_ID = "685c40cb714483a0482a4569"; // id của role customer
const DEFAULT_STATUS_ID = "685c40cb714483a0482a456b"; // id của status active

const Login = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [payload, setPayload] = useState({
    email: "",
    password: "",
    firstname: "",
    lastname: "",
    mobile: "",
  })
  // const [invalidFields, setInvalidFields] = useState([])
  const [isRegister, setIsRegister] = useState(false)
  const [searchParams] = useSearchParams()
  const [showPassword, setShowPassword] = useState(false);
  const resetPayload = () => {
    setPayload({
      email: "",
      password: "",
      firstname: "",
      lastname: "",
      mobile: "",
    })
  }
  const handleInput = (e) => {
    setPayload(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }
  const handleSubmit = useCallback(async () => {
    const { firstname, lastname, mobile, ...data } = payload
    // const invalids = isRegister
    //   ? validate(payload, setInvalidFields)
    //   : validate(data, setInvalidFields)
    // if (invalids === 0) {
      if (isRegister) {
        dispatch(showModal({ isShowModal: true, modalChildren: <div>Đang xử lý...</div> }))
        const response = await apiRegister({
          firstName: payload.firstname,
          lastName: payload.lastname,
          email: payload.email,
          mobile: payload.mobile,
          password: payload.password,
        })
        dispatch(showModal({ isShowModal: false, modalChildren: null }))
        if (response.success) {
          setIsRegister(false)
          resetPayload()
          Swal.fire("Thành công!", "Đăng ký thành công, hãy đăng nhập.", "success")
        } else {
          // Luôn show lỗi chi tiết từ backend (mes hoặc error)
          Swal.fire("Oops!", response.mes || response.error || "Đăng ký thất bại!", "error")
        }
      } else {
        const rs = await apiLogin(data)
        console.log('API login response:', rs);
        let token = rs.token || rs.accessToken
        const user = rs.user || rs.userData
        // Đảm bảo token là string hợp lệ
        if (token && typeof token !== 'string') token = String(token)
        if (rs.success && token && user) {
          dispatch(
            login({
              isLoggedIn: true,
              token,
              userData: user,
            })
          )
          // Gọi luôn getCurrent để cập nhật current ngay sau khi login
          dispatch(getCurrent());
          // Log trước khi chuyển trang
          console.log('Trước navigate, Redux user state:', userState);
          if (searchParams.get("redirect")) {
            console.log('Chuyển trang đến:', searchParams.get("redirect"));
            navigate(searchParams.get("redirect"))
          } else {
            console.log('Chuyển trang đến:', `/${path.HOME}`);
            navigate(`/${path.HOME}`)
          }
          // Log sau khi gọi navigate (sẽ không chạy nếu navigate chuyển trang thành công)
          console.log('Đã gọi navigate');
        } else {
          Swal.fire("Oops!", rs.mes || "Đăng nhập thất bại!", "error")
        }
      }
    // }
  }, [payload, isRegister, dispatch, navigate, searchParams])

  const userState = useSelector(state => state.user);
  useEffect(() => {
    console.log('Redux user state:', userState);
  }, [userState]);

  useEffect(() => { resetPayload() }, [isRegister])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#00afff] relative overflow-hidden">
      {/* Icon trang trí */}
      <FaMobileAlt className="absolute left-8 top-8 text-white/30 text-6xl animate-bounce-slow" />
      <FaLaptop className="absolute right-8 top-16 text-white/20 text-7xl animate-float" />
      <FaTabletAlt className="absolute left-12 bottom-12 text-white/20 text-5xl animate-float2" />
      <FaMobileAlt className="absolute right-16 bottom-8 text-white/10 text-8xl animate-bounce-slow2" />
      <FaHeadphones className="absolute left-1/2 -translate-x-1/2 top-4 text-white/30 text-5xl animate-float" />
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl flex flex-col items-center z-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-8 tracking-wide drop-shadow">{isRegister ? "Đăng ký tài khoản" : "Đăng nhập"}</h1>
        <form className="w-full flex flex-col gap-4" onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
          {isRegister && (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <FaUser className="absolute left-3 top-3 text-gray-400" />
                <input type="text" name="firstname" value={payload.firstname} onChange={handleInput} placeholder="Họ" className="pl-10 py-2 rounded border border-gray-200 bg-white text-gray-800 placeholder-gray-400 w-full focus:ring-2 focus:ring-cyan-200 outline-none" />
              </div>
              <div className="relative flex-1">
                <FaUser className="absolute left-3 top-3 text-gray-400" />
                <input type="text" name="lastname" value={payload.lastname} onChange={handleInput} placeholder="Tên" className="pl-10 py-2 rounded border border-gray-200 bg-white text-gray-800 placeholder-gray-400 w-full focus:ring-2 focus:ring-cyan-200 outline-none" />
              </div>
            </div>
          )}
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
            <input type="email" name="email" value={payload.email} onChange={handleInput} placeholder="Email" className="pl-10 py-2 rounded border border-gray-200 bg-white text-gray-800 placeholder-gray-400 w-full focus:ring-2 focus:ring-cyan-200 outline-none" />
          </div>
          {isRegister && (
            <div className="relative">
              <FaPhone className="absolute left-3 top-3 text-gray-400" />
              <input type="text" name="mobile" value={payload.mobile} onChange={handleInput} placeholder="Số điện thoại" className="pl-10 py-2 rounded border border-gray-200 bg-white text-gray-800 placeholder-gray-400 w-full focus:ring-2 focus:ring-cyan-200 outline-none" />
            </div>
          )}
          <div className="relative">
            <FaLock className="absolute left-3 top-3 text-gray-400" />
            <input type={showPassword ? "text" : "password"} name="password" value={payload.password} onChange={handleInput} placeholder="Mật khẩu" className="pl-10 pr-10 py-2 rounded border border-gray-200 bg-white text-gray-800 placeholder-gray-400 w-full focus:ring-2 focus:ring-cyan-200 outline-none" />
            <span className="absolute right-3 top-3 text-gray-400 cursor-pointer" onClick={() => setShowPassword(v => !v)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <button type="submit" className="w-full py-2 mt-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded shadow transition-all">
            {isRegister ? "Đăng ký" : "Đăng nhập"}
          </button>
        </form>
        <div className="flex items-center justify-between mt-4 w-full text-sm">
          {!isRegister && (
            <span className="text-cyan-700 hover:underline cursor-pointer" onClick={() => setIsRegister(true)}>
              Đăng ký
            </span>
          )}
          {isRegister && (
            <span className="text-cyan-700 hover:underline cursor-pointer w-full text-center" onClick={() => setIsRegister(false)}>
              Đi đến đăng nhập
            </span>
          )}
        </div>
        <Link className="text-cyan-700 text-sm hover:underline cursor-pointer mt-2" to={`/${path.HOME}`}>Trang chủ</Link>
      </div>
    </div>
  )
}

export default Login
