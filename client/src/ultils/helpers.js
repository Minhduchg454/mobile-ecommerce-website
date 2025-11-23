import icons from "./icons";

const { AiOutlineStar, AiFillStar } = icons;

const degToRad = (deg) => {
  return deg * (Math.PI / 180);
};
export const calculateDistance = (addressFrom, addressTo) => {
  // Bán kính Trái Đất (đơn vị: km)
  const R = 6371;

  const lat1 = addressFrom.addressLatitude;
  const lon1 = addressFrom.addressLongitude;
  const lat2 = addressTo.addressLatitude;
  const lon2 = addressTo.addressLongitude;

  // Kiểm tra tính hợp lệ của tọa độ
  if (!lat1 || !lon1 || !lat2 || !lon2) {
    console.error("Lỗi: Thiếu tọa độ (addressLatitude hoặc addressLongitude)!");
    return 0;
  }

  // Tính sự chênh lệch vĩ độ và kinh độ
  const dLat = degToRad(lat2 - lat1);
  const dLon = degToRad(lon2 - lon1);

  // Áp dụng công thức Haversine
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degToRad(lat1)) *
      Math.cos(degToRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

export const calculateShippingCost = (addressFrom, addressTo) => {
  const SHIPPING_RATE_PER_KM = 100;
  const BASE_FEE = 10000;

  const distanceInKm = calculateDistance(addressFrom, addressTo);

  if (distanceInKm === 0) {
    return 0;
  }

  // 2. Tính chi phí theo khoảng cách
  const costByDistance = distanceInKm * SHIPPING_RATE_PER_KM;

  // 3. Tổng chi phí
  const totalCost = BASE_FEE + costByDistance;

  return Math.ceil(totalCost / 1000) * 1000;
};

export const getServiceFeatureValue = (servicePlan, key, defaultValue) => {
  if (!servicePlan?.serviceId?.serviceFeatures) return defaultValue;

  const feature = servicePlan.serviceId.serviceFeatures.find(
    (f) => f.key === key
  );

  if (feature) {
    // Chuyển sang số nếu là loại number, nếu không thì lấy giá trị
    return feature.type === "number" ? Number(feature.value) : feature.value;
  }
  return defaultValue;
};

// Trong file helpers.js
export const calculateFinalPrice = (pvPrice, discountPercent) => {
  const basePrice = Number(pvPrice);
  const discount = Number(discountPercent);

  // 1. Kiểm tra giá bán cơ bản (pvPrice)
  if (isNaN(basePrice) || basePrice <= 0) return 0;

  // 2. Kiểm tra và áp dụng chiết khấu (productDiscountPercent)
  if (isNaN(discount) || discount <= 0 || discount >= 100) {
    return basePrice;
  }

  // 3. Tính toán giá cuối cùng và làm tròn (cần thiết cho tiền tệ)
  const finalPrice = basePrice * (1 - discount / 100);
  return Math.round(finalPrice);
};

export const createSlug = (string) =>
  string
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(" ")
    .join("-");

export const formatMoney = (number) => {
  if (number === null || number === undefined || number === "") return "";
  const num = Number(String(number).replace(/\D/g, "")) || 0;
  return num.toLocaleString("vi-VN");
};

export const handleMoneyChange = (e, onChange) => {
  const raw = e.target.value.replace(/\D/g, "");
  onChange(Number(raw || 0));
};

export const renderStarFromNumber = (number, color = "orange", size) => {
  // [CẬP NHẬT] Chỉ thoát nếu đầu vào không phải là số (NaN)
  // Nếu number là 0, nó vẫn là Number(0) = 0 (false), nhưng vẫn cần kiểm tra cụ thể.
  if (isNaN(Number(number))) return;
  const stars = [];
  let roundedNumber = Math.round(Number(number) || 0);
  if (roundedNumber > 5) roundedNumber = 5;

  for (let i = 0; i < roundedNumber; i++) {
    stars.push(
      <AiFillStar key={`fill-${i}`} color={color} size={size || 16} />
    );
  }
  for (let i = roundedNumber; i < 5; i++) {
    stars.push(
      <AiOutlineStar key={`empty-${i}`} color={color} size={size || 16} />
    );
  }
  return stars;
};
export function secondsToHms(d) {
  d = Number(d) / 1000;
  const h = Math.floor(d / 3600);
  const m = Math.floor((d % 3600) / 60);
  const s = Math.floor((d % 3600) % 60);
  return { h, m, s };
}

export const validate = (payload, setInvalidFields) => {
  let invalids = 0;
  const formatPayload = Object.entries(payload);
  for (let arr of formatPayload) {
    if (arr[1].trim() === "") {
      invalids++;
      setInvalidFields((prev) => [
        ...prev,
        { name: arr[0], mes: "Require this field." },
      ]);
    }
  }

  return invalids;
};

export const fotmatPrice = (number) => Math.round(number / 1000) * 1000;

export const generateRange = (start, end) => {
  const length = end + 1 - start;
  return Array.from({ length }, (_, index) => start + index);
};
export function getBase64(file) {
  if (!file) return "";
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

export function dataURLtoFile(dataurl, filename) {
  var arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[arr.length - 1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}
export function getDaysInMonth(customTime, number) {
  const endDay = new Date(customTime)?.getDate() || new Date().getDate();
  const days = number || 15;
  const endPreviousMonth = new Date(
    new Date(customTime)?.getFullYear(),
    new Date(customTime)?.getMonth(),
    0
  ).getDate();
  let day = 1;
  let prevDayStart = 1;
  const daysInMonths = [];
  while (prevDayStart <= +endPreviousMonth) {
    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    daysInMonths.push(
      `${year}-${month < 10 ? `0${month}` : month}-${
        prevDayStart < 10 ? "0" + prevDayStart : prevDayStart
      }`
    );
    prevDayStart += 1;
  }
  while (day <= +endDay) {
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    daysInMonths.push(
      `${year}-${month < 10 ? `0${month}` : month}-${
        day < 10 ? "0" + day : day
      }`
    );
    day += 1;
  }
  return daysInMonths.filter(
    (el, index, self) => index > self.length - days - 2
  );
}
export function getMonthInYear(customTime, number) {
  const endMonth =
    new Date(customTime?.to).getMonth() + 1 || new Date().getMonth() + 1;
  let month = 1;
  const months = number || 8;
  let startLastYear = 1;
  const daysInMonths = [];
  while (startLastYear <= 12) {
    const year = new Date().getFullYear();
    daysInMonths.push(
      `${year - 1}-${startLastYear < 10 ? `0${startLastYear}` : startLastYear}`
    );
    startLastYear += 1;
  }
  while (month <= +endMonth) {
    const year = new Date().getFullYear();
    daysInMonths.push(`${year}-${month < 10 ? `0${month}` : month}`);
    month += 1;
  }
  return daysInMonths.filter(
    (el, index, self) => index > self.length - months - 2
  );
}
export const getDaysInRange = (start, end) => {
  const startDateTime = new Date(start).getTime();
  const endDateTime = new Date(end).getTime();
  return (endDateTime - startDateTime) / (24 * 60 * 60 * 1000);
};
export const getMonthsInRange = (start, end) => {
  let months;
  const d1 = new Date(start);
  const d2 = new Date(end);
  months = (d2.getFullYear() - d1.getFullYear()) * 12;
  months -= d1.getMonth();
  months += d2.getMonth();
  return months <= 0 ? 0 : months;
};

export const formatVnDate = (dateStr) =>
  dateStr ? new Date(dateStr).toLocaleDateString("vi-VN") : "";

export const formatVnCurrency = (value) =>
  typeof value === "number" ? value.toLocaleString("vi-VN") + "₫" : value;

export const getDistanceBetweenProvinces = (
  province1,
  province2,
  locationsData
) => {
  if (!locationsData[province1] || !locationsData[province2]) {
    return null;
  }
  const { lat: lat1, lng: lng1 } = locationsData[province1].center;
  const { lat: lat2, lng: lng2 } = locationsData[province2].center;
  return calculateDistance(lat1, lng1, lat2, lng2);
};
