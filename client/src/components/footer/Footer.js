import React, { memo } from "react";
import { APP_INFO } from "../../ultils/contants";

export const Footer = () => {
  const sections = [
    {
      title: "LIÊN HỆ",
      content: (
        <>
          <p className="text-description">
            Địa chỉ: <span className="opacity-70">{APP_INFO.ADDRESS}</span>
          </p>
          <p className="text-description">
            Điện thoại: <span className="opacity-70">{APP_INFO.PHONE}</span>
          </p>
          <p className="text-description">
            Email:{" "}
            <a
              href={`mailto:${APP_INFO.EMAIL}`}
              className="opacity-70 hover:underline"
            >
              {APP_INFO.EMAIL}
            </a>
          </p>
        </>
      ),
    },
    {
      title: "THÔNG TIN",
      links: [
        { label: "Tra cứu hóa đơn điện tử", url: "/invoice-lookup" },
        { label: "Tra cứu ưu đãi của bạn", url: "/offers" },
        { label: "Trung tâm bảo hành", url: "/warranty" },
      ],
    },
    {
      title: "CHÍNH SÁCH",
      links: [
        { label: "Chính sách bảo hành", url: "/policy/warranty" },
        { label: "Chính sách đổi trả", url: "/policy/return" },
        { label: "Chính sách giao hàng", url: "/policy/shipping" },
        { label: "Chính sách khui hộp", url: "/policy/unbox" },
        { label: "Chính sách bảo vệ dữ liệu cá nhân", url: "/policy/privacy" },
      ],
    },
    {
      title: "TƯ VẤN ĐẶT HÀNG",
      links: [
        { label: "Phương thức thanh toán", url: "/payment" },
        { label: "Hướng dẫn đặt hàng", url: "/guide" },
        { label: "Góp ý, khiếu nại", url: "/feedback" },
      ],
    },
  ];

  return (
    <footer className="w-full bg-header-footer text-black text-sm mt-10">
      <div className="lg:w-main mx-auto p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 md:gap-6">
        {sections.map((section, index) => (
          <div key={index} className="min-w-[200px] rounded-md p-2">
            <h3 className="text-title mb-4 text-left uppercase">
              {section.title}
            </h3>
            {section.content ? (
              section.content
            ) : (
              <ul className="flex flex-col gap-1">
                {section.links.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link.url}
                      className="hover:underline text-description "
                    >
                      {link.label}
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
