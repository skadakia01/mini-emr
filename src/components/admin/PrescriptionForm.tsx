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
import { medications } from "@/config/medications"

const schema = z.object({
  medicationName: z.string().min(1, "Select a medication"),
  dosage: z.string().min(1, "Select a dosage"),
  quantity: z.number({ error: "Required" }).min(1, "Must be at least 1"),
  refillDate: z.string().min(1, "Required"),
  refillSchedule: z.enum(["NONE", "MONTHLY", "QUARTERLY"]),
})

type FormValues = z.infer<typeof schema>

type PrescriptionData = {
  id: number
  medicationName: string
  dosage: string
  quantity: number
  refillDate: string
  refillSchedule: "NONE" | "MONTHLY" | "QUARTERLY"
}

type Props = {
  patientId: number
  prescription?: PrescriptionData
  onSuccess: () => void
}

export default function PrescriptionForm({ patientId, prescription, onSuccess }: Props) {
  const router = useRouter()
  const isEdit = !!prescription

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      medicationName: prescription?.medicationName ?? "",
      dosage: prescription?.dosage ?? "",
      quantity: prescription?.quantity ?? 1,
      refillDate: prescription?.refillDate
        ? new Date(prescription.refillDate).toISOString().split("T")[0]
        : "",
      refillSchedule: prescription?.refillSchedule ?? "NONE",
    },
  })

  const selectedMed = form.watch("medicationName")
  const availableDosages =
    medications.find((m) => m.name === selectedMed)?.dosages ?? medications[0]?.dosages ?? []

  async function onSubmit(values: FormValues) {
    try {
      const payload = {
        patientId,
        medicationName: values.medicationName,
        dosage: values.dosage,
        quantity: values.quantity,
        refillDate: new Date(values.refillDate).toISOString(),
        refillSchedule: values.refillSchedule,
      }

      const url = isEdit ? `/api/prescriptions/${prescription!.id}` : "/api/prescriptions"
      const method = isEdit ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to save prescription")

      toast.success(isEdit ? "Prescription updated" : "Prescription added")
      onSuccess()
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormItem>
          <FormLabel>Medication</FormLabel>
          <Controller
            name="medicationName"
            control={form.control}
            render={({ field, fieldState }) => (
              <>
                <Select
                  value={field.value || null}
                  onValueChange={(v) => {
                    field.onChange(v ?? "")
                    form.setValue("dosage", "")
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>{!field.value && <span className="text-muted-foreground">Select medication…</span>}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {medications.map((m) => (
                      <SelectItem key={m.name} value={m.name}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.error && (
                  <p className="text-sm font-medium text-destructive">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
        </FormItem>

        <FormItem>
          <FormLabel>Dosage</FormLabel>
          <Controller
            name="dosage"
            control={form.control}
            render={({ field, fieldState }) => (
              <>
                <Select
                  value={field.value || null}
                  onValueChange={(v) => field.onChange(v ?? "")}
                  disabled={!selectedMed}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>{!field.value && <span className="text-muted-foreground">Select dosage…</span>}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {availableDosages.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.error && (
                  <p className="text-sm font-medium text-destructive">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
        </FormItem>

        <div className="grid grid-cols-2 gap-4">
          <FormItem>
            <FormLabel>Quantity</FormLabel>
            <Input
              type="number"
              min={1}
              defaultValue={form.getValues("quantity")}
              {...form.register("quantity", { valueAsNumber: true })}
            />
            <FormMessage>{form.formState.errors.quantity?.message}</FormMessage>
          </FormItem>
          <FormField control={form.control} name="refillDate" render={({ field }) => (
            <FormItem>
              <FormLabel>Refill Date</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormItem>
          <FormLabel>Refill Schedule</FormLabel>
          <Controller
            name="refillSchedule"
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
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </FormItem>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving…" : isEdit ? "Save Changes" : "Add Prescription"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
