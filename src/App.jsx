import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import PublicLayout from "./components/public/PublicLayout";
import AdminLayout from "./components/admin/AdminLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import HomePage from "./components/public/HomePage";
import AboutPage from "./components/public/AboutPage";
import EventListPage from "./components/events/EventListPage";
import EventDetailsPage from "./components/events/EventDetailsPage";
import PublicGalleryPage from "./components/public/PublicGalleryPage";

import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";
import MyRegistrationsPage from "./components/user/MyRegistrationsPage";

import AdminDashboardPage from "./components/admin/AdminDashboardPage";
import AdminEventsPage from "./components/admin/AdminEventsPage";
import AdminRegistrationsPage from "./components/admin/AdminRegistrationsPage";
import AdminGalleryPage from "./components/admin/AdminGalleryPage";
import AdminMembersPage from "./components/admin/AdminMembersPage";
import AdminContentPage from "./components/admin/AdminContentPage";
import AdminSponsorsPage from "./components/admin/AdminSponsorsPage";
import AdminUsersPage from "./components/admin/AdminUsersPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public site */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/events" element={<EventListPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />
          <Route path="/gallery" element={<PublicGalleryPage />} />
          <Route
            path="/my-registrations"
            element={
              <ProtectedRoute>
                <MyRegistrationsPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Auth pages — no layout chrome */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin panel — ROLE_ADMIN guarded at the layout level */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="events" element={<AdminEventsPage />} />
          <Route path="registrations" element={<AdminRegistrationsPage />} />
          <Route path="gallery" element={<AdminGalleryPage />} />
          <Route path="members" element={<AdminMembersPage />} />
          <Route path="content" element={<AdminContentPage />} />
          <Route path="sponsors" element={<AdminSponsorsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
        </Route>

        {/* Compatibility redirect: legacy /membership /register?plan= URLs go home */}
        <Route path="/membership" element={<Navigate to="/" replace />} />
        <Route path="/about-us" element={<Navigate to="/about" replace />} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
