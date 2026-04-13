"use client"

import dynamic from "next/dynamic"

const BankClient = dynamic(() => import("./bank-client").then(mod => mod.BankClient), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-[60vh]"><div className="p-4">Chargement...</div></div>
})

export function BankWrapper() {
  return <BankClient />
}
