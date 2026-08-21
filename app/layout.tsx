import './globals.css';
import PwaRegister from './pwa-register';
export const metadata={
  title:'2026/2027 AFIT CUP',
  description:'Official AFIT CUP registration portal',
  applicationName:'AFIT CUP',
  manifest:'/manifest.webmanifest',
  appleWebApp:{capable:true,statusBarStyle:'black-translucent',title:'AFIT CUP'},
  icons:{
    icon:[{url:'/icons/afit-192.png',sizes:'192x192',type:'image/png'}],
    apple:[{url:'/icons/afit-192.png',sizes:'192x192',type:'image/png'}],
  },
};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><PwaRegister />{children}</body></html>}
