/* Required root layout */
/* Can be used for navbars and the like */
import './globals.css'
import ThemeRegistry from '../components/ThemeRegistry' // Wraps app with MUI theme and fixes hydration errors

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  )
}
