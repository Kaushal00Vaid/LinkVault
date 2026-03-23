import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split(".")[1]
    let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")

    // Add missing padding to prevent atob DOMException crash
    const pad = base64.length % 4
    if (pad) {
      if (pad === 1) throw new Error("Invalid JWT base64 length")
      base64 += new Array(5 - pad).join("=")
    }

    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
        })
        .join("")
    )

    return JSON.parse(jsonPayload)
  } catch (e) {
    console.error("Failed to decode token", e)
    return null
  }
}

export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { loginUser } = useAuth()

  useEffect(() => {
    const token = searchParams.get("accessToken")

    if (token) {
      const payload = decodeJWT(token)

      if (payload) {
        const userData = {
          _id: payload._id,
          name: payload.name,
          email: payload.email,
          avatar: payload.avatar,
        }

        loginUser(userData, token)

        navigate("/dashboard", { replace: true })
      } else {
        navigate("/login")
      }
    } else {
      navigate("/login")
    }
  }, [searchParams, navigate, loginUser])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-primary">
      <p className="animate-pulse text-lg font-medium">
        Authenticating your workspace... (Refresh the page if it takes too long)
      </p>
    </div>
  )
}
