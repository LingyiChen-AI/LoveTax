import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db/client';
import { users } from '@/lib/db/schema';
import { loginSchema } from '@/lib/validation/schemas';

export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 90 },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (raw) => {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!user) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.displayName,
          role: user.role,
          coupleId: user.coupleId,
          mustChangePassword: user.mustChangePassword
        };
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user, trigger, session }) => {
      if (user) {
        token.sub = user.id as string;
        token.role = (user as any).role;
        token.coupleId = (user as any).coupleId;
        token.mustChangePassword = (user as any).mustChangePassword;
      }
      if (trigger === 'update' && session) {
        if (session.coupleId !== undefined) token.coupleId = session.coupleId;
        if (session.mustChangePassword !== undefined) token.mustChangePassword = session.mustChangePassword;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).coupleId = token.coupleId;
        (session.user as any).mustChangePassword = token.mustChangePassword;
      }
      return session;
    }
  },
  trustHost: true
};
