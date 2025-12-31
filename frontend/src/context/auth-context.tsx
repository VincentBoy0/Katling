import { createContext, useContext, useState, type ReactNode, useEffect } from "react"

export type Role = "user" | "admin" | "moderator"

export interface User {
  id: string
  email: string
  displayName: string
  avatar?: string
  level: number
  exp: number
  streak: number
  energy: number
  maxEnergy: number
  authProvider?: "email" | "google" | "facebook"
}

interface AuthContextType {
  user: User | null
  role: Role
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, displayName: string) => Promise<void>
  loginWithOAuth: (provider: "google" | "facebook") => Promise<void>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const role: Role = "admin"

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("katling_user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error("Failed to parse saved user:", error)
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // Mock login - in real app, call backend API
    await new Promise((resolve) => setTimeout(resolve, 500))

    const mockUser: User = {
      id: Math.random().toString(36),
      email,
      displayName: email.split("@")[0],
      level: 1,
      exp: 0,
      streak: 0,
      energy: 5,
      maxEnergy: 5,
      authProvider: "email",
    }
    setUser(mockUser)
    localStorage.setItem("katling_user", JSON.stringify(mockUser))
  }

  const signup = async (email: string, password: string, displayName: string) => {
    // Mock signup - in real app, call backend API
    await new Promise((resolve) => setTimeout(resolve, 500))

    const mockUser: User = {
      id: Math.random().toString(36),
      email,
      displayName,
      level: 1,
      exp: 0,
      streak: 0,
      energy: 5,
      maxEnergy: 5,
      authProvider: "email",
    }
    setUser(mockUser)
    localStorage.setItem("katling_user", JSON.stringify(mockUser))
  }

  const loginWithOAuth = async (provider: "google" | "facebook") => {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const providers = {
      google: "Nguyễn Minh",
      facebook: "Trần Hà",
    }

    const mockUser: User = {
      id: Math.random().toString(36),
      email: `user.${provider}@${provider}.com`,
      displayName: providers[provider],
      level: 1,
      exp: 0,
      streak: 0,
      energy: 5,
      maxEnergy: 5,
      authProvider: provider,
    }
    setUser(mockUser)
    localStorage.setItem("katling_user", JSON.stringify(mockUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("katling_user")
  }

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem("katling_user", JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider value={{ user, role, isAuthenticated: !!user, isLoading, login, signup, loginWithOAuth, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
