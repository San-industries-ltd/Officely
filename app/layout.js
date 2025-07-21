import './globals.css'
import { Toaster } from '@/components/ui/sonner'

export const metadata = {
  title: 'Office Attendance - Your Office, Your Way',
  description: 'Beautiful office attendance and availability tracking system',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-gray-50 antialiased">
        <div className="relative min-h-screen">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50"></div>
          
          {/* Content */}
          <div className="relative z-10">
            {children}
          </div>
          
          <Toaster />
        </div>
      </body>
    </html>
  )
}