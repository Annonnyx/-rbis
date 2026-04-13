"use client"

import dynamic from "next/dynamic"

const LoginClient = dynamic(() => import("./login-client").then(mod => mod.LoginClient), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="p-4">Chargement...</div></div>
})

export function LoginWrapper() {
  return <LoginClient />
}
