import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@database/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma as any),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        });

        if (!user || !user.password) return null;

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordCorrect) return null;

        return user;
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.walletBalance = (user as any).walletBalance;
        token.bonusBalance = (user as any).bonusBalance;
      }
      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.id as string,
        role: token.role,
        walletBalance: token.walletBalance,
        bonusBalance: token.bonusBalance,
      },
    }),
  },
  events: {
    async createUser({ user }) {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const bonus = cookieStore.get("victory_bonus")?.value;
      if (bonus === "1000") {
        await prisma.user.update({
          where: { id: user.id },
          data: { bonusBalance: 1000 }
        });
        cookieStore.delete("victory_bonus");
      }
    }
  },
  session: { strategy: "jwt" },

  pages: {
    signIn: '/auth/signin',
  }
})
