import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
export const {handlers,auth,signIn,signOut} = NextAuth({
 providers:[Google], session:{strategy:'jwt'}, pages:{signIn:'/login'},
 callbacks:{
  signIn:({account,profile})=>account?.provider==='google' && profile?.email_verified===true,
  jwt({token,account}) { if(account) token.sub=account.providerAccountId; return token; },
  session({session,token}) { if(session.user) session.user.id=token.sub!; return session; },
 },
});
