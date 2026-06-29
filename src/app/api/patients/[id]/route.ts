import { NextRequest } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
        createdAt: true,
        updatedAt: true,
        appointments: true,
        prescriptions: true,
      },
    })

    if (!patient) {
      return Response.json({ error: "Patient not found" }, { status: 404 })
    }

    return Response.json({ data: patient })
  } catch {
    return Response.json({ error: "Failed to fetch patient" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { password, dateOfBirth, ...rest } = body

    const updateData: Record<string, any> = { ...rest }
    if (password) updateData.password = await bcrypt.hash(password, 12)
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth)

    const patient = await prisma.patient.update({
      where: { id: Number(id) },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        dateOfBirth: true,
        phone: true,
        address: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return Response.json({ data: patient })
  } catch (e: any) {
    if (e?.code === "P2025") {
      return Response.json({ error: "Patient not found" }, { status: 404 })
    }
    return Response.json({ error: "Failed to update patient" }, { status: 500 })
  }
}
