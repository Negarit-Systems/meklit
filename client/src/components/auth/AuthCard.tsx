import * as React from "react"
import { cn } from "@/lib/utils"

interface AuthCardProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function AuthCard({ title, description, children, className }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className={cn(
        "bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border border-border rounded-lg shadow-lg p-8 w-full max-w-md",
        className
      )}>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {description && <p className="text-sm text-muted-foreground mt-2">{description}</p>}
        </div>
        {children}
      </div>
    </div>
  )
}