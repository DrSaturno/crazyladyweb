import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import BotWidget from "./BotWidget";

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-cls-cream">
      <a className="skip-link" href="#main-content">Saltar al contenido</a>
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <BotWidget />
    </div>
  );
}
