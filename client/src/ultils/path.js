const path = {
  PUBLIC: "/",
  HOME: "",
  ALL: "*",
  LOGIN: "login",
  REGISTER: "register",
  PRODUCTS__CATEGORY: ":category",
  BLOGS__ID__TITLE: "blogs/:id/:title",
  BLOGS: "blogs",
  OUR_SERVICES: "services",
  FAQ: "faqs",
  DETAIL_PRODUCT__CATEGORY__PID__TITLE: ":categoryName/:slug",
  FINAL_REGISTER: "finalregister/:status",
  RESET_PASSWORD: "reset-password/:token",
  DETAIL_CART: "my-cart",
  CHECKOUT: "checkout",
  PRODUCTS: "products",
  SEARCH_HOME: "tat-ca-san-pham",
  SHOP: "shops",
  CART: "carts",
  ORDER: "orders",

  // Admin
  ADMIN: "admin",
  DASHBOARD: "dashboard",
  MANAGE_USER: "manage-user",
  MANAGE_PRODUCTS: "manage-products",
  MANAGE_ORDER: "manage-order",
  CREATE_PRODUCTS: "create-products",
  CREATE_BLOG: "create-blog",
  MANAGE_BLOGS: "manage-blogs",
  CREATE_VARIATION: "/admin/create-variation/:productId",
  MANAGE_PRODUCTS_CATEGORIES: "manage-products-categories",
  MANAGE_BRANDS: "manage-brands",
  MANAGE_COUPONS: "manage-coupons",

  // Member
  MEMBER: "member",
  PERSONAL: "personal",
  MY_CART: "my-cart",
  HISTORY: "buy-history",
  WISHLIST: "wishlist",
  ADDRESS: "personal-address",
  ORDER_HISTORY: "hoa-don",

  //Customer
  CUSTOMER: "customer",
  C_PROFILE: "profile",
  C_ADDRESS: "addreeses",
  C_ORDER: "orders",
};

export default path;
