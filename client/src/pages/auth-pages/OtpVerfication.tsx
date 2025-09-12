import * as React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthCard } from "@/components/auth/AuthCard"
import { useVerifyUser } from "@/services/auth"
import ErrorMessage from "@/components/status/ErrorMessage"
import SuccessMessage from "@/components/status/SuccessMessage"
import Spinner from "@/components/status/Spinner"
import type { AxiosError } from "axios"

export function OtpVerification() {
  const navigate = useNavigate()
  const location = useLocation() as { state?: { email?: string } }
  const [otp, setOtp] = React.useState(["", "", "", "", "", ""])
  const email = location?.state?.email ?? ""

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

  const { mutate: verifyUser, isPending, isSuccess, isError, error } = useVerifyUser({
    onSuccess: () => {
      navigate("/dashboard")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const code = otp.join("")
    if (code.length !== 6 || !email) return
    verifyUser({ otp: code, email })
  }

  return (
    <AuthCard
      title="OTP Verification"
      description="Enter the 6-digit code sent to your email"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {email === "" && (
          <ErrorMessage message="Missing email context. Please register again." />
        )}
        {isError && (
          <ErrorMessage message={(error as AxiosError<{ message?: string }>)?.response?.data?.message || "Verification failed"} />
        )}
        {isSuccess && <SuccessMessage message="Account verified successfully. You can sign in now." />}
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
        <Button type="submit" className="w-full" disabled={isPending || email === ""}>
          <span className="inline-flex items-center gap-2">
            {isPending && <Spinner spin property="h-4 w-4" />} Verify OTP
          </span>
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