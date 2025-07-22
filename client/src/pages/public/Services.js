import React from "react";
import withBaseComponent from "hocs/withBaseComponent";
import {
  MdPayment,
  MdLightbulb,
  MdWaterDrop,
  MdLocalShipping,
  MdSecurity,
  MdHealthAndSafety,
  MdPhoneAndroid,
  MdWifi,
  MdGamepad,
  MdReceipt,
  MdShield,
  MdSwapHoriz,
  MdDataUsage,
  MdAccountBalanceWallet,
  MdCreditCard,
  MdRouter,
} from "react-icons/md";
import { FaPlane, FaTrain, FaCar } from "react-icons/fa";

const Services = () => {
  const billPaymentServices = [
    {
      id: 1,
      title: "Đóng tiền trả góp",
      icon: <MdAccountBalanceWallet className="text-gray-700" size={32} />,
      color: "bg-yellow-400",
    },
    {
      id: 2,
      title: "Đóng tiền điện",
      icon: <MdLightbulb className="text-yellow-500" size={32} />,
      color: "bg-yellow-400",
    },
    {
      id: 3,
      title: "Đóng tiền nước",
      icon: <MdWaterDrop className="text-blue-500" size={32} />,
      color: "bg-blue-400",
    },
    {
      id: 4,
      title: "Đóng tiền NET FPT",
      icon: <MdWifi className="text-orange-500" size={32} />,
      color: "bg-orange-400",
    },
    {
      id: 5,
      title: "Đóng tiền net, cáp...",
      icon: <MdRouter className="text-blue-600" size={32} />,
      color: "bg-blue-500",
    },
    {
      id: 6,
      title: "Vé tàu, xe, máy bay",
      icon: (
        <div className="flex items-center gap-1">
          <FaPlane className="text-gray-700" size={24} />
          <FaTrain className="text-gray-700" size={24} />
          <FaCar className="text-gray-700" size={24} />
        </div>
      ),
      color: "bg-yellow-400",
    },
  ];

  const warrantyInsuranceServices = [
    {
      id: 1,
      title: "Bảo hiểm xe máy - Ô tô",
      icon: <MdLocalShipping className="text-gray-700" size={32} />,
      color: "bg-gray-400",
    },
    {
      id: 2,
      title: "Đóng BHYT- BHXH",
      icon: <MdHealthAndSafety className="text-blue-600" size={32} />,
      color: "bg-blue-400",
    },
    {
      id: 3,
      title: "Bảo hành rơi vỡ",
      icon: (
        <div className="relative">
          <MdPhoneAndroid className="text-gray-700" size={32} />
          <MdShield className="text-yellow-500 absolute -top-1 -right-1" size={20} />
        </div>
      ),
      color: "bg-gray-400",
    },
    {
      id: 4,
      title: "Bảo hành mở rộng",
      icon: (
        <div className="relative">
          <MdPhoneAndroid className="text-gray-700" size={32} />
          <MdShield className="text-yellow-500 absolute -top-1 -right-1" size={20} />
        </div>
      ),
      color: "bg-gray-400",
    },
    {
      id: 5,
      title: "Bảo hành 1 đổi 1",
      icon: <MdSwapHoriz className="text-yellow-500" size={32} />,
      color: "bg-yellow-400",
    },
  ];

  const telecomServices = [
    {
      id: 1,
      title: "Mua gói data 3G, 4G",
      icon: (
        <div className="relative">
          <MdPhoneAndroid className="text-gray-700" size={32} />
          <MdWifi className="text-yellow-500 absolute -top-1 -right-1" size={20} />
        </div>
      ),
      color: "bg-gray-400",
    },
    {
      id: 2,
      title: "Nạp tiền trả trước",
      icon: (
        <div className="relative">
          <MdPhoneAndroid className="text-gray-700" size={32} />
          <MdPayment className="text-yellow-500 absolute -top-1 -right-1" size={20} />
        </div>
      ),
      color: "bg-gray-400",
    },
    {
      id: 3,
      title: "Nạp tiền trả sau",
      icon: (
        <div className="relative">
          <MdPhoneAndroid className="text-gray-700" size={32} />
          <MdCreditCard className="text-yellow-500 absolute -top-1 -right-1" size={20} />
        </div>
      ),
      color: "bg-gray-400",
    },
    {
      id: 4,
      title: "Thẻ cào game",
      icon: <MdGamepad className="text-gray-700" size={32} />,
      color: "bg-gray-400",
    },
    {
      id: 5,
      title: "Thẻ cào điện thoại",
      icon: (
        <div className="relative">
          <MdPhoneAndroid className="text-gray-700" size={32} />
          <MdReceipt className="text-yellow-500 absolute -top-1 -right-1" size={20} />
        </div>
      ),
      color: "bg-gray-400",
    },
  ];

  const ServiceSection = ({ title, services, priceTag }) => (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6">
                 <h2 className="text-2xl font-bold text-[#333]">{title}</h2>
        {priceTag && (
          <span className="text-sm text-red-600 font-medium bg-red-50 px-2 py-1 rounded">
            {priceTag}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer group"
          >
            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full ${service.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                {service.icon}
              </div>
                             <p className="text-sm font-medium text-[#333] leading-tight">
                 {service.title}
               </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full px-4 py-8">
      <div className="xl:w-main m-auto">
        {/* Header */}
        <div className="text-center mb-8">
                     <h1 className="text-3xl font-bold text-[#333] mb-2">
             Dịch vụ tiện ích
           </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Thanh toán hóa đơn, bảo hành bảo hiểm và các tiện ích viễn thông 
            nhanh chóng, an toàn và tiện lợi
          </p>
        </div>

        {/* Services Sections */}
        <div className="space-y-8">
          <ServiceSection
            title="Thanh toán hóa đơn"
            services={billPaymentServices}
          />
          
          <ServiceSection
            title="Bảo hành - Bảo hiểm"
            services={warrantyInsuranceServices}
            priceTag="Từ 60.500đ"
          />
          
          <ServiceSection
            title="Tiện ích viễn thông"
            services={telecomServices}
          />
        </div>

        {/* Additional Info */}
        <div className="mt-12 bg-[#DBEAFE] rounded-lg p-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-6 text-[#007bff]">
              Tại sao chọn dịch vụ của chúng tôi?
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white shadow mb-4">
                  <MdSecurity className="text-4xl text-[#1D4ED8]" />
                </div>
                <h4 className="font-semibold mb-2 text-[#007bff] text-lg">An toàn</h4>
                <p className="text-base text-gray-700">
                  Thanh toán bảo mật, thông tin được mã hóa
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white shadow mb-4">
                  <MdLocalShipping className="text-4xl text-[#1D4ED8]" />
                </div>
                <h4 className="font-semibold mb-2 text-[#007bff] text-lg">Nhanh chóng</h4>
                <p className="text-base text-gray-700">
                  Xử lý giao dịch trong vòng 30 giây
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white shadow mb-4">
                  <MdPayment className="text-4xl text-[#1D4ED8]" />
                </div>
                <h4 className="font-semibold mb-2 text-[#007bff] text-lg">Tiện lợi</h4>
                <p className="text-base text-gray-700">
                  Thanh toán mọi lúc, mọi nơi
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withBaseComponent(Services);
