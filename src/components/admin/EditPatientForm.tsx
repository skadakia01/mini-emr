"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
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

const schema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  password: z.string().optional(),
  dateOfBirth: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

type Patient = {
  id: number
  firstName: string
  lastName: string
  email: string
  dateOfBirth: string | null
  phone: string | null
  address: string | null
}

export default function EditPatientForm({
  patient,
  onSuccess,
}: {
  patient: Patient
  onSuccess: () => void
}) {
  const router = useRouter()

  function toDateInput(val: string | null): string {
    if (!val) return ""
    return new Date(val).toISOString().split("T")[0]
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      password: "",
      dateOfBirth: toDateInput(patient.dateOfBirth),
      phone: patient.phone ?? "",
      address: patient.address ?? "",
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      const payload: Record<string, unknown> = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        dateOfBirth: values.dateOfBirth || null,
        phone: values.phone || null,
        address: values.address || null,
      }
      if (values.password) payload.password = values.password

      const res = await fetch(`/api/patients/${patient.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to update patient")
      toast.success("Patient updated")
      onSuccess()
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="firstName" render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="lastName" render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl><Input type="email" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem>
            <FormLabel>New Password <span className="text-gray-400 font-normal">(leave blank to keep current)</span></FormLabel>
            <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Birth</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl><Input type="tel" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="address" render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
