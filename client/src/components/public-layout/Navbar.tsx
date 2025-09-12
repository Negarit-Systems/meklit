import { useEffect, useState, useContext } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Settings, User, Moon, Sun, Menu, X, LayoutDashboard, BarChart3 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLocation, useNavigate } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ThemeContext } from "@/context/ThemeContext"
import { useLogout } from "@/services/auth"

interface NavbarProps {
  className?: string
}

export function Navbar({ className }: NavbarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const isMdUp = useMediaQuery("(min-width: 768px)")
  const { theme, toggleTheme } = useContext(ThemeContext)

  // Close mobile menu when viewport becomes >= md
  useEffect(() => {
    if (isMdUp && open) setOpen(false)
  }, [isMdUp, open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  const { mutate: logout } = useLogout({
    onSuccess: async () => {
      await queryClient.invalidateQueries()
      navigate("/sign-in")
    },
  })

  const handleLogout = async () => {
    logout()
  }

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: BarChart3, label: "Compare Analytics", href: "/comparision" },
  ]

  return (
    <header className={`sticky top-4 z-50 mx-4 ${className}`}>
      <div className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border border-border rounded-lg shadow-lg">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Left: Mobile menu toggle + Brand */}
          <div className="flex items-center gap-2">
            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 md:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <User className="h-5 w-5 text-muted-foreground hidden sm:block" />
            <p className="font-extrabold text-xl bg-gradient-to-r from-secondary to-primary text-transparent bg-clip-text">
              Meklit Dash
            </p>
          </div>

          {/* Right: theme + profile */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 relative"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-xs font-medium text-primary-foreground">AD</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile slide-over menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />

            <motion.aside
              className="absolute left-0 top-0 h-full w-[82%] max-w-xs bg-gradient-to-b from-sidebar to-background border-r border-sidebar-border shadow-2xl"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-r from-secondary to-primary flex items-center justify-center shadow-md">
                    <LayoutDashboard className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-bold text-lg text-sidebar-foreground tracking-wide">Menu</span>
                </div>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setOpen(false)} aria-label="Close menu">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <nav className="p-3 space-y-1">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <Button
                      key={item.href}
                      variant={isActive ? "default" : "ghost"}
                      onClick={() => {
                        navigate(item.href)
                        setOpen(false)
                      }}
                      className={
                        isActive
                          ? "w-full justify-start gap-3 h-11 px-3 rounded-xl bg-gradient-to-r from-secondary/80 to-primary/80 text-white shadow"
                          : "w-full justify-start gap-3 h-11 px-3 rounded-xl text-sidebar-foreground hover:bg-sidebar-accent"
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Button>
                  )
                })}
              </nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}