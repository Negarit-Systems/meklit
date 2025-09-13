import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthCard } from "@/components/auth/AuthCard"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { useLogin } from "@/services/auth"
import type { AxiosError } from "axios"
import ErrorMessage from "@/components/status/ErrorMessage"
import SuccessMessage from "@/components/status/SuccessMessage"
import Spinner from "@/components/status/Spinner"

export function SignIn() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = React.useState(false)
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
  })

  const { mutate: login, isPending, isSuccess, isError, error } = useLogin({
    onSuccess: () => {
      navigate("/dashboard")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login({ email: formData.email, password: formData.password })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <AuthCard
      title="Welcome"
      description="Sign in to access your Meklit dashboard"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {isError && (
          <ErrorMessage message={(error as AxiosError<{ message?: string }>)?.response?.data?.message || "Sign in failed"} />
        )}
        {isSuccess && <SuccessMessage message="Signed in successfully" />}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-foreground">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@learningcenter.com"
              value={formData.email}
              onChange={handleChange}
              className="pl-10 h-11 bg-input border-border focus:ring-2 focus:ring-ring focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-foreground">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="pl-10 pr-10 h-11 bg-input border-border focus:ring-2 focus:ring-ring focus:border-transparent"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 shadow-sm hover:shadow-md"
          disabled={isPending}
        >
          <span className="inline-flex items-center gap-2">
            {isPending && <Spinner spin property="h-4 w-4" />} Sign In to Dashboard
          </span>
        </Button>

        <div className="text-center pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            New to Meklit?{" "}
            <a href="/sign-up" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Create your account
            </a>
          </p>
        </div>
      </form>
    </AuthCard>
  )
}
