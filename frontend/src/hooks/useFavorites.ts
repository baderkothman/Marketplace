import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

const FAVORITES_EVENT = 'marketplace:favorites-updated'

function getStorageKey(userId?: string) {
  return `favorite_services:${userId ?? 'guest'}`
}

function readFavorites(key: string) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return [] as number[]
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((value): value is number => Number.isInteger(value)) : []
  } catch {
    return [] as number[]
  }
}

function writeFavorites(key: string, ids: number[]) {
  localStorage.setItem(key, JSON.stringify(ids))
  window.dispatchEvent(new Event(FAVORITES_EVENT))
}

export function useFavorites() {
  const { user } = useAuth()
  const storageKey = getStorageKey(user?.userId)
  const [favoriteIds, setFavoriteIds] = useState<number[]>(() => readFavorites(storageKey))

  useEffect(() => {
    setFavoriteIds(readFavorites(storageKey))
  }, [storageKey])

  useEffect(() => {
    const sync = () => setFavoriteIds(readFavorites(storageKey))

    window.addEventListener('storage', sync)
    window.addEventListener(FAVORITES_EVENT, sync)

    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener(FAVORITES_EVENT, sync)
    }
  }, [storageKey])

  const isFavorite = (serviceId: number) => favoriteIds.includes(serviceId)

  const toggleFavorite = (serviceId: number) => {
    const next = isFavorite(serviceId)
      ? favoriteIds.filter((id) => id !== serviceId)
      : [...favoriteIds, serviceId]

    setFavoriteIds(next)
    writeFavorites(storageKey, next)
    return !isFavorite(serviceId)
  }

  const clearFavorites = () => {
    setFavoriteIds([])
    writeFavorites(storageKey, [])
  }

  return {
    favoriteIds,
    favoritesCount: favoriteIds.length,
    isFavorite,
    toggleFavorite,
    clearFavorites,
  }
}
