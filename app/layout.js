/* Required root layout */
/* Can be used for navbars and the like */
import './globals.css'
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
