import NextAuth from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import EmailProvider from 'next-auth/providers/email';
import { getIsAuthEnabled } from './env';
import { prisma } from './prisma';

type RouteHandler = (request: Request) => Promise<Response>;
type AuthHandler = (request?: Request) => Promise<any>;
type SignHandler = (...args: unknown[]) => Promise<unknown>;

const authEnabled = getIsAuthEnabled();

let exportedHandlers: { GET: RouteHandler; POST: RouteHandler };
let exportedAuth: AuthHandler;
let exportedSignIn: SignHandler;
let exportedSignOut: SignHandler;

if (!authEnabled) {
  const noop: SignHandler = async () => null;
  const authNoop: AuthHandler = async () => null;
  exportedHandlers = {
    GET: async () => new Response('Auth disabled', { status: 404 }),
    POST: async () => new Response('Auth disabled', { status: 404 }),
  };
  exportedAuth = authNoop;
  exportedSignIn = noop;
  exportedSignOut = noop;
} else {
  const authInstance = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: { strategy: 'database' },
    providers: [
      EmailProvider({
        from: process.env.EMAIL_FROM,
        sendVerificationRequest: async ({ url, identifier }) => {
          if (process.env.EMAIL_SERVER_HOST) {
            const nodemailer = await import('nodemailer');
            const transporter = nodemailer.createTransport({
              host: process.env.EMAIL_SERVER_HOST,
              port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
              auth: process.env.EMAIL_SERVER_USER
                ? {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                  }
                : undefined,
            });
            await transporter.sendMail({
              to: identifier,
              from: process.env.EMAIL_FROM ?? 'pairshop@example.com',
              subject: 'Pair Shop ログインリンク',
              text: `ログインリンク: ${url}`,
            });
          } else {
            console.info('Magic link for %s: %s', identifier, url);
          }
        },
      }),
    ],
    callbacks: {
      async session({ session, user }) {
        if (session.user) {
          (session.user as { id?: string }).id = user.id;
        }
        return session;
      },
    },
    pages: {
      signIn: '/auth/signin',
    },
    secret: process.env.NEXTAUTH_SECRET,
    trustHost: true,
    events: {
      signIn(message) {
        console.info('User signed in', message.user?.email);
      },
    },
  });

  exportedHandlers = authInstance.handlers as { GET: RouteHandler; POST: RouteHandler };
  exportedAuth = authInstance.auth as AuthHandler;
  exportedSignIn = authInstance.signIn as SignHandler;
  exportedSignOut = authInstance.signOut as SignHandler;
}

export const handlers = exportedHandlers;
export const auth = exportedAuth;
export const signIn = exportedSignIn;
export const signOut = exportedSignOut;
export const isAuthEnabled = authEnabled;
