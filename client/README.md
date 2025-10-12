src/
├─ app/
│ ├─ providers/ # Khởi tạo Provider toàn cục (React Query, Theme…)
│ ├─ routes/ # Định nghĩa toàn bộ tuyến (React Router)
│ └─ layout/ # Khung trang (header, sidebar, footer, Outlet)
├─ pages/ # Các trang điều hướng (route target)
├─ features/ # Từng “tính năng” khép kín: UI nhỏ + hooks
│ └─ product/
│ ├─ components/ # Card, Form, Table... dành riêng product
│ └─ hooks/ # useProduct(), useCreateProduct()...
├─ components/
│ ├─ ui/ # Thành phần UI dùng chung (Button, Input, Modal)
│ └─ layout/ # Header/Footer dùng chung
├─ services/ # Gọi API, schema, mapper
│ ├─ http.ts # axios instance + interceptors
│ ├─ auth.api.ts # authApi.login/me/googleLogin...
│ ├─ product.api.ts # productApi.list/detail/create/update/remove
│ └─ product-variation.api.ts
├─ lib/ # Helper thuần (env, storage, formatter…)
│ ├─ env.ts # Đọc ENV: VITE_API_BASE_URL
│ ├─ storage.ts # get/set token localStorage
│ └─ utils.ts # formatMoney, parseQuery...
├─ types/ # Kiểu dữ liệu dùng chung (TS interfaces)
│ ├─ auth.ts
│ ├─ product.ts
│ └─ common.ts
├─ assets/ # Ảnh tĩnh, icon SVG...
├─ index.tsx # Mount app
└─ main.tsx # Bọc Provider, Router
