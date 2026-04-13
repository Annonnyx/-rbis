"use client"

import dynamic from "next/dynamic"

const MarketClient = dynamic(() => import("./market-client").then(mod => mod.MarketClient), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-[60vh]"><div className="p-4">Chargement du marché...</div></div>
})

export function MarketWrapper() {
  return <MarketClient />
}
