import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthCard } from "@/components/auth/AuthCard"

export function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Add API call here for password reset
    navigate("/otp-verification")
  }

  return (
    <AuthCard
      title="Forgot Password"
      description="Enter your email to receive a password reset code"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Send Reset Code
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Remembered your password?{" "}
          <a href="/sign-in" className="text-primary hover:underline">
            Sign in
          </a>
        </p>
      </form>
    </AuthCard>
  )
}