"use client"

import Link from "next/link"
import { ArrowLeft, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function Forbidden() {
  const router = useRouter()

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-4 py-16 md:px-6">
      <div className="flex flex-col items-center justify-center space-y-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
          <ShieldAlert className="h-10 w-10 text-red-600 dark:text-red-400" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">Unauthorized Access</h1>
          <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
            You don&apos;t have permission to access this resource. Please contact your administrator if you believe
            this is an error.
          </p>
        </div>
        <div className="flex flex-col gap-2 min-[400px]:flex-row">
          {/* <Button onClick={() => router.back()} variant="default" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button> */}
          <Button variant="outline" asChild>
            <Link href="https://primelogicd.vercel.app">Return Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

