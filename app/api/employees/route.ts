import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { EmployeeRole, SkillType } from "@prisma/client"

// Generate random employee name
const FIRST_NAMES = ["Jean", "Marie", "Pierre", "Sophie", "Lucas", "Emma", "Louis", "Julie", "Thomas", "Sarah", "Hugo", "Camille", "Théo", "Manon", "Nathan", "Chloé"]
const LAST_NAMES = ["Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit", "Durand", "Leroy", "Moreau", "Simon", "Laurent", "Lefebvre", "Michel", "Garcia", "Roux"]

function generateEmployeeName() {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
  return { firstName: first, lastName: last, fullName: `${first} ${last}` }
}

// Calculate salary based on role and level
function calculateSalary(role: EmployeeRole, level: number): number {
  const baseSalaries = {
    [EmployeeRole.OPERATIONS]: 2500,
    [EmployeeRole.SALES]: 2800,
    [EmployeeRole.MARKETING]: 3000,
    [EmployeeRole.RESEARCH]: 3500,
    [EmployeeRole.MANAGEMENT]: 4500,
    [EmployeeRole.LOGISTICS]: 2600,
    [EmployeeRole.CUSTOMER_SERVICE]: 2200
  }
  const base = baseSalaries[role] || 2500
  return Math.round(base * (1 + (level - 1) * 0.15))
}

// GET /api/employees - Get employees for user's business
export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const business = await db.business.findUnique({
      where: { userId: session.user.id }
    })

    if (!business) {
      return NextResponse.json({ employees: [], message: "No business found" })
    }

    const employees = await db.employee.findMany({
      where: { businessId: business.id },
      include: {
        trainingSessions: {
          where: { completedAt: null }
        }
      },
      orderBy: { hiredAt: "desc" }
    })

    return NextResponse.json({ employees, businessId: business.id })
  } catch (error) {
    console.error("Error fetching employees:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// POST /api/employees - Hire new employee
export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { role, skills } = await req.json()
    
    if (!role) {
      return new NextResponse("Missing role", { status: 400 })
    }

    const business = await db.business.findUnique({
      where: { userId: session.user.id }
    })

    if (!business) {
      return new NextResponse("No business found", { status: 404 })
    }

    // Generate employee
    const name = generateEmployeeName()
    const salary = calculateSalary(role as EmployeeRole, 1)
    const hiringBonus = Math.round(salary * 0.5) // 50% of monthly salary as hiring bonus

    // Check funds
    const mainAccount = await db.bankAccount.findFirst({
      where: { userId: session.user.id, isMain: true }
    })

    if (!mainAccount || Number(mainAccount.balance) < hiringBonus) {
      return NextResponse.json({
        success: false,
        message: "Solde insuffisant pour recruter",
        required: hiringBonus
      }, { status: 400 })
    }

    // Generate random skills (10-30 base + any bonus from skills param)
    const skillBonus = skills || 0
    const generateSkill = () => Math.min(10 + Math.floor(Math.random() * 20) + skillBonus, 100)

    const employee = await db.employee.create({
      data: {
        businessId: business.id,
        firstName: name.firstName,
        lastName: name.lastName,
        fullName: name.fullName,
        role: role as EmployeeRole,
        level: 1,
        experience: 0,
        skillEfficiency: generateSkill(),
        skillCreativity: generateSkill(),
        skillNegotiation: generateSkill(),
        skillLeadership: generateSkill(),
        skillTechnical: generateSkill(),
        skillMarketing: generateSkill(),
        skillLogistics: generateSkill(),
        salary,
        performance: 0.7 + Math.random() * 0.3,
        satisfaction: 0.7 + Math.random() * 0.3
      }
    })

    // Deduct hiring bonus
    await db.bankAccount.update({
      where: { id: mainAccount.id },
      data: { balance: { decrement: hiringBonus } }
    })

    await db.transaction.create({
      data: {
        accountId: mainAccount.id,
        type: "PAYMENT",
        amount: hiringBonus,
        description: `Recrutement: ${employee.fullName}`
      }
    })

    return NextResponse.json({
      success: true,
      employee,
      message: `${employee.fullName} recruté(e) avec succès`
    })

  } catch (error) {
    console.error("Error hiring employee:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
