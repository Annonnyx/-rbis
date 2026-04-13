import nextDynamic from "next/dynamic"

const ProfileClient = nextDynamic(() => import("./profile-client").then(mod => mod.ProfileClient), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-[60vh]"><div className="p-4">Chargement...</div></div>
})

export default function ProfilePage() {
  return <ProfileClient />
}
