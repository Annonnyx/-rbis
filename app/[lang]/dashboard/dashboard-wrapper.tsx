"use client"

import dynamic from "next/dynamic"

const DashboardClient = dynamic(() => import("./dashboard-client").then(mod => mod.DashboardClient), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-[60vh]"><div className="p-4">Chargement...</div></div>
})

export function DashboardWrapper() {
  return <DashboardClient />
}
