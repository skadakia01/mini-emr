import { NextRequest } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        dateOfBirth: true,
        phone: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    })
    return Response.json({ data: patients })
  } catch {
    return Response.json({ error: "Failed to fetch patients" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, password, dateOfBirth, phone, address } = body

    if (!firstName || !lastName || !email || !password) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const patient = await prisma.patient.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        phone: phone ?? null,
        address: address ?? null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        dateOfBirth: true,
        phone: true,
        address: true,
        createdAt: true,
      },
    })

    return Response.json({ data: patient }, { status: 201 })
  } catch (e: any) {
    if (e?.code === "P2002") {
      return Response.json({ error: "Email already exists" }, { status: 400 })
    }
    return Response.json({ error: "Failed to create patient" }, { status: 500 })
  }
}
