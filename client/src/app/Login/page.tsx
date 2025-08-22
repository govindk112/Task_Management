'use client'

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Login failed")

      // ✅ Save JWT token
      localStorage.setItem("token", data.token)

      // ✅ Redirect to Dashboard
      router.push("/")
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden p-0" style={{ backgroundColor: "#CBF1F5" }}>
            <CardContent className="grid p-0 md:grid-cols-2">
              <form onSubmit={handleSubmit} className="p-6 md:p-8">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center text-center">
                    <h1 className="text-2xl font-bold">Login Your Account</h1>
                    <p className="text-muted-foreground text-balance">
                      Enter your email and password to login to your account.
                    </p>
                  </div>

                  {/* Email */}
                  <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="grid gap-3">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  {/* Error */}
                  {error && <p className="text-red-500 text-sm">{error}</p>}

                  {/* Submit */}
                  <Button type="submit" className="w-full">
                    Login
                  </Button>

                  <div className="text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <Link href="/Register" className="underline underline-offset-4">
                      Sign up
                    </Link>
                  </div>
                </div>
              </form>

              <div className="bg-muted relative hidden md:block">
                <img
                  src="/Task.jpg"
                  alt="Image"
                  className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
              </div>
            </CardContent>
          </Card>
          <div className="text-muted-foreground text-center text-xs">
            By clicking continue, you agree to our <a href="https://generator.lorem-ipsum.info/terms-and-conditions">Terms of Service</a>{" "}
            and <a href="https://generator.lorem-ipsum.info/privacy-policy">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  )
}
