import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const patientId = request.nextUrl.searchParams.get("patientId")
    if (!patientId) {
      return Response.json({ error: "patientId query param is required" }, { status: 400 })
    }

    const prescriptions = await prisma.prescription.findMany({
      where: { patientId: Number(patientId) },
      orderBy: { refillDate: "asc" },
    })

    return Response.json({ data: prescriptions })
  } catch {
    return Response.json({ error: "Failed to fetch prescriptions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { patientId, medicationName, dosage, quantity, refillDate, refillSchedule } = body

    if (!patientId || !medicationName || !dosage || !quantity || !refillDate) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const prescription = await prisma.prescription.create({
      data: {
        patientId: Number(patientId),
        medicationName,
        dosage,
        quantity: Number(quantity),
        refillDate: new Date(refillDate),
        refillSchedule: refillSchedule ?? "NONE",
      },
    })

    return Response.json({ data: prescription }, { status: 201 })
  } catch {
    return Response.json({ error: "Failed to create prescription" }, { status: 500 })
  }
}
