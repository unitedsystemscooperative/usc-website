import mongoClient from '@/lib/db';
import { ICMDR } from '@@/admin/models/cmdr';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import NextAuth from 'next-auth';
import EmailProvider from 'next-auth/providers/email';

export default NextAuth({
  // https://next-auth.js.org/configuration/providers
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER,
        port: 465,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  // Database optional. MySQL, Maria DB, Postgres and MongoDB are supported.
  // https://next-auth.js.org/configuration/databases
  //
  // Notes:
  // * You must to install an appropriate node_module for your database
  // * The Email provider requires a database (OAuth providers do not)
  // database: process.env.MONGODB_URI,
  adapter: MongoDBAdapter(mongoClient),

  // The secret should be set to a reasonably long random string.
  // It is used to sign cookies and to sign and encrypt JSON Web Tokens, unless
  // a separate secret is defined explicitly for encrypting the JWT.
  secret: process.env.AUTH_SECRET,

  session: {
    // Use JSON Web Tokens for session instead of database sessions.
    // This option can be used with or without a database for users/accounts.
    // Note: `jwt` is automatically set to `true` if no database is specified.
    strategy: 'jwt',

    // Seconds - How long until an idle session expires and is no longer valid.
    // maxAge: 30 * 24 * 60 * 60, // 30 days

    // Seconds - Throttle how frequently to write to database to extend a session.
    // Use it to limit write operations. Set to 0 to always update the database.
    // Note: This option is ignored if using JSON Web Tokens
    // updateAge: 24 * 60 * 60, // 24 hours
  },

  theme: {
    colorScheme: 'dark',
  },

  // You can define custom pages to override the built-in pages.
  // The routes shown here are the default URLs that will be used when a custom
  // pages is not specified for that route.
  // https://next-auth.js.org/configuration/pages
  pages: {
    signIn: '/auth/signIn', // Displays signin buttons
    // signOut: '/api/auth/signout', // Displays form with sign out button
    error: '/auth/error', // Error code passed in query string as ?error=
    verifyRequest: '/auth/verify-request', // Used for check email page
    // newUser: null // If set, new users will be directed here on first sign in
  },

  // Callbacks are asynchronous functions you can use to control what happens
  // when an action is performed.
  // https://next-auth.js.org/configuration/callbacks
  callbacks: {
    signIn: async ({ user }) => {
      const db = (await mongoClient).db();
      const email: string = user.email;

      const cursor = db.collection<ICMDR>('cmdrs').find({});
      const members = await cursor.toArray();
      cursor.close();
      const authUser = members.find((x) => x.email.toLowerCase() === email.toLowerCase());

      return authUser ? true : false;
    },
    // redirect: redirect,
    // session: session,
    jwt: async ({ token, user }) => {
      if (user) {
        const db = (await mongoClient).db();

        const email: string = user.email;
        const cursor = db.collection<ICMDR>('cmdrs').find({});
        const members = await cursor.toArray();
        cursor.close();
        const authUser = members.find((x) => x.email.toLowerCase() === email);
        token = { ...token, ...authUser };
      }
      return token;
    },
  },

  // Events are useful for logging
  // https://next-auth.js.org/configuration/events
  events: {},

  // Enable debug messages in the console if you are having problems
  debug: false,
});
