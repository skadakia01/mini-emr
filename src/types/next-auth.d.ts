import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      firstName: string
      lastName: string
      email: string
    }
  }

  interface User {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    firstName: string
    lastName: string
  }
}
