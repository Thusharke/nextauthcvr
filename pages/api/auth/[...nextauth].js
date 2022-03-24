import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { MongoDBAdapter } from "@next-auth/mongodb-adapter"
import clientPromise from "../../../mongodb"
export default async function auth(req, res) {
  return await NextAuth(req, res, {
    session: {
      strategy: "jwt",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_SECRET,
      }),
    ],
    adapter: MongoDBAdapter(clientPromise),
    callbacks: {
      session: async ({ session, token }) => {
        const { data } = await axios.get(
          `https://nextauthcvr.vercel.app/api/users`,
          {
            params: {
              userId: token.sub,
            },
          }
        )
        const { details } = data
        session.userId = token.sub
        session.userDetails = details
        return session
      },
    },
  })
}
