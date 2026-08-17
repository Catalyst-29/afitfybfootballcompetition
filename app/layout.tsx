import './globals.css';
import PwaRegister from './pwa-register';
export const metadata={title:'2026/2027 AFIT Final Year Competition',description:'Official AFIT final year football competition registration portal'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><PwaRegister />{children}</body></html>}
