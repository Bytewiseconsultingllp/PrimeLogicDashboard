import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Get Started - Prime Logic Solutions',
  description: 'Start your project with Prime Logic Solutions. Get a custom quote for your web development, mobile app, or digital solution needs.',
  keywords: 'web development, mobile app development, digital solutions, custom software, project quote',
}

export default function GetStartedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}
