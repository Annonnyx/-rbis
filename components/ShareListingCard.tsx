// ============================================
// components/ShareListingCard.tsx
// Card d'annonce de vente sur le marché secondaire
// ============================================

import { GlassCard } from './ui/GlassCard'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { OrbeCurrency } from './OrbeCurrency'
import { User, Package, ArrowRight } from 'lucide-react'
import type { ActiveListing } from '@/app/actions/market'

interface ShareListingCardProps {
  listing: ActiveListing
  onBuy: () => void
  isOwn?: boolean
}

export function ShareListingCard({ listing, onBuy, isOwn }: ShareListingCardProps) {
  return (
    <GlassCard className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold text-white">{listing.companyName}</h3>
          <Badge variant="neutral">Marché secondaire</Badge>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
          <span className="flex items-center gap-1">
            <User className="w-4 h-4" />
            {listing.sellerName}
          </span>
          <span className="flex items-center gap-1">
            <Package className="w-4 h-4" />
            {listing.quantity} actions
          </span>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="text-right">
          <p className="text-lg font-bold text-white">
            <OrbeCurrency amount={listing.askingPrice} />
          </p>
          <p className="text-xs text-white/40">
            Total: <OrbeCurrency amount={listing.askingPriceTotal} />
          </p>
        </div>
        
        {isOwn ? (
          <Button variant="ghost" size="sm" disabled className="opacity-50">
            Votre annonce
          </Button>
        ) : (
          <Button onClick={onBuy} size="sm">
            <ArrowRight className="w-4 h-4 mr-1" />
            Acheter
          </Button>
        )}
      </div>
    </GlassCard>
  )
}
