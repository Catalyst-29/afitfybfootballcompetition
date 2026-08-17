import './globals.css';
import PwaRegister from './pwa-register';
export const metadata={
  title:'2026/2027 AFIT Final Year Competition',
  description:'Official AFIT final year football competition registration portal',
  applicationName:'AFIT Football',
  manifest:'/manifest.webmanifest',
  appleWebApp:{capable:true,statusBarStyle:'black-translucent',title:'AFIT Football'},
  icons:{
    icon:[{url:'/icons/afit-192.png',sizes:'192x192',type:'image/png'}],
    apple:[{url:'/icons/afit-192.png',sizes:'192x192',type:'image/png'}],
  },
};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><PwaRegister />{children}</body></html>}
