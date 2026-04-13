"use client"

import dynamic from "next/dynamic"

const BusinessClient = dynamic(() => import("./business-client").then(mod => mod.BusinessClient), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-[60vh]"><div className="p-4">Chargement...</div></div>
})

export function BusinessWrapper() {
  return <BusinessClient />
}
