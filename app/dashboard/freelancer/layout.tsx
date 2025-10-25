"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Home, Briefcase, TrendingUp, DollarSign, Mail, Settings, ChevronDown, LogOut } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getUserDetails, removeUserDetails } from "@/lib/api/storage"
import { getCurrentUserDetails } from "@/lib/api/auth"
import { useAuth } from "@/hooks/useAuth"

const navItems = [
  {
    title: "Home",
    href: "/dashboard/freelancer",
    icon: Home,
  },
  {
    title: "Projects",
    href: "/dashboard/freelancer/projects",
    icon: Briefcase,
  },
  {
    title: "Project Status",
    href: "/dashboard/freelancer/project-status",
    icon: TrendingUp,
  },
  {
    title: "Project Bid",
    href: "/dashboard/freelancer/project-bid",
    icon: DollarSign,
  },
  {
    title: "Contact",
    href: "/dashboard/freelancer/contact-us",
    icon: Mail,
  },
  {
    title: "Settings",
    href: "/dashboard/freelancer/settings",
    icon: Settings,
  },
]

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const { isAuthorized } = useAuth(["FREELANCER"])
  const pathname = usePathname()
  const router = useRouter()

  async function getCurrentUserDetail() {
    try {
      const userDetails = await getCurrentUserDetails()
      setFullName(userDetails.data.fullName)
      setEmail(userDetails.data.email)
      console.log(userDetails)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getCurrentUserDetail()
  }, [])

  const handleLogout = () => {
    const userDetails = getUserDetails()
    console.log("Logging out user:", userDetails)
    removeUserDetails()
    router.push("/login")
  }

  if (!isAuthorized) return null

  return (
    <div className="flex min-h-screen">
      <motion.aside
        initial={{ width: 250 }}
        animate={{ width: isCollapsed ? 80 : 280 }}
        className="fixed left-0 top-0 z-20 flex h-screen flex-col"
        style={{
          background: "linear-gradient(180deg, rgba(167, 139, 250, 0.1) 0%, rgba(255, 179, 145, 0.1) 100%)",
        }}
      >
        <div className="flex h-14 items-center border-r-2 px-3 border-r-[#FF6B35] bg-[#003087]">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <div className="w-10 h-10 bg-white rounded flex items-center justify-center text-[#003087] font-bold text-sm">
              PLS
            </div>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-lg"
                style={{ color: "#003087" }}
              >
                <div>
                  <p className="text-sm text-[#FF6B35]">FREELANCER DASHBOARD</p>
                </div>
              </motion.span>
            )}
          </Link>
        </div>
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-2 py-4">
            {navItems.map((item) => (
              <Button
                key={item.title}
                asChild
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  pathname === item.href &&
                    "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Link href={item.href} className="flex items-center gap-3">
                  <item.icon className={cn("h-4 w-4", pathname === item.href && "text-primary")} />
                  {!isCollapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      {item.title}
                    </motion.span>
                  )}
                </Link>
              </Button>
            ))}
          </div>
        </ScrollArea>
        <div className="border-t">
          <div className="flex items-center gap-3 bg-[#003087] p-3 shadow-sm">
            <Avatar>
              <AvatarImage src="/placeholder-user.jpg" alt="Freelancer" />
              <AvatarFallback>
                {fullName
                  ?.split(" ")
                  .map((word) => word[0])
                  .join("")
                  .toUpperCase()}{" "}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-1 flex-col"
              >
                <span className="text-lg text-[#FF6B35] font-medium">{fullName}</span>
                <span className="text-xs text-white break-all">{email}</span>
              </motion.div>
            )}
          </div>
          <Button
            variant="ghost"
            className="mt-2 w-full justify-start text-red-500 hover:text-red-600"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {!isCollapsed && <span>Logout</span>}
          </Button>
        </div>
      </motion.aside>
      <main className={cn("flex-1 transition-all", isCollapsed ? "pl-[80px]" : "pl-[280px]")}>
        <div className="sticky top-0 z-10 h-14 border-b bg-[#003087] backdrop-blur">
          <div className="flex h-full items-center gap-4 px-6">
            <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)}>
              <ChevronDown className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
            </Button>
            <div
              style={{
                color: "white",
                fontSize: "1.2rem",
                fontWeight: "bolder",
              }}
            >
              {(pathname.split("/").pop() || "").toUpperCase()}
            </div>
          </div>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
