import { useAuth } from "../context/AuthContext"
import { Button } from "@/components/ui/button"

export default function Dashboard() {
  const { user, logoutUser } = useAuth()

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome to LinkVault
            </h1>
            <p className="text-muted-foreground">
              Logged in as {user?.name} ({user?.email})
            </p>
          </div>
          <Button variant="destructive" onClick={logoutUser}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
