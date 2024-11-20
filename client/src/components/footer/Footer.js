import React, { memo }  from "react";

const Footer = () =>{
    return (
        <div className="w-full">
            <div className="h-[280px] bg-[#00AFFF] w-full flex items-center justify-center">
                <div className="w-main flex text-white text-[13px]">
                    <div className="flex-2 flex flex-col gap-2">
                        <h3 className="mb-[20px] text-[15px] font-medium border-l-2 border-main pl-[15p]">LIÊN HỆ</h3>
                        <span>
                            <span>Địa chỉ: </span>
                            <span className="opacity-70">CTU</span>
                        </span>
                        <span>
                            <span className="opacity-70">Điện thoại: </span>
                            <span>0123456789</span>
                        </span>
                        <span>
                            <span className="opacity-70">Email: </span>
                            <span>hotro@student.ctu.edu.vn</span>
                        </span>
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                        <h3 className="mb-[20px] text-[15px] font-medium border-l-2 border-main pl-[15p]">THÔNG TIN</h3>
                        <span><a href="#">Tra cứu hóa đơn điện tử</a></span>
                        <span><a href="#">Tra cứu ưu đãi của bạn</a></span>
                        <span><a href="#">Trung tâm bảo hành</a></span>
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                        <h3 className="mb-[20px] text-[15px] font-medium border-l-2 border-main pl-[15p]">CHÍNH SÁCH</h3>
                        <span><a href="#">Chính sách bảo hành</a></span>
                        <span><a href="#">Chính sách đổi trả</a></span>
                        <span><a href="#">Chính sách giao hàng</a></span>
                        <span><a href="#">Chính sách khui hộp</a></span>
                        <span><a href="#">Chính sách bảo vệ dữ liệu cá nhân</a></span>
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                        <h3 className="mb-[20px] text-[15px] font-medium border-l-2 border-main pl-[15p]">TƯ VẤN ĐẶT HÀNG</h3>
                        <span><a href="#">Phương thức thanh toán</a></span>
                        <span><a href="#">Hướng dẫn đặt hàng</a></span>
                        <span><a href="#">Góp ý, khiếu nại</a></span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default memo(Footer)