import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Campaigns from "./pages/Campaigns";
import CreateCampaign from "./pages/CreateCampaign";
import CampaignDetail from "./pages/CampaignDetail";
import MyCampaigns from "./pages/MyCampaigns";
import EditCampaign from "./pages/EditCampaign";
import NonprofitRegister from "./pages/NonprofitRegister";
import Welcome from "./pages/Welcome";
import NonprofitLogin from "./pages/NonprofitLogin";
import NonprofitForgotPassword from "./pages/NonprofitForgotPassword";

import RequireAuth from "./auth/RequireAuth";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";

import "./App.css";

function useSafeBackTracking() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    // Never "back" into donation/checkout-related pages
    const unsafe =
      path.includes("/donate") ||
      path.includes("/donations") ||
      path.includes("/checkout") ||
      path.includes("/success") ||
      path.includes("/cancel");

    if (!unsafe) {
      sessionStorage.setItem("alms:lastSafeFrom", path + location.search);
    }
  }, [location.pathname, location.search]);
}

export default function App() {
  useSafeBackTracking();

  return (
    <>
      {/* Global navigation */}
      <Navbar />

      {/* Page wrapper */}
      <main className="page">
        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<Home />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/campaigns/:id" element={<CampaignDetail />} />

          <Route path="/nonprofit/login" element={<NonprofitLogin />} />
          <Route path="/nonprofit/register" element={<NonprofitRegister />} />
          <Route path="/nonprofit/forgot-password" element={<NonprofitForgotPassword />} />

          {/* PROTECTED */}
          <Route element={<RequireAuth />}>
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/campaigns/my" element={<MyCampaigns />} />
            <Route path="/campaigns/new" element={<CreateCampaign />} />
            <Route path="/campaigns/:id/edit" element={<EditCampaign />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<div style={{ padding: 16 }}>Not found</div>} />
        </Routes>
      </main>
    </>
  );
}