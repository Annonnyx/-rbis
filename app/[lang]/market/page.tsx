import nextDynamic from "next/dynamic"

const MarketClient = nextDynamic(() => import("./market-client").then(mod => mod.MarketClient), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-[60vh]"><div className="p-4">Chargement du marché...</div></div>
})

export default function MarketPage() {
  return <MarketClient />
}
