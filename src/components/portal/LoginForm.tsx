"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Heart, Calendar, Pill, Shield, ArrowRight, Loader2 } from "lucide-react"

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Required"),
})

type FormValues = z.infer<typeof schema>

export default function LoginForm() {
  const router = useRouter()
  const [authError, setAuthError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: FormValues) {
    setAuthError(null)
    const result = await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password,
    })
    if (result?.error) {
      setAuthError("Invalid email or password")
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.1)_0%,_transparent_60%)]" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <span className="text-white text-xl font-bold tracking-tight">Mini EMR</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Your health,<br />at your fingertips.
          </h1>
          <p className="text-blue-200 text-lg leading-relaxed max-w-sm">
            Access your appointments, prescriptions, and health records — anytime, anywhere.
          </p>
        </div>
        <div className="relative space-y-4">
          {[
            { icon: Calendar, text: "View upcoming appointments" },
            { icon: Pill, text: "Track prescription refills" },
            { icon: Shield, text: "Secure, private health records" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-blue-100 text-sm">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" fill="currentColor" />
            </div>
            <span className="text-gray-900 text-lg font-bold">Mini EMR</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Sign in</h2>
            <p className="text-gray-500 mt-1 text-sm">Access your patient portal</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Email address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {authError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  <p className="text-sm text-red-700 font-medium">{authError}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in…</>
                ) : (
                  <><span>Sign In</span><ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-center text-xs text-gray-400">
              Staff?{" "}
              <Link href="/admin" className="text-blue-600 hover:text-blue-700 font-medium">
                Go to Admin Dashboard →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
