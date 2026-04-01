'use client'

import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications'
import { Bell, X, MapPin, Wallet, Sparkles, Check } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { clsx } from 'clsx'

interface NotificationBellProps {
  userId: string | null
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useRealtimeNotifications(userId)

  const getIcon = (type: string) => {
    switch (type) {
      case 'LOCATION_UNLOCKED':
        return <MapPin size={16} className="text-violet-400" />
      case 'TRANSFER_RECEIVED':
        return <Wallet size={16} className="text-green-400" />
      case 'SUGGESTION_IMPLEMENTED':
        return <Sparkles size={16} className="text-yellow-400" />
      default:
        return <Bell size={16} className="text-white/50" />
    }
  }

  const getLink = (type: string, data?: any) => {
    switch (type) {
      case 'LOCATION_UNLOCKED':
        return '/map'
      case 'TRANSFER_RECEIVED':
        return '/bank'
      case 'SUGGESTION_IMPLEMENTED':
        return '/suggestions'
      default:
        return '#'
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200"
      >
        <Bell size={20} className="text-white/70" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-violet-500 text-white text-xs flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 backdrop-blur-xl bg-black/80 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="font-semibold text-white">Notifications</h3>
              <div className="flex gap-2">
                {notifications.length > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
                  >
                    <Check size={12} />
                    Tout lire
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/50 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell size={32} className="text-white/20 mx-auto mb-2" />
                  <p className="text-white/50 text-sm">Aucune notification</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    href={getLink(notification.type, notification.data)}
                    onClick={() => {
                      markAsRead(notification.id)
                      setIsOpen(false)
                    }}
                    className={clsx(
                      'flex items-start gap-3 p-4 border-b border-white/5 hover:bg-white/5 transition-colors',
                      !notification.read && 'bg-violet-500/5'
                    )}
                  >
                    <div className="mt-0.5">{getIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">
                        {notification.title}
                      </p>
                      <p className="text-xs text-white/50 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-white/30 mt-1">
                        {new Date(notification.createdAt).toLocaleTimeString(
                          'fr-FR',
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-violet-500 mt-1.5" />
                    )}
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
