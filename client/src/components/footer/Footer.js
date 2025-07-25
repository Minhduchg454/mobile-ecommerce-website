import React, { memo } from "react";

const sections = [
  {
    title: "LIÊN HỆ",
    content: (
      <>
        <p>
          Địa chỉ: <span className="opacity-70">CTU</span>
        </p>
        <p>
          Điện thoại: <span className="opacity-70">0909 567 999</span>
        </p>
        <p>
          Email: <span className="opacity-70">Fone@gmail.com.vn</span>
        </p>
      </>
    ),
  },
  {
    title: "THÔNG TIN",
    links: [
      "Tra cứu hóa đơn điện tử",
      "Tra cứu ưu đãi của bạn",
      "Trung tâm bảo hành",
    ],
  },
  {
    title: "CHÍNH SÁCH",
    links: [
      "Chính sách bảo hành",
      "Chính sách đổi trả",
      "Chính sách giao hàng",
      "Chính sách khui hộp",
      "Chính sách bảo vệ dữ liệu cá nhân",
    ],
  },
  {
    title: "TƯ VẤN ĐẶT HÀNG",
    links: ["Phương thức thanh toán", "Hướng dẫn đặt hàng", "Góp ý, khiếu nại"],
  },
];

const Footer = () => {
  return (
    <footer className="w-full bg-header-footer text-black text-sm mt-10">
      <div className="md:w-main mx-auto px-8 py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {sections.map((section, index) => (
          <div key={index} className="min-w-[200px] rounded-md p-4">
            <h3 className="text-base font-semibold mb-4 border-l-4 border-gray-400 pl-2 text-left uppercase">
              {section.title}
            </h3>
            {section.content ? (
              section.content
            ) : (
              <ul className="flex flex-col gap-2">
                {section.links.map((link, idx) => (
                  <li key={idx}>
                    <a href="#" className="hover:underline">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </footer>
  );
};

export default memo(Footer);
