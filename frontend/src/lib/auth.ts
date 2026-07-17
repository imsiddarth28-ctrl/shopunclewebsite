import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { getUserByEmail, getUserById } from '@/lib/models'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

if (!process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET === 'your-super-secret-key-change-in-production') {
  console.warn('[auth] WARNING: NEXTAUTH_SECRET is not configured or using default placeholder. Sessions are insecure!')
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        // Admin bypass via environment variables only — credentials never hardcoded in source
        const adminEmail = process.env.ADMIN_EMAIL
        const adminPassword = process.env.ADMIN_PASSWORD
        if (
          adminEmail &&
          adminPassword &&
          credentials.email === adminEmail &&
          credentials.password === adminPassword
        ) {
          return {
            id: 'admin-env-id',
            email: adminEmail,
            name: 'Shop Uncle Admin',
            role: 'ADMIN',
            image: undefined,
            phone: undefined,
          }
        }

        const user = await getUserByEmail(credentials.email)

        if (!user || !user.password) {
          throw new Error('Invalid credentials')
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          throw new Error('Invalid credentials')
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
          phone: user.phone,
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        const { email, name, image } = user
        if (!email) return false

        try {
          const { db } = await connectToDatabase()

          // Check if user already exists
          let existingUser = await db.collection('users').findOne({ email })

          if (existingUser) {
            // User exists. Link account record if not already linked
            const existingAccount = await db.collection('accounts').findOne({
              provider: 'google',
              providerAccountId: account.providerAccountId,
            })

            if (!existingAccount) {
              await db.collection('accounts').insertOne({
                userId: existingUser._id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                refresh_token: account.refresh_token || null,
                access_token: account.access_token || null,
                expires_at: account.expires_at || null,
                token_type: account.token_type || null,
                scope: account.scope || null,
                id_token: account.id_token || null,
                session_state: account.session_state || null,
              })
            }

            // Sync database user ID and role to user object for the jwt callback
            user.id = existingUser._id.toString()
            ;(user as any).role = existingUser.role || 'CUSTOMER'
            ;(user as any).phone = existingUser.phone || null
            return true
          } else {
            // Create user and link account
            const newUserDoc = {
              name: name || 'User',
              email,
              password: '', // OAuth users have no password
              role: 'CUSTOMER',
              emailVerified: new Date(),
              image: image || null,
              createdAt: new Date(),
              updatedAt: new Date(),
            }

            const insertResult = await db.collection('users').insertOne(newUserDoc)

            await db.collection('accounts').insertOne({
              userId: insertResult.insertedId,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              refresh_token: account.refresh_token || null,
              access_token: account.access_token || null,
              expires_at: account.expires_at || null,
              token_type: account.token_type || null,
              scope: account.scope || null,
              id_token: account.id_token || null,
              session_state: account.session_state || null,
            })

            user.id = insertResult.insertedId.toString()
            ;(user as any).role = 'CUSTOMER'
            ;(user as any).phone = null
            return true
          }
        } catch (error) {
          console.error('Error during Google sign in callback:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.phone = (user as any).phone
      }
      if (trigger === 'update' && session) {
        token.name = session.name
        token.image = session.image
        token.phone = session.phone
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id,
          role: token.role,
          phone: token.phone as string,
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}