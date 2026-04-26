"use client"

import { useSession } from "next-auth/react"
import { redirect, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { 
  Building2, TrendingUp, DollarSign, Plus, Edit, Package, 
  ShoppingCart, Users, BarChart3, ArrowUpRight, ArrowDownRight,
  Store, Sparkles, ChevronRight, Briefcase, Zap, UserCircle,
  FlaskConical, Handshake, Store as StoreIcon, Trash2, AlertTriangle
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassInput } from "@/components/ui/glass-input"
import { HoldingPanel } from "@/components/holdings/holding-panel"
import { EventsPanel } from "@/components/events/events-panel"
import { EmployeePanel } from "@/components/employees/employee-panel"
import { TechnologyPanel } from "@/components/technologies/technology-panel"
import { B2BPanel } from "@/components/b2b/b2b-panel"
import { FranchisePanel } from "@/components/franchises/franchise-panel"

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
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "sales" | "products" | "employees" | "analytics" | "technologies" | "b2b" | "franchises" | "holding" | "events">("overview")
  const [showCreate, setShowCreate] = useState(false)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showRecordSale, setShowRecordSale] = useState(false)
  const [showEditBusiness, setShowEditBusiness] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
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
  
  const [saleForm, setSaleForm] = useState({
    productId: "",
    quantity: "",
    buyerName: "",
  })

  useEffect(() => {
    if (status === "authenticated") {
      fetchBusinessData()
    }
  }, [status])

  const fetchBusinessData = async () => {
    try {
      const [businessRes, productsRes, salesRes] = await Promise.all([
        fetch("/api/business"),
        fetch("/api/business/products"),
        fetch("/api/business/sales"),
      ])
      
      if (businessRes.ok) {
        const businessData = await businessRes.json()
        setBusiness(businessData)
      }
      if (productsRes.ok) {
        setProducts(await productsRes.json())
      }
      if (salesRes.ok) {
        setSales(await salesRes.json())
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

  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/business/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: saleForm.productId,
          quantity: parseInt(saleForm.quantity),
          buyerName: saleForm.buyerName,
        }),
      })
      if (res.ok) {
        fetchBusinessData()
        setShowRecordSale(false)
        setSaleForm({ productId: "", quantity: "", buyerName: "" })
      }
    } catch (error) {
      console.error("Error recording sale:", error)
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
      <div className="max-w-2xl mx-auto animate-fade-in">
        <h1 className="text-3xl font-bold mb-2 gradient-text">Créer mon entreprise</h1>
        <p className="text-muted-foreground mb-8">Lancez votre business dans l&apos;économie Ørbis</p>
        
        <GlassCard liquid className="p-8 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Capital minimum requis</p>
              <p className="text-3xl font-bold gradient-text">{formatCurrency(300)}</p>
            </div>
          </div>
        </GlassCard>
        
        <form onSubmit={handleCreate} className="space-y-6">
          <GlassCard className="p-6 space-y-6">
            <GlassInput
              label="Nom de l'entreprise"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Ørbis Technologies"
            />
            <div>
              <label className="text-sm font-medium text-foreground/80 mb-2 block">Description</label>
              <textarea 
                rows={3} 
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                placeholder="Décrivez votre entreprise..."
                className="w-full px-4 py-3 glass-input rounded-xl resize-none"
              />
            </div>
            <GlassInput
              label="Objectif"
              value={formData.objective}
              onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
              placeholder="Ex: Devenir le leader du savon écologique"
            />
            <div className="grid md:grid-cols-2 gap-4">
              <GlassInput
                label="Produit principal"
                value={formData.product}
                onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                placeholder="Ex: Savon artisanal"
              />
              <GlassInput
                label="Service proposé"
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                placeholder="Ex: Livraison à domicile"
              />
            </div>
          </GlassCard>
          
          <div className="flex gap-4">
            <GlassButton
              type="button"
              variant="ghost"
              onClick={() => setShowCreate(false)}
              className="flex-1"
            >
              Annuler
            </GlassButton>
            <GlassButton
              type="submit"
              variant="primary"
              className="flex-1"
            >
              Créer pour {formatCurrency(300)}
            </GlassButton>
          </div>
        </form>
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

  if (showRecordSale) {
    return (
      <div className="max-w-xl mx-auto animate-fade-in">
        <h1 className="text-2xl font-bold mb-6 gradient-text">Enregistrer une vente</h1>
        <form onSubmit={handleRecordSale} className="space-y-6">
          <GlassCard className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground/80 mb-2 block">Produit</label>
              <select
                value={saleForm.productId}
                onChange={(e) => setSaleForm({ ...saleForm, productId: e.target.value })}
                required
                className="w-full px-4 py-3 glass-input rounded-xl"
              >
                <option value="">Sélectionnez un produit</option>
                {products.filter(p => p.isActive).map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {formatCurrency(Number(product.price))} (Stock: {product.stock})
                  </option>
                ))}
              </select>
            </div>
            <GlassInput
              label="Quantité"
              type="number"
              required
              min="1"
              value={saleForm.quantity}
              onChange={(e) => setSaleForm({ ...saleForm, quantity: e.target.value })}
              placeholder="1"
            />
            <GlassInput
              label="Nom de l'acheteur"
              required
              value={saleForm.buyerName}
              onChange={(e) => setSaleForm({ ...saleForm, buyerName: e.target.value })}
              placeholder="Ex: Jean Dupont"
            />
          </GlassCard>
          <div className="flex gap-4">
            <GlassButton type="button" variant="ghost" onClick={() => setShowRecordSale(false)} className="flex-1">
              Annuler
            </GlassButton>
            <GlassButton type="submit" variant="primary" className="flex-1">
              Enregistrer la vente
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

      {/* Sales Tab */}
      {activeTab === "sales" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Historique des ventes</h2>
            <GlassButton onClick={() => setShowRecordSale(true)} variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle vente
            </GlassButton>
          </div>
          
          {sales.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune vente enregistrée</p>
              <GlassButton onClick={() => setShowRecordSale(true)} variant="secondary" className="mt-4">
                Enregistrer votre première vente
              </GlassButton>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {sales.map((sale) => (
                <GlassCard key={sale.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <ArrowUpRight className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium">{sale.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          {sale.quantity} unité(s) à {formatCurrency(Number(sale.unitPrice))}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-500">{formatCurrency(Number(sale.totalAmount))}</p>
                      <p className="text-xs text-muted-foreground">{sale.buyerName}</p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
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
