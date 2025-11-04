// "use client"

// import type React from "react"
// import { createContext, useContext, useState, useEffect } from "react"

// interface User {
//   email: string
//   role: "client" | "freelancer" | "moderator" | "admin"
// }

// interface AuthContextType {
//   user: User | null
//   login: (email: string, password: string) => Promise<boolean>
//   logout: () => void
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined)

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null)

//   useEffect(() => {
//     // Check for saved user in localStorage
//     const savedUser = localStorage.getItem("user")
//     if (savedUser) {
//       setUser(JSON.parse(savedUser))
//     }
//   }, [])

//   const login = async (email: string, password: string): Promise<boolean> => {
//     // Dummy login logic
//     if (email && password) {
//       const dummyUser: User = {
//         email,
//         role: "client", // Default role, you can implement logic to determine role based on email if needed
//       }
//       setUser(dummyUser)
//       localStorage.setItem("user", JSON.stringify(dummyUser))
//       return true
//     }
//     return false
//   }

//   const logout = () => {
//     setUser(null)
//     localStorage.removeItem("user")
//   }

//   return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
// }

// export const useAuth = () => {
//   const context = useContext(AuthContext)
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider")
//   }
//   return context
// }

"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { getUserDetails, removeUserDetails, getAuthToken, getFreelancerProfile as getStoredProfile, removeFreelancerProfile, setFreelancerProfile } from "@/lib/api/storage"
import { getFreelancerProfile as fetchFreelancerProfile } from "@/lib/api/freelancers"

interface User {
  uid: string
  username: string
  email?: string
  role: string
  fullName?: string
}

interface AuthContextType {
  user: User | null
  freelancerProfile: any | null
  isAuthenticated: boolean
  isLoading: boolean
  logout: () => void
  refreshUser: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [freelancerProfile, setFreelancerProfileState] = useState<any | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const userDetails = getUserDetails()
        const token = getAuthToken(null)

        if (userDetails && token) {
          setUser({
            uid: userDetails.uid,
            username: userDetails.username,
            role: userDetails.role,
            email: userDetails.email,
            fullName: userDetails.fullName,
          })
          setIsAuthenticated(true)
          
          // Load freelancer profile if user is a freelancer
          if (userDetails.role === "FREELANCER") {
            console.log("🔍 User is FREELANCER, checking for profile...")
            const profile = getStoredProfile()
            if (profile) {
              console.log("✅ Profile found in localStorage:", profile)
              setFreelancerProfileState(profile)
            } else {
              console.log("⚠️ Profile not in localStorage, fetching from API...")
              // If not in localStorage, fetch from API
              fetchFreelancerProfile()
                .then((response) => {
                  console.log("📡 API Response:", response)
                  if (response.success && response.data) {
                    console.log("✅ Profile fetched successfully, storing...")
                    setFreelancerProfile(response.data)
                    setFreelancerProfileState(response.data)
                  } else {
                    console.error("❌ API returned unsuccessful response:", response)
                  }
                })
                .catch((error) => {
                  console.error("❌ Failed to fetch freelancer profile:", error)
                })
            }
          }
        } else {
          setIsAuthenticated(false)
          setUser(null)
          setFreelancerProfileState(null)
        }
      } catch (error) {
        console.error("[v0] Auth initialization error:", error)
        setIsAuthenticated(false)
        setUser(null)
        setFreelancerProfileState(null)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const logout = () => {
    removeUserDetails()
    removeFreelancerProfile()
    setUser(null)
    setFreelancerProfileState(null)
    setIsAuthenticated(false)
  }

  const refreshUser = () => {
    const userDetails = getUserDetails()
    if (userDetails) {
      setUser({
        uid: userDetails.uid,
        username: userDetails.username,
        role: userDetails.role,
        email: userDetails.email,
        fullName: userDetails.fullName,
      })
      
      // Refresh freelancer profile if user is a freelancer
      if (userDetails.role === "FREELANCER") {
        const profile = getStoredProfile()
        if (profile) {
          setFreelancerProfileState(profile)
        } else {
          // If not in localStorage, fetch from API
          fetchFreelancerProfile()
            .then((response) => {
              if (response.success && response.data) {
                setFreelancerProfile(response.data)
                setFreelancerProfileState(response.data)
              }
            })
            .catch((error) => {
              console.error("Failed to fetch freelancer profile:", error)
            })
        }
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        freelancerProfile,
        isAuthenticated,
        isLoading,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuthContext must be used within AuthProvider")
  }
  return context
}
