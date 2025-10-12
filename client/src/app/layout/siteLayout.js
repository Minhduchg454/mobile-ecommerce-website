import { Outlet } from "react-router-dom";
import { Header1, Footer, ScrollToTop } from "../../components";

export const SiteLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-app-bg">
      <ScrollToTop />
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header1 />
      </div>
      <main className="min-h-0 flex-1 pt-[50px]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
