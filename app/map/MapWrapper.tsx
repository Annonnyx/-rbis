'use client'

import dynamic from 'next/dynamic'

const MapClient = dynamic(
  () => import('./MapClient').then((mod) => mod.MapClient),
  { ssr: false }
)

export function MapWrapper() {
  return <MapClient />
}
