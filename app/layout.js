import './globals.css'

export const metadata = {
  title: 'ENSURE System',
  description: 'Schedule Management & Attendance Tracking System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}