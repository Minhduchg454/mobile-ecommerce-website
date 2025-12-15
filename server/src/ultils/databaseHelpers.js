const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return "0 ₫";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

module.exports = {
  formatCurrency,
};
