"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Building2, TrendingUp, Users, MapPin, DollarSign, Package, 
  ArrowRight, Plus, Edit2, Sparkles, Factory, Briefcase, Zap, UserCircle,
  FlaskConical, Handshake, Store as StoreIcon, Trash2, AlertTriangle,
  ChevronRight, Leaf, Lightbulb
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassInput } from "@/components/ui/glass-input"
import { EconomyPanel } from "@/components/business/economy-panel"
import { HoldingPanel } from "@/components/holdings/holding-panel"
import { EventsPanel } from "@/components/events/events-panel"
import { EmployeePanel } from "@/components/employees/employee-panel"
import { TechnologyPanel } from "@/components/technologies/technology-panel"
import { B2BPanel } from "@/components/b2b/b2b-panel"
import { FranchisePanel } from "@/components/franchises/franchise-panel"

// Business types for enhanced creation
interface BusinessTypeOption {
  value: string
  name: string
  icon: string
  subtypes: { value: string; name: string; cost: number; revenue: number; difficulty: number }[]
}

interface GameLocationOption {
  id: string
  name: string
  address: string
  type: string
  district: string
  rentPerSqm: number
  footTraffic: number
  visibility: number
  accessibility: number
}

interface Business {
  id: string
  name: string
  description: string | null
  objective: string | null
  product: string | null
  service: string | null
  capital: number
  isActive: boolean
  stock: {
    symbol: string
    currentPrice: number
    totalShares: number
    availableShares: number
  } | null
}

interface Sale {
  id: string
  productName: string
  quantity: number
  unitPrice: number
  totalAmount: number
  buyerName: string
  createdAt: string
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  isActive: boolean
}

const isBrowser = typeof window !== "undefined"

function useSafeSession() {
  if (!isBrowser) {
    return { data: null, status: "loading" as const }
  }
  return useSession()
}

