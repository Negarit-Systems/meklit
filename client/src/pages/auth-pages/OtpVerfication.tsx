import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthCard } from "@/components/auth/AuthCard"

export function OtpVerification() {
  const navigate = useNavigate()
  const [otp, setOtp] = React.useState(["", "", "", "", "", ""])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newOtp = [...otp]
    newOtp[index] = e.target.value
    setOtp(newOtp)

    // Auto-focus next input
    if (e.target.value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Add API call here for OTP verification
    navigate("/dashboard")
  }

  return (
    <AuthCard
      title="OTP Verification"
      description="Enter the 6-digit code sent to your email"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between">
          {otp.map((digit, index) => (
            <Input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e, index)}
              className="w-12 h-12 text-center text-lg"
              required
            />
          ))}
        </div>
        <Button type="submit" className="w-full">
          Verify OTP
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Didn't receive a code?{" "}
          <a href="#" className="text-primary hover:underline">
            Resend OTP
          </a>
        </p>
      </form>
    </AuthCard>
  )
}