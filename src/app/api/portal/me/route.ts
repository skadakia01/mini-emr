import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const patient = await prisma.patient.findUnique({
      where: { id: Number(session.user.id) },
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
        appointments: {
          orderBy: { dateTime: "asc" },
        },
        prescriptions: {
          orderBy: { refillDate: "asc" },
        },
      },
    })

    if (!patient) {
      return Response.json({ error: "Patient not found" }, { status: 404 })
    }

    return Response.json({ data: patient })
  } catch {
    return Response.json({ error: "Failed to fetch patient data" }, { status: 500 })
  }
}
