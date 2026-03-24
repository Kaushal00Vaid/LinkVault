import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import Login from "./pages/Login"
import Register from "./pages/Register"
import AuthCallback from "./pages/AuthCallback"
import Dashboard from "./pages/Dashboard"
import ProtectedRoute from "./components/ProtectedRoute"
import GuestRoute from "./components/GuestRoute"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import LandingPage from "./pages/LandingPage"
import PublicVaultPage from "./pages/PublicVaultPage"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Truly Public Route (Accessible to EVERYONE) */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/public/:slug" element={<PublicVaultPage />} />

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
    </QueryClientProvider>
  )
}

export default App
