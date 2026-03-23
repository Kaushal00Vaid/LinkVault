import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-primary">
        Loading...
      </div>
    )
  }

  // If logged in, send them to dashboard. Otherwise, render the page.
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />
}
