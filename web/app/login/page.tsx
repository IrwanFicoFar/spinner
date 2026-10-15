import { signIn } from '@/auth';
import { Logo } from '@/components/logo';
export default function Login() {
 const configured=!!(process.env.DATABASE_URL&&process.env.AUTH_SECRET&&process.env.AUTH_GOOGLE_ID&&process.env.AUTH_GOOGLE_SECRET);
 return <main className="hero"><Logo/><h1>Selamat datang<br/><span>di Spinora.</span></h1><p>Masuk dengan Google untuk membuka workspace dan data undian Anda.</p><form action={async()=>{'use server';await signIn('google',{redirectTo:'/admin'});}}><button className="demo-participant" disabled={!configured}>Masuk dengan Google</button></form>{!configured&&<p>Login belum tersedia. Administrator perlu menyelesaikan konfigurasi layanan.</p>}</main>;
}
