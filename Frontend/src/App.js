import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// COMPONENTS
import TopNav from "./components/TopNav";

// PAGES
import HomePage from "./pages/HomePage";
import MapPage from "./pages/MapPage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import DriverPage from "./pages/DriverPage";
import UserManagementPage from "./pages/UserManagementPage";
import CreateUserPage from "./pages/CreateUserPage";
import RequireRole from "./components/RequireRole";


function App() {
  return (
    <BrowserRouter>
      {/* Navbar luôn hiển thị */}
      <TopNav />

      {/* Nội dung trang */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
        <Route
          path="/admin"
          element={
            <RequireRole roles={["admin"]}>
              <AdminPage />
            </RequireRole>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route
          path="/driver"
          element={
            <RequireRole roles={["driver", "admin"]}>
              <DriverPage />
            </RequireRole>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RequireRole roles={["admin"]}>
              <UserManagementPage />
            </RequireRole>
          }
        />
        <Route
          path="/admin/users/create"
          element={
            <RequireRole roles={["admin"]}>
              <CreateUserPage />
            </RequireRole>
          }
        />

        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}


export default App;
