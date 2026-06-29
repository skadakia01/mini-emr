import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import PatientDetailClient from "@/components/admin/PatientDetailClient"

export const dynamic = "force-dynamic"

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const patient = await prisma.patient.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      dateOfBirth: true,
      phone: true,
      address: true,
      appointments: {
        orderBy: { dateTime: "asc" },
      },
      prescriptions: {
        orderBy: { refillDate: "asc" },
      },
    },
  })

  if (!patient) notFound()

  return (
    <div>
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        ← Back to Patients
      </Link>
      <PatientDetailClient patient={JSON.parse(JSON.stringify(patient))} />
    </div>
  )
}
