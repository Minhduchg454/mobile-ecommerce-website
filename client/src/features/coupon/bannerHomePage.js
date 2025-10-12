import { Banner } from "../../components";

const banners = [
  require("../../assets/banner-iphone.webp"),
  require("../../assets/banner-apple.webp"),
  require("../../assets/banner-combo.webp"),
  require("../../assets/banner-laptop.webp"),
  require("../../assets/banner-dongho.webp"),
  require("../../assets/banner-5.webp"),
  require("../../assets/banner-7.webp"),
  require("../../assets/banner-8.webp"),
];

export const BannerHomePage = () => {
  return (
    <div>
      <Banner images={banners} delay={5000} />
    </div>
  );
};
