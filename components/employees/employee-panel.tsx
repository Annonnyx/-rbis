"use client"

import { useState, useEffect } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { Users, TrendingUp, Award, DollarSign, Brain, Wrench, MessageCircle, Truck, HeadphonesIcon, Briefcase } from "lucide-react"

interface Employee {
  id: string
  firstName: string
  lastName: string
  fullName: string
  role: string
  level: number
  experience: number
  skillEfficiency: number
  skillCreativity: number
  skillNegotiation: number
  skillLeadership: number
  skillTechnical: number
  skillMarketing: number
  skillLogistics: number
  salary: number
  performance: number
  satisfaction: number
  hiredAt: string
  trainingSessions: any[]
}

const ROLE_ICONS: Record<string, any> = {
  OPERATIONS: Wrench,
  SALES: MessageCircle,
  MARKETING: TrendingUp,
  RESEARCH: Brain,
  MANAGEMENT: Briefcase,
  LOGISTICS: Truck,
  CUSTOMER_SERVICE: HeadphonesIcon
}

const ROLE_NAMES: Record<string, string> = {
  OPERATIONS: "Opérations",
  SALES: "Ventes",
  MARKETING: "Marketing",
  RESEARCH: "R&D",
  MANAGEMENT: "Management",
  LOGISTICS: "Logistique",
  CUSTOMER_SERVICE: "Support Client"
}

export function EmployeePanel() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [showHireForm, setShowHireForm] = useState(false)
  const [selectedRole, setSelectedRole] = useState("OPERATIONS")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/employees")
      if (res.ok) {
        const data = await res.json()
        setEmployees(data.employees)
      }
    } catch (error) {
      console.error("Error fetching employees:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  const handleHire = async () => {
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole })
      })

      const data = await res.json()

      if (data.success) {
        setMessage({ type: "success", text: data.message })
        setShowHireForm(false)
        fetchEmployees()
      } else {
        setMessage({ type: "error", text: data.message })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors du recrutement" })
    }
  }

  const calculateOverallSkill = (emp: Employee) => {
    const skills = [emp.skillEfficiency, emp.skillCreativity, emp.skillNegotiation, emp.skillLeadership, emp.skillTechnical, emp.skillMarketing, emp.skillLogistics]
    return Math.round(skills.reduce((a, b) => a + b, 0) / skills.length)
  }

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Équipe</h2>
          <p className="text-muted-foreground">{employees.length} employé(s)</p>
        </div>
        <GlassButton onClick={() => setShowHireForm(true)}>
          <Users className="w-4 h-4 mr-2" />
          Recruter
        </GlassButton>
      </div>

      {showHireForm && (
        <GlassCard className="p-6">
          <h3 className="font-semibold mb-4">Nouveau Recrutement</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {Object.entries(ROLE_NAMES).map(([role, name]) => {
              const Icon = ROLE_ICONS[role]
              return (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`p-3 rounded-lg border transition-all text-left ${
                    selectedRole === role
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Icon className="w-5 h-5 mb-2" />
                  <p className="font-medium text-sm">{name}</p>
                </button>
              )
            })}
          </div>
          <div className="flex gap-3">
            <GlassButton onClick={handleHire}>Recruter</GlassButton>
            <GlassButton variant="secondary" onClick={() => setShowHireForm(false)}>
              Annuler
            </GlassButton>
          </div>
        </GlassCard>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {employees.map((employee) => {
          const Icon = ROLE_ICONS[employee.role] || Users
          const overallSkill = calculateOverallSkill(employee)
          
          return (
            <GlassCard key={employee.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{employee.fullName}</h3>
                    <p className="text-sm text-muted-foreground">{ROLE_NAMES[employee.role]}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 rounded bg-primary/20 text-primary text-sm font-medium">
                    Niv. {employee.level}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="p-2 rounded bg-background/50">
                  <p className="text-xs text-muted-foreground">Salaire</p>
                  <p className="font-semibold">{employee.salary.toLocaleString()}Ø/mois</p>
                </div>
                <div className="p-2 rounded bg-background/50">
                  <p className="text-xs text-muted-foreground">Compétence</p>
                  <p className="font-semibold">{overallSkill}%</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Performance</span>
                  <span>{(employee.performance * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-background rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${employee.performance * 100}%` }}
                  />
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Satisfaction</span>
                  <span>{(employee.satisfaction * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-background rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${employee.satisfaction * 100}%` }}
                  />
                </div>
              </div>

              {employee.trainingSessions.length > 0 && (
                <div className="mt-3 p-2 rounded bg-yellow-500/10 text-sm">
                  <Award className="w-4 h-4 inline mr-1" />
                  Formation en cours...
                </div>
              )}
            </GlassCard>
          )
        })}
      </div>

      {employees.length === 0 && !showHireForm && (
        <GlassCard className="p-12 text-center">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Pas encore d'employés</p>
          <GlassButton onClick={() => setShowHireForm(true)}>
            Recruter votre premier employé
          </GlassButton>
        </GlassCard>
      )}

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === "success" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
        }`}>
          {message.text}
        </div>
      )}
    </div>
  )
}
