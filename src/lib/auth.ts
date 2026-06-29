import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        let patient
        try {
          patient = await prisma.patient.findUnique({
            where: { email: credentials.email },
          })
        } catch (e) {
          console.error("[auth] DB error:", e)
          return null
        }
        if (!patient) return null

        const passwordMatch = await bcrypt.compare(credentials.password, patient.password)
        if (!passwordMatch) return null

        return {
          id: String(patient.id),
          firstName: patient.firstName,
          lastName: patient.lastName,
          email: patient.email,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.firstName = (user as any).firstName
        token.lastName = (user as any).lastName
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string
      }
      return session
    },
  },
  pages: {
    signIn: "/",
  },
}
