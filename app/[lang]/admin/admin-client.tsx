"use client"

import { useState, useEffect } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassInput } from "@/components/ui/glass-input"
import { Shield, Users, Building2, DollarSign, Ban, Crown, AlertTriangle, CheckCircle, X, Trash2 } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  identifier: string
  role: string
  balance: number
  createdAt: string
}

export function AdminClient() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"users" | "businesses" | "money">("users")
  
  // User management
  const [users, setUsers] = useState<User[]>([])
  const [userSearch, setUserSearch] = useState("")
  
  // Money management
  const [moneyIdentifier, setMoneyIdentifier] = useState("")
  const [moneyAmount, setMoneyAmount] = useState("")
  const [moneyReason, setMoneyReason] = useState("")
  
  // Business deletion
  const [businessIdentifier, setBusinessIdentifier] = useState("")
  
  // Admin promotion
  const [promoteIdentifier, setPromoteIdentifier] = useState("")
  
  // Message
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    checkAdminStatus()
    fetchUsers()
  }, [])

  const checkAdminStatus = async () => {
    try {
      const res = await fetch("/api/admin")
      if (res.ok) {
        const data = await res.json()
        setIsAdmin(data.isAdmin)
      }
    } catch (error) {
      console.error("Error checking admin status:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users")
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/admin/money", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: moneyIdentifier,
          amount: parseFloat(moneyAmount),
          reason: moneyReason
        })
      })
      
      if (res.ok) {
        setMessage({ type: "success", text: `Added ${moneyAmount}Ø to ${moneyIdentifier}` })
        setMoneyIdentifier("")
        setMoneyAmount("")
        setMoneyReason("")
        fetchUsers()
      } else {
        const error = await res.text()
        setMessage({ type: "error", text: error })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error adding money" })
    }
  }

  const handleDeleteBusiness = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!confirm(`Are you sure you want to delete the business for ${businessIdentifier}?`)) {
      return
    }
    
    try {
      const res = await fetch("/api/admin/business", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIdentifier: businessIdentifier })
      })
      
      if (res.ok) {
        setMessage({ type: "success", text: `Business deleted for ${businessIdentifier}` })
        setBusinessIdentifier("")
      } else {
        const error = await res.text()
        setMessage({ type: "error", text: error })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error deleting business" })
    }
  }

  const handlePromoteToAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!confirm(`Are you sure you want to promote ${promoteIdentifier} to ADMIN?`)) {
      return
    }
    
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: promoteIdentifier,
          action: "promote-admin"
        })
      })
      
      if (res.ok) {
        setMessage({ type: "success", text: `${promoteIdentifier} is now ADMIN` })
        setPromoteIdentifier("")
        fetchUsers()
      } else {
        const error = await res.text()
        setMessage({ type: "error", text: error })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error promoting user" })
    }
  }

  const handleBanUser = async (identifier: string) => {
    if (!confirm(`Are you sure you want to BAN ${identifier}?`)) {
      return
    }
    
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          action: "ban-user"
        })
      })
      
      if (res.ok) {
        setMessage({ type: "success", text: `${identifier} has been banned` })
        fetchUsers()
      } else {
        const error = await res.text()
        setMessage({ type: "error", text: error })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error banning user" })
    }
  }

  const handleUnbanUser = async (identifier: string) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          action: "unban-user"
        })
      })
      
      if (res.ok) {
        setMessage({ type: "success", text: `${identifier} has been unbanned` })
        fetchUsers()
      } else {
        const error = await res.text()
        setMessage({ type: "error", text: error })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error unbanning user" })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Shield className="w-16 h-16 text-primary/60 animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <GlassCard className="p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You do not have permission to access the admin panel.</p>
        </GlassCard>
      </div>
    )
  }

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.identifier.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-red-500/10 rounded-xl">
          <Shield className="w-8 h-8 text-red-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">System administration and user management</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === "success" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
        }`}>
          {message.type === "success" ? <CheckCircle className="w-5 h-5" /> : <X className="w-5 h-5" />}
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === "users" 
              ? "bg-primary text-primary-foreground" 
              : "bg-accent hover:bg-accent/80"
          }`}
        >
          <Users className="w-4 h-4" />
          Users
        </button>
        <button
          onClick={() => setActiveTab("money")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === "money" 
              ? "bg-primary text-primary-foreground" 
              : "bg-accent hover:bg-accent/80"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Money
        </button>
        <button
          onClick={() => setActiveTab("businesses")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === "businesses" 
              ? "bg-primary text-primary-foreground" 
              : "bg-accent hover:bg-accent/80"
          }`}
        >
          <Building2 className="w-4 h-4" />
          Businesses
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="space-y-6">
          {/* Promote to Admin */}
          <GlassCard className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              Promote to Admin
            </h2>
            <form onSubmit={handlePromoteToAdmin} className="flex gap-4">
              <input
                type="text"
                placeholder="User identifier (e.g., ORB-XXXX-XXXX)"
                value={promoteIdentifier}
                onChange={(e) => setPromoteIdentifier(e.target.value)}
                className="flex-1 px-4 py-3 glass-input rounded-xl"
                required
              />
              <GlassButton type="submit" variant="primary">
                Promote
              </GlassButton>
            </form>
          </GlassCard>

          {/* User List */}
          <GlassCard className="p-6">
            <h2 className="text-lg font-semibold mb-4">User Management</h2>
            <input
              type="text"
              placeholder="Search users..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full px-4 py-3 glass-input rounded-xl mb-4"
            />
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      user.role === "ADMIN" ? "bg-red-500" :
                      user.role === "BANNED" ? "bg-gray-500" :
                      user.role === "MODERATOR" ? "bg-blue-500" :
                      "bg-green-500"
                    }`} />
                    <div>
                      <p className="font-medium">{user.name || "Unknown"}</p>
                      <p className="text-sm text-muted-foreground">{user.identifier} • {user.email}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user.role.toLowerCase()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{user.balance}Ø</span>
                    {user.role !== "BANNED" ? (
                      <button
                        onClick={() => handleBanUser(user.identifier)}
                        className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                        title="Ban user"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnbanUser(user.identifier)}
                        className="p-2 hover:bg-green-500/10 text-green-500 rounded-lg transition-colors"
                        title="Unban user"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Money Tab */}
      {activeTab === "money" && (
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            Add Money to User
          </h2>
          <form onSubmit={handleAddMoney} className="space-y-4">
            <input
              type="text"
              placeholder="User identifier (e.g., ORB-XXXX-XXXX)"
              value={moneyIdentifier}
              onChange={(e) => setMoneyIdentifier(e.target.value)}
              className="w-full px-4 py-3 glass-input rounded-xl"
              required
            />
            <input
              type="number"
              placeholder="Amount (Ø)"
              value={moneyAmount}
              onChange={(e) => setMoneyAmount(e.target.value)}
              className="w-full px-4 py-3 glass-input rounded-xl"
              min="1"
              required
            />
            <input
              type="text"
              placeholder="Reason (optional)"
              value={moneyReason}
              onChange={(e) => setMoneyReason(e.target.value)}
              className="w-full px-4 py-3 glass-input rounded-xl"
            />
            <GlassButton type="submit" variant="primary" className="w-full">
              Add Money
            </GlassButton>
          </form>
        </GlassCard>
      )}

      {/* Businesses Tab */}
      {activeTab === "businesses" && (
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-500" />
            Delete Business
          </h2>
          <form onSubmit={handleDeleteBusiness} className="space-y-4">
            <input
              type="text"
              placeholder="User identifier (e.g., ORB-XXXX-XXXX)"
              value={businessIdentifier}
              onChange={(e) => setBusinessIdentifier(e.target.value)}
              className="w-full px-4 py-3 glass-input rounded-xl"
              required
            />
            <div className="p-4 rounded-lg bg-red-500/10 text-red-500 text-sm">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5" />
                <p>This will permanently delete the user's business, including all stock data, trades, and business account. This action cannot be undone.</p>
              </div>
            </div>
            <GlassButton type="submit" variant="primary" className="w-full bg-red-500 hover:bg-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Business
            </GlassButton>
          </form>
        </GlassCard>
      )}
    </div>
  )
}
