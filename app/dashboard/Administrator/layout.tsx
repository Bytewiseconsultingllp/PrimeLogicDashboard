"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FileText,
  BarChart3,
  MessageCircle,
  Settings,
  ChevronDown,
  Mail,
  BookOpen,
  Calendar,
  LogOut,
  MessageSquare,
  Gavel,
  Users,
  UserCircle,
  Trash2,
  BookUser,
} from "lucide-react";
import plslogo from "@/assets/pls_logo.jpg";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserDetails, removeUserDetails } from "@/lib/api/storage";
import { getCurrentUserDetails } from "@/lib/api/auth";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  {
    title: "Project Status",
    href: "/dashboard/Administrator/project-status",
    icon: BarChart3,
  },
  {
    title: "Project Requests",
    href : "/dashboard/Administrator/project-requests",
    icon: BookUser,
  },
  {
    title: "Visitors",
    href: "/dashboard/Administrator/visitors",
    icon: UserCircle,
  },
  {
    title: "Client Profiles",
    href: "/dashboard/Administrator/client-profiles",
    icon: Users,
  },
  {
    title: "Freelancer Profiles",
    href: "/dashboard/Administrator/freelancer-profiles",
    icon: UserCircle,
  },
  {
    title: "Client Quotes",
    href: "/dashboard/Administrator/client-quotes",
    icon: Gavel,
  },
  {
    title: "View Consultations",
    href: "/dashboard/Administrator/consultations",
    icon: MessageSquare,
  },
  {
    title: "Contact Us",
    href: "/dashboard/Administrator/contact-us",
    icon: MessageCircle,
  },
  {
    title: "Blogs",
    href: "/dashboard/Administrator/blogs",
    icon: BookOpen,
  },
  {
    title: "Trash",
    href: "/dashboard/Administrator/trash",
    icon: Trash2,
  },
  {
    title: "Settings",
    href: "/dashboard/Administrator/settings",
    icon: Settings,
  },
];

export default function AdministratorLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [userRole, setUserRole] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const { isAuthorized } = useAuth(["ADMIN", "MODERATOR"]);

  useEffect(() => {
    getCurrentUserDetail();
    const userDetails = getUserDetails();
    const userRole = userDetails?.role;
    setUserRole(userRole);
  }, []);

  async function getCurrentUserDetail() {
    try {
      const userDetails = await getCurrentUserDetails();
      setFullName(userDetails.data.fullName);
      setEmail(userDetails.data.email);
    } catch (error) {
      console.log(error);
    }
  }

  const handleLogout = () => {
    const userDetails = getUserDetails();
    console.log("Logging out user:", userDetails);
    removeUserDetails();
    router.push("/login");
  };
  if(!isAuthorized) return null;

  return (
    <div className="flex min-h-screen">
      <motion.aside
        initial={{ width: 250 }}
        animate={{ width: isCollapsed ? 80 : 280 }}
        className="fixed left-0 top-0 z-20 flex h-screen flex-col"
        style={{
          background:
            "linear-gradient(180deg, rgba(167, 139, 250, 0.1) 0%, rgba(255, 179, 145, 0.1) 100%)",
        }}
      >
        <div className="flex h-14 items-center border-r-2 px-3 border-r-[#FF6B35]  bg-[#003087]">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold"
          >
            <Image src={plslogo} alt="PLS LOGO" width="50" height="50" className="bg-[#003087]"/>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ color: "#003087" }}
                
              >
                  <div>
                  {/* <p className="text-lg">PRIME LOGIC SOLUTIONS</p> */}
                  <p className="text-sm text-[#FF6B35]">{userRole} DASHBOARD</p>
                </div>  
              </motion.span>
            )}
          </Link>
        </div>
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-2 py-4">
            {navItems.map((item) => {
              if (item.title === "Trash" && userRole === "MODERATOR") {
                return null; // Hide the "Trash" item if the user is not an admin
              }
              if (item.title === "Project Requests" && userRole === "MODERATOR") {
                return null; // Hide the "Trash" item if the user is not an admin
              }
              return (
                <Button
                  key={item.title}
                  asChild
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    pathname === item.href &&
                      "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Link href={item.href} className="flex items-center gap-3">
                    <item.icon
                      className={cn(
                        "h-4 w-4",
                        pathname === item.href && "text-primary"
                      )}
                    />
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {item.title}
                      </motion.span>
                    )}
                  </Link>
                </Button>
              );
            })}
          </div>
        </ScrollArea>
        <div className="border-t">
        <div className="flex items-center gap-3  bg-[#003087] p-2 shadow-sm">
            <Avatar>
              <AvatarImage src="/placeholder-avatar.jpg" alt="Client" />
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
      <main
        className={cn(
          "flex-1 transition-all",
          isCollapsed ? "pl-[80px]" : "pl-[280px]"
        )}
      >
        <div className="sticky top-0 z-10 h-14 border-b bg-[#003087]">
          <div className="flex h-full items-center gap-4 px-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  isCollapsed && "rotate-180"
                )}
              />
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
  );
}