export function BusinessClient() {
  const { data: session, status } = useSafeSession()
  const router = useRouter()
  const [business, setBusiness] = useState<Business | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "sales" | "products" | "employees" | "analytics" | "technologies" | "b2b" | "franchises" | "holding" | "events">("overview")
  const [showCreate, setShowCreate] = useState(false)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showEditBusiness, setShowEditBusiness] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  // Enhanced creation form state
  const [createStep, setCreateStep] = useState(1)
  const [businessTypes, setBusinessTypes] = useState<BusinessTypeOption[]>([])
  const [locations, setLocations] = useState<GameLocationOption[]>([])
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedSubtype, setSelectedSubtype] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [businessName, setBusinessName] = useState("")
  const [pricePositioning, setPricePositioning] = useState<string>("accessible")
  const [ethicsPositioning, setEthicsPositioning] = useState<string>("standard")
  const [innovationPositioning, setInnovationPositioning] = useState<string>("hybrid")
  const [createLoading, setCreateLoading] = useState(false)
  const [createMessage, setCreateMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    objective: "",
    product: "",
    service: "",
  })

  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
  })
  
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
  })
  

  useEffect(() => {
    if (status === "authenticated") {
      fetchBusinessData()
    }
  }, [status])

  // Fetch business types and locations for creation
  useEffect(() => {
    if (status !== "authenticated") return

    // Fetch business types
    fetch("/api/business/types")
      .then(res => res.json())
      .then(data => {
        const types = Object.entries(data).map(([key, value]: [string, any]) => ({
          value: key,
          name: value.name,
          icon: value.icon,
          subtypes: value.subtypes
        }))
        setBusinessTypes(types)
      })
      .catch(err => console.error("Error fetching business types:", err))

    // Fetch locations
    fetch("/api/locations")
      .then(res => res.json())
      .then(data => {
        console.log("Locations fetched:", data)
        setLocations(data.locations || [])
      })
      .catch(err => console.error("Error fetching locations:", err))
  }, [status])

  const fetchBusinessData = async () => {
    try {
      const [businessRes, productsRes] = await Promise.all([
        fetch("/api/business"),
        fetch("/api/business/products"),
      ])
      
      if (businessRes.ok) {
        const businessData = await businessRes.json()
        setBusiness(businessData)
      }
      if (productsRes.ok) {
        setProducts(await productsRes.json())
      }
    } catch (error) {
      console.error("Error fetching business data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        fetchBusinessData()
        setShowCreate(false)
      }
    } catch (error) {
      console.error("Error creating business:", error)
    }
  }

  // Enhanced creation handlers
  const selectedTypeData = businessTypes.find(t => t.value === selectedType)
  const selectedSubtypeData = selectedTypeData?.subtypes.find((s: {value: string}) => s.value === selectedSubtype)
  const selectedLocationData = locations.find(l => l.id === selectedLocation)
  const totalCost = selectedSubtypeData?.cost || 0
  const estimatedRevenue = selectedSubtypeData?.revenue || 0

  const handleEnhancedCreate = async () => {
    if (!businessName || !selectedType || !selectedSubtype || !selectedLocation) {
      setCreateMessage({ type: "error", text: "Veuillez remplir tous les champs" })
      return
    }

    setCreateLoading(true)
    try {
      const res = await fetch("/api/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: businessName,
          type: selectedType,
          subType: selectedSubtype,
          locationId: selectedLocation,
          pricePositioning,
          ethicsPositioning,
          innovationPositioning
        })
      })

      if (res.ok) {
        setCreateMessage({ type: "success", text: "Entreprise créée avec succès !" })
        fetchBusinessData()
        setTimeout(() => {
          setShowCreate(false)
          setCreateStep(1)
          setBusinessName("")
          setSelectedType(null)
          setSelectedSubtype(null)
          setSelectedLocation(null)
          setCreateMessage(null)
        }, 1500)
      } else {
        const data = await res.json()
        setCreateMessage({ type: "error", text: data.message || "Erreur lors de la création" })
      }
    } catch (error) {
      setCreateMessage({ type: "error", text: "Erreur réseau" })
    } finally {
      setCreateLoading(false)
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/business/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: productForm.name,
          description: productForm.description,
          price: parseFloat(productForm.price),
          stock: parseInt(productForm.stock),
        }),
      })
      if (res.ok) {
        fetchBusinessData()
        setShowAddProduct(false)
        setProductForm({ name: "", description: "", price: "", stock: "" })
      }
    } catch (error) {
      console.error("Error adding product:", error)
    }
  }


  const openEditModal = () => {
    if (business) {
      setEditFormData({
        name: business.name,
        description: business.description || "",
      })
      setShowEditBusiness(true)
    }
  }

  const handleEditBusiness = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/business", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      })
      if (res.ok) {
        fetchBusinessData()
        setShowEditBusiness(false)
      }
    } catch (error) {
      console.error("Error updating business:", error)
    }
  }

  const handleDeleteBusiness = async () => {
    try {
      const res = await fetch("/api/business", {
        method: "DELETE",
      })
      if (res.ok) {
        setBusiness(null)
        setShowDeleteConfirm(false)
        router.refresh()
      }
    } catch (error) {
      console.error("Error deleting business:", error)
    }
  }

  const totalRevenue = sales.reduce((acc, sale) => acc + Number(sale.totalAmount), 0)
  const totalProducts = products.length
  const totalSales = sales.length

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <Building2 className="w-16 h-16 text-primary/60 animate-pulse" />
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    redirect("/login")
  }

  if (showCreate) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold gradient-text">Créer mon entreprise</h1>
          <div className="flex items-center">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  createStep >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {s}
                </div>
                {s < 4 && <div className={`w-16 h-1 mx-2 ${createStep > s ? "bg-primary" : "bg-muted"}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Business Type */}
        {createStep === 1 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Choisissez le type d&apos;entreprise</h2>
            {businessTypes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-muted-foreground">Chargement des types d&apos;entreprise...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {businessTypes.map((type) => (
                    <GlassCard
                      key={type.value}
                      className={`p-4 cursor-pointer transition-all hover:border-primary/50 ${
                        selectedType === type.value ? "border-primary bg-primary/10 neon-pulse" : ""
                      }`}
                      onClick={() => {
                        setSelectedType(type.value)
                        setSelectedSubtype(null)
                      }}
                    >
                      <div className="text-3xl mb-2">{type.icon}</div>
                      <h3 className="font-semibold">{type.name}</h3>
                      <p className="text-xs text-muted-foreground">{type.subtypes?.length || 0} sous-types</p>
                    </GlassCard>
                  ))}
                </div>
                {selectedType && (
                  <div className="mt-6 flex justify-end">
                    <GlassButton onClick={() => setCreateStep(2)}>
                      Suivant <ChevronRight className="w-4 h-4 ml-2" />
                    </GlassButton>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Step 2: Subtype */}
        {createStep === 2 && selectedTypeData && (
          <div>
            <h2 className="text-xl font-bold mb-4">Choisissez la spécialisation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedTypeData.subtypes.map((subtype) => (
                <GlassCard
                  key={subtype.value}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedSubtype === subtype.value ? "border-primary bg-primary/10 neon-pulse" : ""
                  }`}
                  onClick={() => setSelectedSubtype(subtype.value)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{subtype.name}</h3>
                    <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary">
                      {"★".repeat(subtype.difficulty)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Coût création</p>
                      <p className="font-semibold">{formatCurrency(subtype.cost)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Revenu/h</p>
                      <p className="font-semibold text-green-500">{formatCurrency(subtype.revenue)}/h</p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
            <div className="mt-6 flex justify-between">
              <GlassButton variant="ghost" onClick={() => setCreateStep(1)}>
                Retour
              </GlassButton>
              {selectedSubtype && (
                <GlassButton onClick={() => setCreateStep(3)}>
                  Suivant <ChevronRight className="w-4 h-4 ml-2" />
                </GlassButton>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Location */}
        {createStep === 3 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Choisissez l&apos;emplacement</h2>
            {locations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-muted-foreground">Chargement des emplacements...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {locations.map((location) => (
                    <GlassCard
                      key={location.id}
                      className={`p-4 cursor-pointer transition-all hover:border-primary/50 ${
                        selectedLocation === location.id ? "border-primary bg-primary/10 neon-pulse" : ""
                      }`}
                      onClick={() => setSelectedLocation(location.id)}
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <MapPin className="w-5 h-5 text-primary mt-1" />
                        <div className="flex-1">
                          <h3 className="font-semibold">{location.name}</h3>
                          <p className="text-xs text-muted-foreground">{location.address}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs mt-3">
                        <div>
                          <p className="text-muted-foreground">Type</p>
                          <p className="font-medium">{location.type}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Trafic</p>
                          <p className="font-medium">{location.footTraffic}/100</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Loyer/m²</p>
                          <p className="font-medium">{formatCurrency(location.rentPerSqm)}</p>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
                <div className="mt-6 flex justify-between">
                  <GlassButton variant="ghost" onClick={() => setCreateStep(2)}>
                    Retour
                  </GlassButton>
                  {selectedLocation && (
                    <GlassButton onClick={() => setCreateStep(4)}>
                      Suivant <ChevronRight className="w-4 h-4 ml-2" />
                    </GlassButton>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 4: Details & Positioning */}
        {createStep === 4 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Détails et Direction Artistique</h2>
            
            <GlassCard className="p-6 mb-6">
              <h3 className="font-semibold mb-4">Nom de l&apos;entreprise</h3>
              <GlassInput
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Ex: Ma Super Entreprise"
              />
            </GlassCard>

            <GlassCard className="p-6 mb-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Positionnement Prix
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["discount", "accessible", "premium", "luxe"].map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setPricePositioning(pos)}
                    className={`p-3 rounded-lg border transition-all ${
                      pricePositioning === pos ? "border-primary bg-primary/10" : ""
                    }`}
                  >
                    <p className="font-medium capitalize">{pos}</p>
                  </button>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-6 mb-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Leaf className="w-5 h-5" />
                Positionnement Éthique
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["standard", "eco_friendly", "fair_trade", "local"].map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setEthicsPositioning(pos)}
                    className={`p-3 rounded-lg border transition-all ${
                      ethicsPositioning === pos ? "border-primary bg-primary/10" : ""
                    }`}
                  >
                    <p className="font-medium capitalize">{pos.replace("_", " ")}</p>
                  </button>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-6 mb-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Positionnement Innovation
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {["traditional", "hybrid", "innovative"].map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setInnovationPositioning(pos)}
                    className={`p-3 rounded-lg border transition-all ${
                      innovationPositioning === pos ? "border-primary bg-primary/10" : ""
                    }`}
                  >
                    <p className="font-medium capitalize">{pos}</p>
                  </button>
                ))}
              </div>
            </GlassCard>

            {/* Summary */}
            <GlassCard className="p-6 mb-6 bg-primary/5 border-primary/30">
              <h3 className="font-semibold mb-4 text-primary">Récapitulatif</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span>{selectedTypeData?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Spécialisation:</span>
                  <span>{selectedSubtypeData?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Emplacement:</span>
                  <span>{selectedLocationData?.name}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Coût total:</span>
                  <span className="text-primary">{formatCurrency(totalCost)}</span>
                </div>
                <div className="flex justify-between font-semibold text-green-500">
                  <span>Revenu estimé:</span>
                  <span>{formatCurrency(estimatedRevenue)}/h</span>
                </div>
              </div>
            </GlassCard>

            {createMessage && (
              <div className={`p-4 rounded-lg mb-4 ${
                createMessage.type === "success" ? "bg-green-500/10 text-green-500 border border-green-500/30" : "bg-red-500/10 text-red-500 border border-red-500/30"
              }`}>
                {createMessage.text}
              </div>
            )}

            <div className="flex justify-between">
              <GlassButton variant="ghost" onClick={() => setCreateStep(3)}>
                Retour
              </GlassButton>
              <GlassButton 
                onClick={handleEnhancedCreate} 
                disabled={createLoading || !businessName}
                className="neon-pulse"
              >
                <Building2 className="w-4 h-4 mr-2" />
                {createLoading ? "Création..." : `Créer pour ${formatCurrency(totalCost)}`}
              </GlassButton>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (showAddProduct) {
    return (
      <div className="max-w-xl mx-auto animate-fade-in">
        <h1 className="text-2xl font-bold mb-6 gradient-text">Ajouter un produit</h1>
        <form onSubmit={handleAddProduct} className="space-y-6">
          <GlassCard className="p-6 space-y-4">
            <GlassInput
              label="Nom du produit"
              required
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              placeholder="Ex: iPhone 15 Pro"
            />
            <div>
              <label className="text-sm font-medium text-foreground/80 mb-2 block">Description</label>
              <textarea 
                rows={2} 
                value={productForm.description} 
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} 
                placeholder="Décrivez votre produit..."
                className="w-full px-4 py-3 glass-input rounded-xl resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <GlassInput
                label="Prix (Ø)"
                type="number"
                required
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                placeholder="299"
              />
              <GlassInput
                label="Stock initial"
                type="number"
                required
                value={productForm.stock}
                onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                placeholder="100"
              />
            </div>
          </GlassCard>
          <div className="flex gap-4">
            <GlassButton type="button" variant="ghost" onClick={() => setShowAddProduct(false)} className="flex-1">
              Annuler
            </GlassButton>
            <GlassButton type="submit" variant="primary" className="flex-1">
              Ajouter le produit
            </GlassButton>
          </div>
        </form>
      </div>
    )
  }

  if (showEditBusiness) {
    return (
      <div className="max-w-xl mx-auto animate-fade-in">
        <h1 className="text-2xl font-bold mb-2 gradient-text">Modifier l&apos;entreprise</h1>
        <p className="text-muted-foreground mb-6">Mettez à jour les informations de votre entreprise</p>
        
        <form onSubmit={handleEditBusiness} className="space-y-6">
          <GlassCard className="p-6 space-y-4">
            <GlassInput
              label="Nom de l&apos;entreprise"
              required
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              placeholder="Nom de votre entreprise"
            />
            <div>
              <label className="text-sm font-medium text-foreground/80 mb-2 block">Description</label>
              <textarea
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder="Décrivez votre entreprise..."
                className="w-full px-4 py-3 glass-input rounded-xl min-h-[100px]"
              />
            </div>
          </GlassCard>
          
          <div className="flex gap-4">
            <GlassButton type="button" variant="ghost" onClick={() => setShowEditBusiness(false)} className="flex-1">
              Annuler
            </GlassButton>
            <GlassButton type="submit" variant="primary" className="flex-1">
              Enregistrer les modifications
            </GlassButton>
          </div>
        </form>
      </div>
    )
  }

  if (showDeleteConfirm) {
    return (
      <div className="max-w-md mx-auto animate-fade-in">
        <GlassCard className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-red-500">Supprimer l&apos;entreprise ?</h1>
          <p className="text-muted-foreground mb-6">
            Cette action est irréversible. Toutes les données de l&apos;entreprise, y compris les actions en bourse, seront définitivement supprimées.
          </p>
          <div className="flex gap-4">
            <GlassButton type="button" variant="ghost" onClick={() => setShowDeleteConfirm(false)} className="flex-1">
              Annuler
            </GlassButton>
            <GlassButton type="button" variant="primary" onClick={handleDeleteBusiness} className="flex-1 bg-red-500 hover:bg-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <Building2 className="w-24 h-24 text-muted-foreground relative" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Aucune entreprise</h1>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          Vous n&apos;avez pas encore créé d&apos;entreprise. Lancez votre business pour seulement 300 Ø.
        </p>
        <GlassButton onClick={() => setShowCreate(true)} variant="primary" size="lg" data-tutorial="create-business">
          <Plus className="w-5 h-5 mr-2" />
          Créer mon entreprise
        </GlassButton>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{business.name}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              business.isActive 
                ? "bg-green-500/10 text-green-500 border border-green-500/20" 
                : "bg-red-500/10 text-red-500 border border-red-500/20"
            }`}>
              {business.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <p className="text-muted-foreground">{business.description}</p>
        </div>
        <div className="flex gap-2">
          <GlassButton variant="secondary" onClick={openEditModal}>
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </GlassButton>
          <GlassButton variant="secondary" onClick={() => setShowDeleteConfirm(true)} className="text-red-500 hover:text-red-600">
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </GlassButton>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2" data-tutorial="business-tabs">
        {[
          { id: "overview", label: "Vue d'ensemble", icon: BarChart3 },
          { id: "sales", label: "Ventes", icon: ShoppingCart },
          { id: "products", label: "Produits", icon: Package },
          { id: "employees", label: "Équipe", icon: UserCircle },
          { id: "analytics", label: "Analytics", icon: TrendingUp },
          { id: "technologies", label: "R&D", icon: FlaskConical },
          { id: "b2b", label: "B2B", icon: Handshake },
          { id: "franchises", label: "Franchises", icon: StoreIcon },
          { id: "holding", label: "Holding", icon: Briefcase },
          { id: "events", label: "Événements", icon: Zap },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-primary text-white shadow-lg shadow-primary/25"
                : "glass-button"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-4">
            <GlassCard liquid className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Capital</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(Number(business.capital))}</p>
            </GlassCard>
            
            <GlassCard liquid className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <ArrowUpRight className="w-5 h-5 text-green-500" />
                </div>
                <span className="text-sm text-muted-foreground">Revenus</span>
              </div>
              <p className="text-2xl font-bold text-green-500">{formatCurrency(totalRevenue)}</p>
            </GlassCard>
            
            <GlassCard liquid className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Package className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-sm text-muted-foreground">Produits</span>
              </div>
              <p className="text-2xl font-bold">{totalProducts}</p>
            </GlassCard>
            
            <GlassCard liquid className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-purple-500" />
                </div>
                <span className="text-sm text-muted-foreground">Ventes</span>
              </div>
              <p className="text-2xl font-bold">{totalSales}</p>
            </GlassCard>
          </div>

          {/* Stock Info */}
          {business.stock && (
            <GlassCard liquid className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Actions en bourse</h3>
                    <p className="text-sm text-muted-foreground">{business.stock.symbol}</p>
                  </div>
                </div>
                <GlassButton variant="primary" size="sm" onClick={() => router.push("/market")}>
                  Voir la bourse
                  <ChevronRight className="w-4 h-4 ml-1" />
                </GlassButton>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-xl bg-background/50">
                  <p className="text-sm text-muted-foreground mb-1">Prix actuel</p>
                  <p className="text-xl font-bold">{formatCurrency(Number(business.stock.currentPrice))}</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-background/50">
                  <p className="text-sm text-muted-foreground mb-1">Actions totales</p>
                  <p className="text-xl font-bold">{business.stock.totalShares}</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-background/50">
                  <p className="text-sm text-muted-foreground mb-1">Disponibles</p>
                  <p className="text-xl font-bold">{business.stock.availableShares}</p>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Company Info */}
          <div className="grid md:grid-cols-2 gap-6">
            {business.objective && (
              <GlassCard className="p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Objectif
                </h3>
                <p className="text-muted-foreground">{business.objective}</p>
              </GlassCard>
            )}
            {business.product && (
              <GlassCard className="p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Store className="w-4 h-4 text-primary" />
                  Produit principal
                </h3>
                <p className="text-muted-foreground">{business.product}</p>
              </GlassCard>
            )}
          </div>
        </div>
      )}

      {/* Economy Tab - Automatic Sales System */}
      {activeTab === "sales" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Économie & Ventes Automatiques</h2>
          </div>
          <EconomyPanel />
        </div>
      )}

      {/* Products Tab */}
      {activeTab === "products" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Mes produits</h2>
            <GlassButton onClick={() => setShowAddProduct(true)} variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un produit
            </GlassButton>
          </div>
          
          {products.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun produit enregistré</p>
              <GlassButton onClick={() => setShowAddProduct(true)} variant="secondary" className="mt-4">
                Ajouter votre premier produit
              </GlassButton>
            </GlassCard>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <GlassCard key={product.id} className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold">{product.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.isActive 
                        ? "bg-green-500/10 text-green-500" 
                        : "bg-red-500/10 text-red-500"
                    }`}>
                      {product.isActive ? "Actif" : "Inactif"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div>
                      <p className="text-lg font-bold gradient-text">{formatCurrency(Number(product.price))}</p>
                      <p className="text-xs text-muted-foreground">{product.stock} en stock</p>
                    </div>
                    <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Analytics</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <GlassCard liquid className="p-6">
              <h3 className="font-semibold mb-4">Revenus totals</h3>
              <p className="text-4xl font-bold gradient-text">{formatCurrency(totalRevenue)}</p>
              <p className="text-sm text-muted-foreground mt-2">Depuis la création</p>
            </GlassCard>
            <GlassCard liquid className="p-6">
              <h3 className="font-semibold mb-4">Nombre de ventes</h3>
              <p className="text-4xl font-bold">{totalSales}</p>
              <p className="text-sm text-muted-foreground mt-2">Transactions complétées</p>
            </GlassCard>
          </div>
          <GlassCard className="p-6">
            <p className="text-muted-foreground text-center">
              Les graphiques détaillés seront bientôt disponibles
            </p>
          </GlassCard>
        </div>
      )}

      {/* Holding Tab */}
      {activeTab === "holding" && (
        <div className="space-y-6">
          <HoldingPanel />
        </div>
      )}

      {/* Events Tab */}
      {activeTab === "events" && (
        <div className="space-y-6">
          <EventsPanel />
        </div>
      )}

      {/* Employees Tab */}
      {activeTab === "employees" && (
        <div className="space-y-6">
          <EmployeePanel />
        </div>
      )}

      {/* Technologies Tab */}
      {activeTab === "technologies" && (
        <div className="space-y-6">
          <TechnologyPanel />
        </div>
      )}

      {/* B2B Tab */}
      {activeTab === "b2b" && (
        <div className="space-y-6">
          <B2BPanel />
        </div>
      )}

      {/* Franchises Tab */}
      {activeTab === "franchises" && (
        <div className="space-y-6">
          <FranchisePanel />
        </div>
      )}
    </div>
  )
}
