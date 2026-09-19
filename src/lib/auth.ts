import NextAuth, { type DefaultSession } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { dbFallback } from './db-fallback'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'ADMIN' | 'CUSTOMER'
      businessName?: string
    } & DefaultSession['user']
  }

  interface User {
    id: string
    role: 'ADMIN' | 'CUSTOMER'
    businessName?: string
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = String(credentials.email).toLowerCase().trim()
        const password = String(credentials.password)

        // Try Prisma DB first
        try {
          const user = await prisma.user.findUnique({
            where: { email },
          })

          if (user && user.isActive) {
            const isValid = await bcrypt.compare(password, user.passwordHash)
            if (isValid) {
              return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role as 'ADMIN' | 'CUSTOMER',
                businessName: user.businessName,
              }
            }
          }
        } catch {
          // Fall back to resilient in-memory / local store
        }

        const fallbackUser = dbFallback.findUserByEmail(email)
        if (fallbackUser && fallbackUser.isActive) {
          const isValid = await bcrypt.compare(password, fallbackUser.passwordHash)
          if (isValid) {
            return {
              id: fallbackUser.id,
              email: fallbackUser.email,
              name: fallbackUser.name,
              role: fallbackUser.role,
              businessName: fallbackUser.businessName,
            }
          }
        }

        return null
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.businessName = user.businessName
      }
      return token
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as 'ADMIN' | 'CUSTOMER'
        session.user.businessName = token.businessName as string | undefined
      }
      return session
    },
  },
  pages: {
    signIn: '/admin/login',
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET || 'tuffloom-traders-super-secret-key-phase2-2026',
})
