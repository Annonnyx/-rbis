"use client"

import { useState, useEffect } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassInput } from "@/components/ui/glass-input"
import { Building2, MapPin, TrendingUp, Leaf, Heart, Lightbulb, ChevronRight } from "lucide-react"

interface BusinessType {
  value: string
  name: string
  icon: string
  subtypes: { value: string; name: string; cost: number; revenue: number; difficulty: number }[]
}

interface GameLocation {
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

export function BusinessCreationEnhanced() {
  const [step, setStep] = useState(1)
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([])
  const [locations, setLocations] = useState<GameLocation[]>([])
  
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedSubtype, setSelectedSubtype] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  
  const [businessName, setBusinessName] = useState("")
  const [pricePositioning, setPricePositioning] = useState<string>("accessible")
  const [ethicsPositioning, setEthicsPositioning] = useState<string>("standard")
  const [innovationPositioning, setInnovationPositioning] = useState<string>("hybrid")
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
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
      .catch(console.error)

    // Fetch locations
    fetch("/api/locations")
      .then(res => res.json())
      .then(data => setLocations(data.locations || []))
      .catch(console.error)
  }, [])

  const selectedTypeData = businessTypes.find(t => t.value === selectedType)
  const selectedSubtypeData = selectedTypeData?.subtypes.find(s => s.value === selectedSubtype)
  const selectedLocationData = locations.find(l => l.id === selectedLocation)

  const totalCost = selectedSubtypeData?.cost || 0
  const estimatedRevenue = selectedSubtypeData?.revenue || 0

  const handleCreate = async () => {
    if (!businessName || !selectedType || !selectedSubtype || !selectedLocation) {
      setMessage({ type: "error", text: "Veuillez remplir tous les champs" })
      return
    }

    setLoading(true)
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
        setMessage({ type: "success", text: "Entreprise créée avec succès !" })
        // Reset form
        setStep(1)
        setBusinessName("")
        setSelectedType(null)
        setSelectedSubtype(null)
        setSelectedLocation(null)
      } else {
        const data = await res.json()
        setMessage({ type: "error", text: data.message || "Erreur lors de la création" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur réseau" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>
              {s}
            </div>
            {s < 4 && <div className={`w-16 h-1 mx-2 ${step > s ? "bg-primary" : "bg-muted"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Business Type */}
      {step === 1 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Choisissez le type d'entreprise</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {businessTypes.map((type) => (
              <GlassCard
                key={type.value}
                className={`p-4 cursor-pointer transition-all ${
                  selectedType === type.value ? "border-primary bg-primary/10" : ""
                }`}
                onClick={() => {
                  setSelectedType(type.value)
                  setSelectedSubtype(null)
                }}
              >
                <div className="text-3xl mb-2">{type.icon}</div>
                <h3 className="font-semibold">{type.name}</h3>
                <p className="text-xs text-muted-foreground">{type.subtypes.length} sous-types</p>
              </GlassCard>
            ))}
          </div>
          {selectedType && (
            <div className="mt-6 flex justify-end">
              <GlassButton onClick={() => setStep(2)}>
                Suivant <ChevronRight className="w-4 h-4 ml-2" />
              </GlassButton>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Subtype */}
      {step === 2 && selectedTypeData && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Choisissez la spécialisation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedTypeData.subtypes.map((subtype) => (
              <GlassCard
                key={subtype.value}
                className={`p-4 cursor-pointer transition-all ${
                  selectedSubtype === subtype.value ? "border-primary bg-primary/10" : ""
                }`}
                onClick={() => setSelectedSubtype(subtype.value)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{subtype.name}</h3>
                  <span className="text-xs px-2 py-1 rounded bg-primary/10">
                    {"★".repeat(subtype.difficulty)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Coût création</p>
                    <p className="font-semibold">{subtype.cost.toLocaleString()}\u00D8</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Revenu/h</p>
                    <p className="font-semibold text-green-500">{subtype.revenue}\u00D8/h</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
          <div className="mt-6 flex justify-between">
            <GlassButton variant="secondary" onClick={() => setStep(1)}>
              Retour
            </GlassButton>
            {selectedSubtype && (
              <GlassButton onClick={() => setStep(3)}>
                Suivant <ChevronRight className="w-4 h-4 ml-2" />
              </GlassButton>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Location */}
      {step === 3 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Choisissez l'emplacement</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {locations.map((location) => (
              <GlassCard
                key={location.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedLocation === location.id ? "border-primary bg-primary/10" : ""
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
                    <p className="font-medium">{location.rentPerSqm}\u00D8</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
          <div className="mt-6 flex justify-between">
            <GlassButton variant="secondary" onClick={() => setStep(2)}>
              Retour
            </GlassButton>
            {selectedLocation && (
              <GlassButton onClick={() => setStep(4)}>
                Suivant <ChevronRight className="w-4 h-4 ml-2" />
              </GlassButton>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Details & DA */}
      {step === 4 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Détails et Direction Artistique</h2>
          
          <GlassCard className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Nom de l'entreprise</h3>
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
          <GlassCard className="p-6 mb-6 bg-primary/5">
            <h3 className="font-semibold mb-4">Récapitulatif</h3>
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
                <span>{totalCost.toLocaleString()}\u00D8</span>
              </div>
              <div className="flex justify-between font-semibold text-green-500">
                <span>Revenu estimé:</span>
                <span>{estimatedRevenue}\u00D8/h</span>
              </div>
            </div>
          </GlassCard>

          <div className="flex justify-between">
            <GlassButton variant="secondary" onClick={() => setStep(3)}>
              Retour
            </GlassButton>
            <GlassButton onClick={handleCreate} disabled={loading || !businessName}>
              <Building2 className="w-4 h-4 mr-2" />
              {loading ? "Création..." : "Créer l'entreprise"}
            </GlassButton>
          </div>
        </div>
      )}

      {/* Message */}
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
