"use client"

import * as React from "react"
import { useUser } from "@clerk/nextjs"

export type RoleGateRole = 'ADMIN' | 'CREATOR'

interface RoleGateProps {
  children: React.ReactNode
  role?: RoleGateRole | RoleGateRole[]
  fallback?: React.ReactNode
}

/**
 * RoleGate component to protect UI elements based on user roles or creator status.
 * Uses Clerk user metadata for role-based access control.
 */
export function RoleGate({ children, role, fallback = null }: RoleGateProps) {
  const { user, isLoaded } = useUser()

  if (!isLoaded) return null
  if (!user) return <>{fallback}</>

  const roles = Array.isArray(role) ? role : [role]
  
  const userRole = user.publicMetadata?.role as string | undefined
  const isCreator = !!user.publicMetadata?.isCreator

  const hasAccess = roles.some(r => {
    if (r === 'ADMIN') return userRole === 'ADMIN'
    if (r === 'CREATOR') return isCreator
    return false
  })

  if (!hasAccess) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
