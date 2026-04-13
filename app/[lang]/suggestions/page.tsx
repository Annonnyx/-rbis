import nextDynamic from "next/dynamic"

const SuggestionsClient = nextDynamic(() => import("./suggestions-client").then(mod => mod.SuggestionsClient), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-[60vh]"><div className="p-4">Chargement...</div></div>
})

export default function SuggestionsPage() {
  return <SuggestionsClient />
}
