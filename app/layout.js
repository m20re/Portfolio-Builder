/* Required root layout */
/* Can be used for navbars and the like */
import './globals.css'
import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
