"use client"

import * as React from "react"
import { frontendApi } from "@/lib/frontend-api"
import { toast } from "sonner"
import {
  Search,
  ShieldAlert,
  User as UserIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { components } from "@/types/api"

type User = components["schemas"]["User"]

interface UserManagerProps {
  initialUsers: User[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export function UserManager({ initialUsers }: UserManagerProps) {
  const [users, setUsers] = React.useState(initialUsers)
  const [filter, setFilter] = React.useState("")

  const handleUpdateRole = async (userId: string, role: "ADMIN" | "USER") => {
    try {
      const { data } = await frontendApi.admin.users.updateRole(userId, role)
      setUsers((prev) => prev.map((u) => (u.id === userId ? data : u)))
      toast.success(`User role updated to ${role}`)
    } catch (error) {
      toast.error("Failed to update user role")
    }
  }

  const handleBan = async (userId: string) => {
    if (!confirm("Are you sure you want to BAN this user in Clerk and the database?")) return;
    try {
      const { data } = await frontendApi.admin.users.ban(userId)
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isBanned: true } : u)))
      toast.success("User banned")
    } catch (error) {
      toast.error("Failed to ban user")
    }
  }

  const handleUnban = async (userId: string) => {
    if (!confirm("Are you sure you want to UNBAN this user?")) return;
    try {
      const { data } = await frontendApi.admin.users.unban(userId)
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isBanned: false } : u)))
      toast.success("User unbanned")
    } catch (error) {
      toast.error("Failed to unban user")
    }
  }

  return (
    <div className="space-y-6">
      <div className="relative w-full md:w-[320px]">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="pl-9 rounded-xl bg-background/60"
        />
      </div>

      <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-[2rem] overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/40">
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/20 border-border/40">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10 rounded-xl">
                        <AvatarImage src={user.avatarUrl || undefined} />
                        <AvatarFallback className="rounded-xl uppercase">
                          {user.email[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{user.name || "Anonymous"}</span>
                          {user.isBanned && (
                            <Badge variant="destructive" className="h-4 px-1.5 text-[9px] uppercase font-black">
                              Banned
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "ADMIN" ? "secondary" : "outline"}
                      className="rounded-lg"
                    >
                      {user.role === "ADMIN" ? (
                        <ShieldAlert className="mr-1 size-3" />
                      ) : (
                        <UserIcon className="mr-1 size-3" />
                      )}
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {user.isBanned ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-emerald-600 border-emerald-200"
                          onClick={() => handleUnban(user.id)}
                        >
                          Unban
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-xl text-destructive hover:bg-destructive/10"
                          onClick={() => handleBan(user.id)}
                        >
                          Ban
                        </Button>
                      )}
                      {user.role === "ADMIN" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => handleUpdateRole(user.id, "USER")}
                        >
                          Demote
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => handleUpdateRole(user.id, "ADMIN")}
                        >
                          Promote
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
