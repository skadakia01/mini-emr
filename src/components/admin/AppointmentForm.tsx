"use client"

import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const schema = z.object({
  providerName: z.string().min(1, "Required"),
  dateTime: z.string().min(1, "Required"),
  repeatSchedule: z.enum(["NONE", "WEEKLY", "BIWEEKLY", "MONTHLY"]),
  endDate: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

type AppointmentData = {
  id: number
  providerName: string
  dateTime: string
  repeatSchedule: "NONE" | "WEEKLY" | "BIWEEKLY" | "MONTHLY"
  endDate: string | null
}

type Props = {
  patientId: number
  appointment?: AppointmentData
  onSuccess: () => void
}

function toDateTimeLocal(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function AppointmentForm({ patientId, appointment, onSuccess }: Props) {
  const router = useRouter()
  const isEdit = !!appointment

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      providerName: appointment?.providerName ?? "",
      dateTime: appointment ? toDateTimeLocal(appointment.dateTime) : "",
      repeatSchedule: appointment?.repeatSchedule ?? "NONE",
      endDate: appointment?.endDate
        ? new Date(appointment.endDate).toISOString().split("T")[0]
        : "",
    },
  })

  const repeatSchedule = form.watch("repeatSchedule")

  async function onSubmit(values: FormValues) {
    try {
      const payload = {
        patientId,
        providerName: values.providerName,
        dateTime: new Date(values.dateTime).toISOString(),
        repeatSchedule: values.repeatSchedule,
        endDate:
          values.repeatSchedule !== "NONE" && values.endDate
            ? new Date(values.endDate).toISOString()
            : null,
      }

      const url = isEdit ? `/api/appointments/${appointment!.id}` : "/api/appointments"
      const method = isEdit ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to save appointment")

      toast.success(isEdit ? "Appointment updated" : "Appointment added")
      onSuccess()
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="providerName" render={({ field }) => (
          <FormItem>
            <FormLabel>Provider Name</FormLabel>
            <FormControl><Input placeholder="Dr. Jane Smith" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="dateTime" render={({ field }) => (
          <FormItem>
            <FormLabel>Date & Time</FormLabel>
            <FormControl><Input type="datetime-local" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormItem>
          <FormLabel>Repeat Schedule</FormLabel>
          <Controller
            name="repeatSchedule"
            control={form.control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(v) => field.onChange(v ?? "NONE")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">None</SelectItem>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="BIWEEKLY">Biweekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </FormItem>

        {repeatSchedule !== "NONE" && (
          <FormField control={form.control} name="endDate" render={({ field }) => (
            <FormItem>
              <FormLabel>End Date <span className="text-gray-400 font-normal">(optional)</span></FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving…" : isEdit ? "Save Changes" : "Add Appointment"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
