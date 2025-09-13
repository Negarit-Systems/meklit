import * as React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthCard } from "@/components/auth/AuthCard"
import { useResendOtp, useVerifyUser } from "@/services/auth"
import ErrorMessage from "@/components/status/ErrorMessage"
import SuccessMessage from "@/components/status/SuccessMessage"
import Spinner from "@/components/status/Spinner"
import type { AxiosError } from "axios"

export function OtpVerification() {
  const navigate = useNavigate()
  const location = useLocation() as { state?: { email?: string } }
  const [otp, setOtp] = React.useState(["", "", "", "", "", ""])
  const email = location?.state?.email ?? ""
  const [resendCooldown, setResendCooldown] = React.useState(600)
  const [canResend, setCanResend] = React.useState(false)

  const { mutate: resendOtp, isPending: isResending, isSuccess: isResendSuccess, isError: isResendError, error: resendError } = useResendOtp({
    onSuccess: () => {
      setCanResend(false)
      setResendCooldown(600)
    },
  })

  React.useEffect(() => {
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev === 1) {
          setCanResend(true)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isResendSuccess])

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

  const handleResendOtp = () => {
    if (canResend && email) {
      resendOtp({ email })
    }
  }

  return (
    <AuthCard
      title="OTP Verification"
      description="Enter the 6-digit code sent to your email. The code will expire in 10 minutes."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {email === "" && (
          <ErrorMessage message="Missing email context. Please register again." />
        )}
        {isError && (
          <ErrorMessage message={(error as AxiosError<{ message?: string }>)?.response?.data?.message || "Verification failed"} />
        )}
        {isResendError && (
          <ErrorMessage message={(resendError as AxiosError<{ message?: string }>)?.response?.data?.message || "Failed to resend OTP"} />
        )}
        {isSuccess && <SuccessMessage message="Account verified successfully. You can sign in now." />}
        {isResendSuccess && <SuccessMessage message="A new OTP has been sent to your email." />}
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
          <Button
            type="button"
            variant="link"
            className="p-0 h-auto"
            onClick={handleResendOtp}
            disabled={!canResend || isResending}
          >
            {isResending ? "Sending..." : canResend ? "Resend OTP" : `Resend in ${resendCooldown}s`}
          </Button>
        </p>
      </form>
    </AuthCard>
  )
}