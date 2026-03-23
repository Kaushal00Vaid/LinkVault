import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { authApi } from "../api/auth.api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import env from "../config/env"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { loginUser } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await authApi.login({ email, password })

      loginUser(res.data, res.data.accessToken)
      navigate("/dashboard")
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuth = (provider: "google" | "github") => {
    window.location.href = `${env.apiBaseUrl}/auth/${provider}`
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border bg-card shadow-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="mb-2 flex justify-center">
            <img
              src="/logos/logo.png"
              alt="LinkVault"
              className="h-10 w-10 object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your credentials to access your Vaults
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="developer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => handleOAuth("github")}
            >
              <img
                src="/logos/github.svg"
                alt="Github"
                className="mr-2 h-4 w-4"
              />{" "}
              Github
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => handleOAuth("google")}
            >
              <img
                src="/logos/google.svg"
                alt="Google"
                className="mr-2 h-4 w-4"
              />{" "}
              Google
            </Button>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium underline hover:text-primary"
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
