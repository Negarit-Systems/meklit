
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  BarChart3,
  FileText,
} from "lucide-react"
import { motion } from "framer-motion"
import { useLocation, useNavigate } from "react-router-dom"

interface SidebarProps {
  className?: string
}

export function SideBar({ className }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [active, setActive] = useState(location.pathname || "/dashboard")

  useEffect(() => {
    setActive(location.pathname)
  }, [location.pathname])

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: BarChart3, label: "Compare Analytics", href: "/comparision" },
    { icon: FileText, label: "Reports", href: "/reports" },
  ]

  return (
    <motion.div
      animate={{ width: isCollapsed ? 64 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "relative flex h-screen flex-col bg-gradient-to-b from-sidebar/90 to-sidebar border-r border-sidebar-border backdrop-blur-xl shadow-xl transition-all duration-300",
        "group overflow-hidden",
        className,
      )}
    >
      {/* Decorative diagonal stripes background (blue/green) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-20 bg-[repeating-linear-gradient(315deg,rgba(59,130,246,0.35)_0_2px,transparent_2px_12px,rgba(34,197,94,0.35)_12px_14px,transparent_14px_24px)]"
      />

  {/* Header */}
    <div className="flex h-16 items-center justify-center px-4 border-b border-sidebar-border">
        <motion.div
          animate={{ opacity: isCollapsed ? 0 : 1 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2"
        >
          <div className="h-8 w-8 rounded-xl bg-gradient-to-r from-secondary to-primary flex items-center justify-center shadow-md">
            <LayoutDashboard className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg text-sidebar-foreground tracking-wide">
            Admin panel
          </span>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3 mt-10">
        {menuItems.map((item) => {
          const isActive = active === item.href
          return (
            <Button
              key={item.href}
              variant="ghost"
              onClick={() => {
                setActive(item.href)
                navigate(item.href)
              }}
              className={cn(
                "w-full justify-start gap-3 h-11 px-3 text-sm font-medium rounded-xl relative overflow-hidden transition-all duration-200",
                "hover:scale-[1.02] hover:shadow-md hover:text-sidebar-accent-foreground",
                isCollapsed && "justify-center px-0 gap-0",
                isActive
                  ? "bg-gradient-to-r from-secondary/80 to-primary/80 text-white shadow-lg"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span
                className={cn(
                  "transition-[opacity,width] duration-200",
                  isCollapsed ? "opacity-0 w-0 pointer-events-none hidden" : "opacity-100 w-auto"
                )}
              >
                {item.label}
              </span>
            </Button>
          )
        })}
      </nav>

      <div className="absolute top-1/2 -translate-y-1/2 right-2 z-20">
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed((v) => !v)}
            className={cn(
                "h-12 w-12 p-0 rounded-full shadow-xl bg-gradient-to-r from-secondary/40 to-primary/40 hover:bg-sidebar-accent text-sidebar-foreground hover:cursor-pointer",
                "border border-sidebar-border backdrop-blur-lg",
                "hover:ring-2 hover:ring-primary/40 transition-all duration-200"
            )}
            style={{
                boxShadow: "0 8px 24px rgba(0,0,0,0.18)", 
            }}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
            {isCollapsed ? (
                <ChevronRight className="h-6 w-6" />
            ) : (
                <ChevronLeft className="h-6 w-6" />
            )}
        </Button>
      </div>

      {/* Footer */}
      <motion.div
        animate={{ opacity: isCollapsed ? 0 : 1 }}
        transition={{ duration: 0.2 }}
        className="p-4 border-t border-sidebar-border"
      >
        <div className="flex items-center gap-3 group/profile cursor-pointer hover:scale-[1.02] transition-all duration-200">
          <div className="h-9 w-9 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center shadow-lg">
            <span className="text-xs font-semibold text-white">AD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">user admin</p>
            <p className="text-xs text-sidebar-foreground/70 truncate">admin@negarit.com</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
