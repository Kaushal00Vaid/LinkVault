import React, { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@/types/index"
import { authApi } from "../api/auth.api"
import { setAccessToken } from "../api/axios"

interface AuthContextType {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  loginUser: (userData: User, token: string) => void
  logoutUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Attempt to restore session via http-only cookie on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const res = await authApi.checkSession()

        const token = res.data.accessToken
        setToken(token)
        setAccessToken(token)

        const payload = JSON.parse(atob(token.split(".")[1]))
        setUser({ _id: payload._id, name: payload.name, email: payload.email })
      } catch (error) {
        console.log("No active session found.")
      } finally {
        setIsLoading(false)
      }
    }

    initSession()

    // Listen for the custom unauthorized event from Axios interceptor
    const handleUnauthorized = () => {
      setUser(null)
      setToken(null)
    }
    window.addEventListener("auth:unauthorized", handleUnauthorized)

    return () =>
      window.removeEventListener("auth:unauthorized", handleUnauthorized)
  }, [])

  const loginUser = (userData: User, token: string) => {
    setUser(userData)
    setToken(token)
    setAccessToken(token)
  }

  const logoutUser = async () => {
    try {
      await authApi.logout()
    } catch (e) {
      console.error(e)
    } finally {
      setUser(null)
      setToken(null)
      setAccessToken(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user,
        isLoading,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
