"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getToken, removeToken } from "@/lib/auth"
import { apiClient } from "@/lib/api/apiClient"

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: any | null
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = getToken()
        if (!token) {
          throw new Error("No token found")
        }

        // Verify the token by making an API call
        const response = await apiClient.get("/auth/me")
        
        if (response.data) {
          setUser(response.data)
          setIsAuthenticated(true)
        } else {
          throw new Error("Invalid user data")
        }
      } catch (error) {
        console.error("Authentication check failed:", error)
        removeToken()
        setIsAuthenticated(false)
        setUser(null)
        
        // Only redirect if we're not already on the login page
        if (!pathname.startsWith("/login")) {
          router.push("/login")
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [pathname, router])

  const logout = () => {
    removeToken()
    setIsAuthenticated(false)
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
