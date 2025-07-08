import React, { useState, useCallback, useEffect } from "react"
import { apiRegister, apiLogin } from "apis/user"
import Swal from "sweetalert2"
import { useNavigate, Link, useSearchParams } from "react-router-dom"
import path from "ultils/path"
import { login } from "store/user/userSlice"
import { showModal } from "store/app/appSlice"
import { useDispatch, useSelector } from "react-redux"
import { getCurrent } from 'store/user/asyncActions';
import { FaUser, FaLock, FaEnvelope, FaPhone, FaEye, FaEyeSlash, FaMobileAlt, FaLaptop, FaTabletAlt, FaHeadphones } from 'react-icons/fa';
import useDebounce from "../../hooks/useDebounce";
import { apiCheckEmailExists, apiCheckMobileExists } from "apis/user";

const Login = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const userState = useSelector(state => state.user);
  const [payload, setPayload] = useState({
    email: "",
    password: "",
    firstname: "",
    lastname: "",
    mobile: "",
  })
  const [isRegister, setIsRegister] = useState(false)
  const [searchParams] = useSearchParams()
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({
    firstname: false,
    lastname: false,
    email: false,
    mobile: false,
    password: false,
  });
  const [submitted, setSubmitted] = useState(false);
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
    if (isRegister) {
      const order = ["firstname", "lastname", "email", "mobile", "password"];
      const idx = order.indexOf(e.target.name);
      setRegisterTouched(prev => {
        const updated = { ...prev };
        for (let i = 0; i <= idx; i++) {
          updated[order[i]] = true;
        }
        return updated;
      });
    }
  }
  const handleBlur = (e) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
  };
  // Thêm state riêng cho touched, invalidFields, submitted của đăng nhập và đăng ký
  const [registerTouched, setRegisterTouched] = useState({ firstname: false, lastname: false, email: false, mobile: false, password: false });
  const [registerInvalidFields, setRegisterInvalidFields] = useState([]);
  const [registerSubmitted, setRegisterSubmitted] = useState(false);

  // Khi chuyển form, reset state lỗi/touched/submitted tương ứng
  useEffect(() => {
    if (isRegister) {
      setRegisterTouched({ firstname: false, lastname: false, email: false, mobile: false, password: false });
      setRegisterInvalidFields([]);
      setRegisterSubmitted(false);
    } else {
      setRegisterTouched({ firstname: false, lastname: false, email: false, mobile: false, password: false });
      setRegisterInvalidFields([]);
      setRegisterSubmitted(false);
    }
  }, [isRegister]);
  // Chuyển validateRegister và validateLogin thành useCallback để không warning
  const validateRegister = useCallback(() => {
    let invalids = 0;
    setRegisterInvalidFields([]);
    if (!payload.firstname || payload.firstname.trim() === "") {
      invalids++;
      setRegisterInvalidFields((prev) => [...prev, { name: "firstname", mes: "Không được để trống." }]);
    }
    if (!payload.lastname || payload.lastname.trim() === "") {
      invalids++;
      setRegisterInvalidFields((prev) => [...prev, { name: "lastname", mes: "Không được để trống." }]);
    }
    if (!payload.email || payload.email.trim() === "") {
      invalids++;
      setRegisterInvalidFields((prev) => [...prev, { name: "email", mes: "Không được để trống." }]);
    }
    if (!payload.mobile || payload.mobile.trim() === "") {
      invalids++;
      setRegisterInvalidFields((prev) => [...prev, { name: "mobile", mes: "Không được để trống." }]);
    }
    if (!payload.password || payload.password.trim() === "") {
      invalids++;
      setRegisterInvalidFields((prev) => [...prev, { name: "password", mes: "Không được để trống." }]);
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (payload.email && !emailRegex.test(payload.email)) {
      invalids++;
      setRegisterInvalidFields((prev) => [...prev, { name: "email", mes: "Email không hợp lệ." }]);
    }
    const phoneRegex = /^0\d{9}$/;
    if (payload.mobile && !phoneRegex.test(payload.mobile)) {
      invalids++;
      setRegisterInvalidFields((prev) => [...prev, { name: "mobile", mes: "Số điện thoại không hợp lệ." }]);
    }
    if (payload.password && payload.password.length < 6) {
      invalids++;
      setRegisterInvalidFields((prev) => [...prev, { name: "password", mes: "Mật khẩu tối thiểu 6 ký tự." }]);
    }
    return invalids === 0;
  }, [payload]);
  // Sửa validateLogin để luôn set lỗi nếu email sai định dạng
  const validateLogin = useCallback(() => {
    let invalids = 0;
    setRegisterInvalidFields([]);
    if (!payload.email || payload.email.trim() === "") {
      invalids++;
      setRegisterInvalidFields((prev) => [...prev, { name: "email", mes: "Không được để trống." }]);
    }
    if (!payload.password || payload.password.trim() === "") {
      invalids++;
      setRegisterInvalidFields((prev) => [...prev, { name: "password", mes: "Không được để trống." }]);
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (payload.email && !emailRegex.test(payload.email)) {
      invalids++;
      setRegisterInvalidFields((prev) => [...prev, { name: "email", mes: "Email không hợp lệ." }]);
    }
    if (payload.password && payload.password.length < 6) {
      invalids++;
      setRegisterInvalidFields((prev) => [...prev, { name: "password", mes: "Mật khẩu tối thiểu 6 ký tự." }]);
    }
    return invalids === 0;
  }, [payload]);
  const handleSubmit = useCallback(async () => {
    setSubmitted(true);
    if (isRegister) {
      if (!validateRegister()) return;
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
        // Xử lý lỗi duplicate key hoặc email/mobile đã tồn tại
        let errorMsg = response.mes || response.error || "Đăng ký thất bại!";
        if (
          (errorMsg && errorMsg.includes('E11000') && errorMsg.includes('mobile')) ||
          (errorMsg && errorMsg.toLowerCase().includes('mobile already exists'))
        ) {
          setRegisterInvalidFields(prev => [...prev, { name: 'mobile', mes: 'Số điện thoại đã được sử dụng.' }]);
          return;
        }
        if (
          (errorMsg && errorMsg.includes('E11000') && errorMsg.includes('email')) ||
          (errorMsg && errorMsg.toLowerCase().includes('email already exists'))
        ) {
          setRegisterInvalidFields(prev => [...prev, { name: 'email', mes: 'Email đã được sử dụng.' }]);
          return;
        }
        Swal.fire("Oops!", errorMsg, "error")
      }
    } else {
      if (!validateLogin()) return;
      const { firstname, lastname, mobile, ...data } = payload
      const rs = await apiLogin(data)
      let token = rs.token || rs.accessToken
      const user = rs.user || rs.userData
      if (token && typeof token !== 'string') token = String(token)
      if (rs.success && token && user) {
        dispatch(
          login({
            isLoggedIn: true,
            token,
            userData: user,
          })
        )
        dispatch(getCurrent());
        if (searchParams.get("redirect")) {
          navigate(searchParams.get("redirect"))
        } else {
          navigate(`/${path.HOME}`)
        }
      } else {
        let errorMsg = rs.mes || "Đăng nhập thất bại!";
        if (errorMsg && errorMsg.toLowerCase().includes('invalid password')) {
          Swal.fire({
            icon: "warning",
            title: "Đăng nhập thất bại",
            html: `
              <div style="font-size:1.1em;">
                Mật khẩu bạn nhập <b>chưa đúng</b>.<br/>
                Vui lòng kiểm tra lại!
              </div>
            `,
            confirmButtonText: "OK",
            confirmButtonColor: "#3085d6",
            customClass: { popup: "rounded-xl" }
          });
        } else {
          Swal.fire("Oops!", errorMsg, "error")
        }
      }
    }
  }, [payload, isRegister, dispatch, navigate, searchParams, validateLogin, validateRegister]);

  const debouncedEmail = useDebounce(payload.email, 500);
  const debouncedMobile = useDebounce(payload.mobile, 500);

  // Validate định dạng email/sđt ở Đăng ký, không xóa lỗi 'đã được sử dụng' nếu đang có
  useEffect(() => {
    if (isRegister) {
      // Email định dạng
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (payload.email && !emailRegex.test(payload.email)) {
        setRegisterInvalidFields(prev => {
          // Nếu đã có lỗi 'đã được sử dụng' thì giữ lại
          const usedErr = prev.find(f => f.name === "email" && f.mes.includes('được sử dụng'));
          return [
            ...prev.filter(f => f.name !== "email"),
            ...(usedErr ? [usedErr] : []),
            { name: "email", mes: "Email không hợp lệ." }
          ];
        });
      } else if (payload.email) {
        setRegisterInvalidFields(prev => {
          // Nếu đã có lỗi 'đã được sử dụng' thì giữ lại
          const usedErr = prev.find(f => f.name === "email" && f.mes.includes('được sử dụng'));
          return prev.filter(f => f.name !== "email").concat(usedErr ? [usedErr] : []);
        });
      }
      // Mobile định dạng
      const phoneRegex = /^0\d{9}$/;
      if (payload.mobile && !phoneRegex.test(payload.mobile)) {
        setRegisterInvalidFields(prev => {
          const usedErr = prev.find(f => f.name === "mobile" && f.mes.includes('được sử dụng'));
          return [
            ...prev.filter(f => f.name !== "mobile"),
            ...(usedErr ? [usedErr] : []),
            { name: "mobile", mes: "Số điện thoại không hợp lệ." }
          ];
        });
      } else if (payload.mobile) {
        setRegisterInvalidFields(prev => {
          const usedErr = prev.find(f => f.name === "mobile" && f.mes.includes('được sử dụng'));
          return prev.filter(f => f.name !== "mobile").concat(usedErr ? [usedErr] : []);
        });
      }
      // Password
      if (payload.password && payload.password.length > 0 && payload.password.length < 6) {
        setRegisterInvalidFields(prev => [
          ...prev.filter(f => f.name !== "password"),
          { name: "password", mes: "Mật khẩu tối thiểu 6 ký tự." }
        ]);
      } else {
        setRegisterInvalidFields(prev => prev.filter(f => f.name !== "password"));
      }
    }
  }, [payload.email, payload.mobile, payload.password, isRegister]);

  // Validate tồn tại email/sđt ở Đăng ký, ưu tiên lỗi đã được sử dụng
  useEffect(() => {
    if (isRegister && debouncedEmail) {
      let ignore = false;
      apiCheckEmailExists(debouncedEmail).then(res => {
        if (!ignore) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (res && res.data && typeof res.data.exists !== 'undefined') {
            if (res.data.exists) {
              setRegisterInvalidFields(prev => [
                ...prev.filter(f => f.name !== "email"),
                { name: "email", mes: "Email đã được sử dụng." }
              ]);
            } else if (emailRegex.test(debouncedEmail)) {
              setRegisterInvalidFields(prev => prev.filter(f => f.name !== "email"));
            }
          }
        }
      }).catch(() => {});
      return () => { ignore = true; };
    }
  }, [debouncedEmail, isRegister]);

  useEffect(() => {
    if (isRegister && debouncedMobile) {
      let ignore = false;
      apiCheckMobileExists(debouncedMobile).then(res => {
        if (!ignore) {
          const phoneRegex = /^0\d{9}$/;
          if (res && res.data && typeof res.data.exists !== 'undefined') {
            if (res.data.exists) {
              setRegisterInvalidFields(prev => [
                ...prev.filter(f => f.name !== "mobile"),
                { name: "mobile", mes: "Số điện thoại đã được sử dụng." }
              ]);
            } else if (phoneRegex.test(debouncedMobile)) {
              setRegisterInvalidFields(prev => prev.filter(f => f.name !== "mobile"));
            }
          }
        }
      }).catch(() => {});
      return () => { ignore = true; };
    }
  }, [debouncedMobile, isRegister]);

  // Validate realtime cho Đăng nhập
  useEffect(() => {
    if (!isRegister) {
      // Email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (payload.email && !emailRegex.test(payload.email)) {
        setRegisterInvalidFields(prev => [
          ...prev.filter(f => f.name !== "email"),
          { name: "email", mes: "Email không hợp lệ." }
        ]);
      } else {
        setRegisterInvalidFields(prev => prev.filter(f => f.name !== "email"));
      }
      // Password
      if (payload.password && payload.password.length > 0 && payload.password.length < 6) {
        setRegisterInvalidFields(prev => [
          ...prev.filter(f => f.name !== "password"),
          { name: "password", mes: "Mật khẩu tối thiểu 6 ký tự." }
        ]);
      } else {
        setRegisterInvalidFields(prev => prev.filter(f => f.name !== "password"));
      }
    }
  }, [payload.email, payload.password, isRegister]);

  useEffect(() => {
    console.log('Redux user state:', userState);
  }, [userState]);

  useEffect(() => { resetPayload() }, [isRegister])

  // Thêm hàm kiểm tra hợp lệ toàn bộ form đăng ký
  const isRegisterFormValid =
    isRegister &&
    payload.firstname.trim() &&
    payload.lastname.trim() &&
    payload.email.trim() &&
    payload.mobile.trim() &&
    payload.password.trim() &&
    registerInvalidFields.filter(f => ["firstname","lastname","email","mobile","password"].includes(f.name)).length === 0;

  // Thêm hàm kiểm tra hợp lệ toàn bộ form đăng nhập
  const isLoginFormValid =
    !isRegister &&
    payload.email.trim() &&
    payload.password.trim() &&
    registerInvalidFields.filter(f => ["email","password"].includes(f.name)).length === 0;

  const emailError = registerInvalidFields.filter(f => f.name === "email");
  const mobileError = registerInvalidFields.filter(f => f.name === "mobile");

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
                <input type="text" name="firstname" value={payload.firstname} onChange={handleInput} onBlur={handleBlur} placeholder="Họ" className="pl-10 py-2 rounded border border-gray-200 bg-white text-gray-800 placeholder-gray-400 w-full focus:ring-2 focus:ring-cyan-200 outline-none" />
                {registerInvalidFields.find(f => f.name === "firstname") && (payload.firstname || registerTouched.firstname || registerSubmitted) && <span className="text-red-500 text-xs">{registerInvalidFields.find(f => f.name === "firstname").mes}</span>}
              </div>
              <div className="relative flex-1">
                <FaUser className="absolute left-3 top-3 text-gray-400" />
                <input type="text" name="lastname" value={payload.lastname} onChange={handleInput} onBlur={handleBlur} placeholder="Tên" className="pl-10 py-2 rounded border border-gray-200 bg-white text-gray-800 placeholder-gray-400 w-full focus:ring-2 focus:ring-cyan-200 outline-none" />
                {registerInvalidFields.find(f => f.name === "lastname") && (payload.lastname || registerTouched.lastname || registerSubmitted) && <span className="text-red-500 text-xs">{registerInvalidFields.find(f => f.name === "lastname").mes}</span>}
              </div>
            </div>
          )}
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
            <input type="email" name="email" value={payload.email} onChange={handleInput} onBlur={handleBlur} placeholder="Email" className="pl-10 py-2 rounded border border-gray-200 bg-white text-gray-800 placeholder-gray-400 w-full focus:ring-2 focus:ring-cyan-200 outline-none" />
            {emailError.length > 0 && (payload.email || registerTouched.email || registerSubmitted) && (
              <span className="text-red-500 text-xs">
                {emailError.find(f => f.mes.includes('được sử dụng'))?.mes || emailError[0].mes}
              </span>
            )}
          </div>
          {isRegister && (
            <div className="relative">
              <FaPhone className="absolute left-3 top-3 text-gray-400" />
              <input type="text" name="mobile" value={payload.mobile} onChange={handleInput} onBlur={handleBlur} placeholder="Số điện thoại" className="pl-10 py-2 rounded border border-gray-200 bg-white text-gray-800 placeholder-gray-400 w-full focus:ring-2 focus:ring-cyan-200 outline-none" />
              {mobileError.length > 0 && (payload.mobile || registerTouched.mobile || registerSubmitted) && (
                <span className="text-red-500 text-xs">
                  {mobileError.find(f => f.mes.includes('được sử dụng'))?.mes || mobileError[0].mes}
                </span>
              )}
            </div>
          )}
          <div className="relative">
            <FaLock className="absolute left-3 top-3 text-gray-400" />
            <input type={showPassword ? "text" : "password"} name="password" value={payload.password} onChange={handleInput} onBlur={handleBlur} placeholder="Mật khẩu" className="pl-10 pr-10 py-2 rounded border border-gray-200 bg-white text-gray-800 placeholder-gray-400 w-full focus:ring-2 focus:ring-cyan-200 outline-none" />
            <span className="absolute right-3 top-3 text-gray-400 cursor-pointer" onClick={() => setShowPassword(v => !v)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
            {/* Hiển thị lỗi password cho cả đăng nhập và đăng ký */}
            {registerInvalidFields.find(f => f.name === "password") && ((isRegister ? (payload.password || registerTouched.password || registerSubmitted) : (payload.password || touched.password || submitted))) && (
              <span className="text-red-500 text-xs">{registerInvalidFields.find(f => f.name === "password").mes}</span>
            )}
          </div>
          <button
            type="submit"
            className={`w-full py-2 mt-2 text-white font-semibold rounded shadow transition-all ${isRegister
              ? (isRegisterFormValid ? 'bg-cyan-600 hover:bg-cyan-700 cursor-pointer' : 'bg-gray-300 cursor-not-allowed')
              : (isLoginFormValid ? 'bg-cyan-600 hover:bg-cyan-700 cursor-pointer' : 'bg-gray-300 cursor-not-allowed')}`}
            disabled={isRegister ? !isRegisterFormValid : !isLoginFormValid}
          >
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
