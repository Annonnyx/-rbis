"use client"

import dynamic from "next/dynamic"

const MapClient = dynamic(() => import("./map-client").then(mod => mod.MapClient), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-[60vh]"><div className="p-4">Chargement de la carte...</div></div>
})

export function MapWrapper() {
  return <MapClient />
}
