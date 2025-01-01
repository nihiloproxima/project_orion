import { Routes, Route, Navigate } from "react-router-dom";
import { AuthLayout } from "../components/layouts/AuthLayout";
import { Home } from "../pages/Home";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { Dashboard } from "../pages/Dashboard";
import { ChooseHomeworldPage } from "../pages/ChooseHomeworldPage";
import { Structures } from "../pages/Structures";
import { Configs } from "../pages/Configs";
import { Researchs } from "../pages/Researchs";
import { Shipyard } from "../pages/Shipyard";
import { Fleet } from "../pages/Fleet";

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/choose-homeworld" element={<ChooseHomeworldPage />} />
        <Route path="/structures" element={<Structures />} />
        <Route path="/configs" element={<Configs />} />
        <Route path="/research" element={<Researchs />} />
        <Route path="/shipyard" element={<Shipyard />} />
        <Route path="/fleet" element={<Fleet />} />
        {/* Add other protected routes here */}
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
