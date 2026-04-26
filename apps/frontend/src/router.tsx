import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import { HomePage } from "./pages/HomePage";
import { ShowListingPage } from "./pages/ShowListingPage";
import { ShowDetailsPage } from "./pages/ShowDetailsPage";
import { SeatSelectionPage } from "./pages/SeatSelectionPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { MyBookingsPage } from "./pages/MyBookingsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { DashboardPage } from "./pages/admin/DashboardPage";
import { ManageShowsPage } from "./pages/admin/ManageShowsPage";
import { ManageUsersPage } from "./pages/admin/ManageUsersPage";
import { ManageVenuesPage } from "./pages/admin/ManageVenuesPage";
import { GoogleAuthCallbackPage } from "./pages/GoogleAuthCallbackPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "auth/google/callback", element: <GoogleAuthCallbackPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "shows", element: <ShowListingPage /> },
      { path: "shows/:showId", element: <ShowDetailsPage /> },
      { path: "shows/:showId/seats", element: <SeatSelectionPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "profile", element: <ProfilePage /> },
        ],
      },
      {
        element: <ProtectedRoute roles={["USER"]} />,
        children: [
          { path: "checkout", element: <CheckoutPage /> },
          { path: "bookings", element: <MyBookingsPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute roles={["ADMIN", "ORGANIZER"]} />,
    children: [
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "shows", element: <ManageShowsPage /> },
          { path: "venues", element: <ManageVenuesPage /> },
        ],
      },
    ]
  },
  {
    element: <ProtectedRoute roles={["ADMIN"]} />,
    children: [
      {
        path: "/admin/users",
        element: <AdminLayout />,
        children: [
          { index: true, element: <ManageUsersPage /> },
        ],
      },
    ],
  },
]);
