import React, { useState } from 'react';
import withBaseComponent from "hocs/withBaseComponent";
import {
  MdHelp,
  MdPlayCircle,
  MdSecurity,
  MdSupportAgent,
  MdInfo,
  MdLocationOn,
  MdPhone,
  MdEmail,
  MdAccessTime,
  MdExpandMore,
  MdExpandLess,
  MdShoppingCart,
  MdPayment,
  MdLocalShipping,
  MdBuild,
  MdStore,
  MdComputer,
  MdSmartphone,
  MdHeadphones,
  MdTablet,
} from "react-icons/md";
import { FaWhatsapp, FaFacebook, FaYoutube } from "react-icons/fa";

const FAQ = () => {
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [activeTab, setActiveTab] = useState('faq');

  const faqData = [
    {
      id: 1,
      question: "Chính sách bảo hành như thế nào?",
      answer: "Chúng tôi cung cấp bảo hành chính hãng từ 12-24 tháng tùy theo sản phẩm. Bảo hành bao gồm lỗi kỹ thuật từ nhà sản xuất. Không bao gồm lỗi do người dùng gây ra như rơi vỡ, vào nước."
    },
    {
      id: 2,
      question: "Thời gian giao hàng là bao lâu?",
      answer: "Thời gian giao hàng từ 1-3 ngày làm việc trong nội thành, 3-7 ngày cho các tỉnh thành khác. Đối với đơn hàng đặt trước, thời gian có thể kéo dài hơn tùy theo tình trạng hàng."
    },
    {
      id: 3,
      question: "Có thể đổi trả sản phẩm không?",
      answer: "Có thể đổi trả trong vòng 7 ngày kể từ ngày nhận hàng nếu sản phẩm còn nguyên vẹn, đầy đủ phụ kiện và không có dấu hiệu sử dụng. Phí vận chuyển đổi trả do khách hàng chịu."
    },
    {
      id: 4,
      question: "Các phương thức thanh toán được hỗ trợ?",
      answer: "Chúng tôi hỗ trợ thanh toán tiền mặt khi nhận hàng (COD), chuyển khoản ngân hàng, thanh toán qua ví điện tử (MoMo, ZaloPay), thẻ tín dụng/ghi nợ."
    },
    {
      id: 5,
      question: "Làm sao để theo dõi đơn hàng?",
      answer: "Bạn có thể theo dõi đơn hàng qua email xác nhận, SMS thông báo, hoặc đăng nhập vào tài khoản để xem trạng thái đơn hàng chi tiết."
    }
  ];

  const supportCategories = [
    {
      id: 'faq',
      title: 'Câu hỏi thường gặp',
      icon: <MdHelp className="text-2xl" />,
      description: 'Tổng hợp các thắc mắc phổ biến'
    },
    {
      id: 'guide',
      title: 'Hướng dẫn sử dụng',
      icon: <MdPlayCircle className="text-2xl" />,
      description: 'Video và hướng dẫn chi tiết'
    },
    {
      id: 'warranty',
      title: 'Chính sách bảo hành',
      icon: <MdSecurity className="text-2xl" />,
      description: 'Điều kiện và quy trình bảo hành'
    },
    {
      id: 'contact',
      title: 'Liên hệ hỗ trợ',
      icon: <MdSupportAgent className="text-2xl" />,
      description: 'Hỗ trợ trực tuyến 24/7'
    },
    {
      id: 'technical',
      title: 'Thông tin kỹ thuật',
      icon: <MdInfo className="text-2xl" />,
      description: 'Tư vấn sản phẩm chi tiết'
    },
    {
      id: 'service',
      title: 'Trung tâm bảo hành',
      icon: <MdLocationOn className="text-2xl" />,
      description: 'Địa chỉ bảo hành gần nhất'
    }
  ];

  const warrantyPolicies = [
    {
      title: "Bảo hành chính hãng",
      description: "12-24 tháng tùy sản phẩm",
      details: ["Bảo hành toàn quốc", "Dịch vụ nhanh chóng", "Phụ tùng chính hãng"]
    },
    {
      title: "Bảo hành mở rộng",
      description: "Thêm 12 tháng bảo hành",
      details: ["Bảo vệ toàn diện", "Chi phí hợp lý", "Dịch vụ ưu tiên"]
    },
    {
      title: "Bảo hành 1 đổi 1",
      description: "Trong 30 ngày đầu",
      details: ["Đổi mới 100%", "Không mất phí", "Thủ tục đơn giản"]
    }
  ];

  const serviceCenters = [
    {
      name: "Trung tâm bảo hành TP.HCM",
      address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
      phone: "0909 567 999",
      hours: "8:00 - 20:00 (Thứ 2 - Chủ nhật)"
    },
    {
      name: "Trung tâm bảo hành Hà Nội",
      address: "456 Trần Phú, Ba Đình, Hà Nội",
      phone: "0909 567 888",
      hours: "8:00 - 20:00 (Thứ 2 - Chủ nhật)"
    },
    {
      name: "Trung tâm bảo hành Đà Nẵng",
      address: "789 Lê Duẩn, Hải Châu, Đà Nẵng",
      phone: "0909 567 777",
      hours: "8:00 - 18:00 (Thứ 2 - Thứ 7)"
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'faq':
        return (
          <div className="space-y-4">
                         <h3 className="text-xl font-bold text-[#333] mb-6">Câu hỏi thường gặp</h3>
            {faqData.map((faq) => (
              <div key={faq.id} className="bg-white rounded-lg shadow-sm border">
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50"
                  onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                >
                                     <span className="font-medium text-[#333]">{faq.question}</span>
                  {expandedFAQ === faq.id ? (
                    <MdExpandLess className="text-gray-500" />
                  ) : (
                    <MdExpandMore className="text-gray-500" />
                  )}
                </button>
                {expandedFAQ === faq.id && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case 'guide':
        return (
          <div className="space-y-6">
                         <h3 className="text-xl font-bold text-[#333] mb-6">Hướng dẫn sử dụng & mua hàng</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center mb-4">
                                     <MdShoppingCart className="text-[#1D4ED8] text-2xl mr-3" />
                  <h4 className="font-semibold text-lg">Hướng dẫn đặt hàng</h4>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Chọn sản phẩm bạn muốn mua</li>
                  <li>Kiểm tra thông tin và giá cả</li>
                  <li>Thêm vào giỏ hàng</li>
                  <li>Điền thông tin giao hàng</li>
                  <li>Chọn phương thức thanh toán</li>
                  <li>Xác nhận đơn hàng</li>
                </ol>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center mb-4">
                                     <MdPayment className="text-[#1D4ED8] text-2xl mr-3" />
                  <h4 className="font-semibold text-lg">Hướng dẫn thanh toán</h4>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li>• Thanh toán khi nhận hàng (COD)</li>
                  <li>• Chuyển khoản ngân hàng</li>
                  <li>• Ví điện tử (MoMo, ZaloPay)</li>
                  <li>• Thẻ tín dụng/ghi nợ</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center mb-4">
                                     <MdLocalShipping className="text-[#1D4ED8] text-2xl mr-3" />
                  <h4 className="font-semibold text-lg">Theo dõi đơn hàng</h4>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li>• Nhận email xác nhận</li>
                  <li>• SMS thông báo trạng thái</li>
                  <li>• Kiểm tra trong tài khoản</li>
                  <li>• Liên hệ hotline hỗ trợ</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center mb-4">
                                     <MdBuild className="text-[#1D4ED8] text-2xl mr-3" />
                  <h4 className="font-semibold text-lg">Hướng dẫn sử dụng</h4>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li>• Video hướng dẫn chi tiết</li>
                  <li>• Sách hướng dẫn sử dụng</li>
                  <li>• Tư vấn kỹ thuật 24/7</li>
                  <li>• FAQ sản phẩm</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'warranty':
        return (
          <div className="space-y-6">
                         <h3 className="text-xl font-bold text-[#333] mb-6">Chính sách bảo hành & đổi trả</h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              {warrantyPolicies.map((policy, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm border">
                  <div className="text-center mb-4">
                                         <h4 className="font-semibold text-lg text-[#333] mb-2">{policy.title}</h4>
                                         <p className="text-[#1D4ED8] font-medium">{policy.description}</p>
                  </div>
                  <ul className="space-y-2">
                    {policy.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center text-gray-700">
                                                 <div className="w-2 h-2 bg-[#1D4ED8] rounded-full mr-3"></div>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
                             <h4 className="font-semibold text-lg text-[#333] mb-4">Điều kiện bảo hành</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                                     <h5 className="font-medium text-[#333] mb-2">Được bảo hành:</h5>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Lỗi kỹ thuật từ nhà sản xuất</li>
                    <li>• Hư hỏng do linh kiện</li>
                    <li>• Sản phẩm còn trong thời hạn bảo hành</li>
                  </ul>
                </div>
                <div>
                                     <h5 className="font-medium text-[#333] mb-2">Không được bảo hành:</h5>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Rơi vỡ, vào nước</li>
                    <li>• Tháo mở, sửa chữa không đúng cách</li>
                    <li>• Hư hỏng do sử dụng sai mục đích</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-6">
                         <h3 className="text-xl font-bold text-[#333] mb-6">Liên hệ hỗ trợ trực tuyến</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                                 <h4 className="font-semibold text-lg text-[#333] mb-4">Thông tin liên hệ</h4>
                <div className="space-y-4">
                  <div className="flex items-center">
                                         <MdPhone className="text-[#1D4ED8] text-xl mr-3" />
                    <div>
                      <p className="font-medium">Hotline: 0909 567 999</p>
                      <p className="text-sm text-gray-600">8:00 - 23:00 (Thứ 2 - Chủ nhật)</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                                         <MdEmail className="text-[#1D4ED8] text-xl mr-3" />
                    <div>
                      <p className="font-medium">Email: hotro@student.ctu.edu.vn</p>
                      <p className="text-sm text-gray-600">Phản hồi trong 24h</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                                         <MdAccessTime className="text-[#1D4ED8] text-xl mr-3" />
                    <div>
                      <p className="font-medium">Giờ làm việc</p>
                      <p className="text-sm text-gray-600">8:00 - 23:00 hàng ngày</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                                 <h4 className="font-semibold text-lg text-[#333] mb-4">Kênh hỗ trợ</h4>
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <FaWhatsapp className="text-green-600 text-xl mr-3" />
                    <div>
                      <p className="font-medium">WhatsApp</p>
                      <p className="text-sm text-gray-600">Hỗ trợ nhanh 24/7</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <FaFacebook className="text-blue-600 text-xl mr-3" />
                    <div>
                      <p className="font-medium">Facebook</p>
                      <p className="text-sm text-gray-600">Fanpage chính thức</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-red-50 rounded-lg">
                    <FaYoutube className="text-red-600 text-xl mr-3" />
                    <div>
                      <p className="font-medium">YouTube</p>
                      <p className="text-sm text-gray-600">Video hướng dẫn</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

                         <div className="bg-gray-50 rounded-lg p-6">
               <h4 className="font-semibold text-lg text-[#333] mb-4">Chat trực tuyến</h4>
               <p className="text-gray-700">
                 Sử dụng chatbot AI để được hỗ trợ nhanh chóng. Chatbot có thể trả lời các câu hỏi thường gặp và hướng dẫn bạn sử dụng dịch vụ.
               </p>
             </div>
          </div>
        );

      case 'technical':
        return (
          <div className="space-y-6">
                         <h3 className="text-xl font-bold text-[#333] mb-6">Thông tin kỹ thuật & tư vấn sản phẩm</h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm border text-center">
                                 <MdSmartphone className="text-[#1D4ED8] text-4xl mx-auto mb-4" />
                <h4 className="font-semibold text-lg mb-2">Điện thoại</h4>
                <p className="text-gray-600 text-sm">iPhone, Samsung, Xiaomi, OPPO</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border text-center">
                                 <MdComputer className="text-[#1D4ED8] text-4xl mx-auto mb-4" />
                <h4 className="font-semibold text-lg mb-2">Laptop</h4>
                <p className="text-gray-600 text-sm">Dell, HP, Lenovo, Asus</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border text-center">
                                 <MdTablet className="text-[#1D4ED8] text-4xl mx-auto mb-4" />
                <h4 className="font-semibold text-lg mb-2">Máy tính bảng</h4>
                <p className="text-gray-600 text-sm">iPad, Samsung Tab</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border text-center">
                                 <MdHeadphones className="text-[#1D4ED8] text-4xl mx-auto mb-4" />
                <h4 className="font-semibold text-lg mb-2">Phụ kiện</h4>
                <p className="text-gray-600 text-sm">Tai nghe, sạc, ốp lưng</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
                               <h4 className="font-semibold text-lg text-[#333] mb-4">So sánh sản phẩm</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                                     <h5 className="font-medium mb-2 text-[#333]">iPhone 15 Pro Max vs iPhone 14 Pro Max</h5>
                  <p className="text-sm text-gray-600">So sánh hiệu năng, camera, pin</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                                     <h5 className="font-medium mb-2 text-[#333]">Samsung S24 vs iPhone 15</h5>
                  <p className="text-sm text-gray-600">So sánh hệ sinh thái, tính năng</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                                     <h5 className="font-medium mb-2 text-[#333]">Laptop Gaming vs Laptop Văn phòng</h5>
                  <p className="text-sm text-gray-600">So sánh hiệu năng, giá cả</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
                             <h4 className="font-semibold text-lg text-[#333] mb-4">Tư vấn mua hàng</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                                     <h5 className="font-medium text-[#333] mb-2">Chọn điện thoại phù hợp:</h5>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Ngân sách</li>
                    <li>• Mục đích sử dụng</li>
                    <li>• Thương hiệu yêu thích</li>
                    <li>• Tính năng cần thiết</li>
                  </ul>
                </div>
                <div>
                                     <h5 className="font-medium text-[#333] mb-2">Chọn laptop phù hợp:</h5>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Cấu hình yêu cầu</li>
                    <li>• Kích thước màn hình</li>
                    <li>• Thời lượng pin</li>
                    <li>• Trọng lượng</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'service':
        return (
          <div className="space-y-6">
                         <h3 className="text-xl font-bold text-[#333] mb-6">Trung tâm bảo hành & đại lý</h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {serviceCenters.map((center, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm border">
                  <div className="flex items-center mb-4">
                    <MdStore className="text-main text-2xl mr-3" />
                                         <h4 className="font-semibold text-lg text-[#333]">{center.name}</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <MdLocationOn className="text-gray-500 mt-1 mr-3 flex-shrink-0" />
                      <p className="text-gray-700 text-sm">{center.address}</p>
                    </div>
                    <div className="flex items-center">
                      <MdPhone className="text-gray-500 mr-3" />
                      <p className="text-gray-700 text-sm">{center.phone}</p>
                    </div>
                    <div className="flex items-center">
                      <MdAccessTime className="text-gray-500 mr-3" />
                      <p className="text-gray-700 text-sm">{center.hours}</p>
                    </div>
                  </div>
                                     <button className="w-full mt-4 bg-main text-white py-2 rounded-lg hover:bg-[#c62828] transition-all duration-300">
                     Xem bản đồ
                   </button>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
                             <h4 className="font-semibold text-lg text-[#333] mb-4">Hướng dẫn đến trung tâm bảo hành</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                                     <h5 className="font-medium text-[#333] mb-2">Chuẩn bị trước khi đến:</h5>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Mang theo sản phẩm cần bảo hành</li>
                    <li>• Hóa đơn mua hàng hoặc phiếu bảo hành</li>
                    <li>• CMND/CCCD để xác minh</li>
                    <li>• Sao lưu dữ liệu quan trọng</li>
                  </ul>
                </div>
                <div>
                                     <h5 className="font-medium text-[#333] mb-2">Quy trình bảo hành:</h5>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Kiểm tra tình trạng sản phẩm</li>
                    <li>• Xác nhận thông tin bảo hành</li>
                    <li>• Thực hiện sửa chữa/thay thế</li>
                    <li>• Bàn giao sản phẩm</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full px-4 py-8">
      <div className="xl:w-main m-auto">
        {/* Header */}
        <div className="text-center mb-8">
                     <h1 className="text-3xl font-bold text-[#333] mb-2">
            Trung tâm hỗ trợ
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7 với đội ngũ chuyên nghiệp và dịch vụ chất lượng cao
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {supportCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                                 className={`p-4 text-center border-b-2 transition-colors ${
                   activeTab === category.id
                     ? 'border-[#DBEAFE] text-[#1D4ED8] bg-[#DBEAFE]'
                     : 'border-transparent text-gray-600 hover:text-[#1D4ED8] hover:bg-gray-50'
                 }`}
              >
                <div className="flex flex-col items-center">
                  <div className="mb-2">{category.icon}</div>
                  <span className="text-sm font-medium">{category.title}</span>
                  <span className="text-xs text-gray-500 mt-1">{category.description}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {renderContent()}
        </div>

                 {/* Quick Contact */}
         <div className="mt-8 bg-[#DBEAFE] rounded-lg p-6">
           <div className="text-center">
             <h3 className="text-xl font-bold mb-2 text-[#1D4ED8]">Cần hỗ trợ ngay?</h3>
             <p className="mb-4 text-gray-700">Liên hệ với chúng tôi để được tư vấn miễn phí</p>
             <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <button className="bg-blue-400 text-white px-6 py-2 rounded-lg font-medium hover:bg-[#c62828] transition-all duration-300">
                 Gọi ngay: 0909 567 999
               </button>
               <button className="bg-blue-400 text-white px-6 py-2 rounded-lg font-medium hover:bg-[#c62828] transition-all duration-300">
                 Chat với chúng tôi
               </button>
             </div>
           </div>
         </div>
      </div>
    </div>
  );
};

export default withBaseComponent(FAQ);