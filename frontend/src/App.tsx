import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import Login from "./pages/Login"
import Register from "./pages/Register"
import AuthCallback from "./pages/AuthCallback"
import Dashboard from "./pages/Dashboard"
import ProtectedRoute from "./components/ProtectedRoute"
import GuestRoute from "./components/GuestRoute"

// Temporary placeholder for your actual Landing Page
const LandingPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
    <h1 className="text-4xl font-bold">LinkVault Landing Page</h1>
  </div>
)

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Truly Public Route (Accessible to EVERYONE) */}
          <Route path="/" element={<LandingPage />} />

          {/* Guest Routes (Only accessible if NOT logged in) */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* OAuth Callback */}
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Protected Routes (Only accessible if logged in) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
