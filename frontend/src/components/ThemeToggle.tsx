import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            id="theme-toggle"
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="relative overflow-hidden text-muted-foreground hover:text-foreground"
          >
            {/* Sun icon — visible in light mode */}
            <Sun
              className="absolute h-[1.1rem] w-[1.1rem] transition-all duration-300"
              style={{
                opacity: isDark ? 0 : 1,
                transform: isDark ? "rotate(-90deg) scale(0.5)" : "rotate(0deg) scale(1)",
              }}
            />
            {/* Moon icon — visible in dark mode */}
            <Moon
              className="absolute h-[1.1rem] w-[1.1rem] transition-all duration-300"
              style={{
                opacity: isDark ? 1 : 0,
                transform: isDark ? "rotate(0deg) scale(1)" : "rotate(90deg) scale(0.5)",
              }}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <span>{isDark ? "Light mode" : "Dark mode"}</span>
          <kbd className="ml-1.5 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            Ctrl D
          </kbd>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
