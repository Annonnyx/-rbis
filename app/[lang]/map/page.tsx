import nextDynamic from "next/dynamic"

const MapClient = nextDynamic(() => import("./map-client").then(mod => mod.MapClient), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-[60vh]"><div className="p-4">Chargement de la carte...</div></div>
})

export default function MapPage() {
  return <MapClient />
}
