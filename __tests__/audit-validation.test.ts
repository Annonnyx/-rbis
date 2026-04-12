// ============================================
// __tests__/audit-validation.test.ts
// Tests de validation des corrections d'audit
// ============================================

import { describe, it, expect } from 'vitest'
import { 
  formatOrbe, 
  toOrbe, 
  toCentimes, 
  serializeBigInt, 
  deserializeBigInt,
  serializedToOrbe 
} from '@/lib/currency'

describe('Currency Utilities', () => {
  describe('formatOrbe', () => {
    it('formate correctement les centimes en Orbe', () => {
      expect(formatOrbe(100000n)).toBe('◎ 1 000,00')
      expect(formatOrbe(500n)).toBe('◎ 5,00')
      expect(formatOrbe(0n)).toBe('◎ 0,00')
    })
  })

  describe('toOrbe', () => {
    it('convertit les centimes en nombre Orbe', () => {
      expect(toOrbe(100000n)).toBe(1000.00)
      expect(toOrbe(500n)).toBe(5.00)
      expect(toOrbe(0n)).toBe(0)
    })
  })

  describe('toCentimes', () => {
    it('convertit les Orbe en centimes', () => {
      expect(toCentimes(1000.00)).toBe(100000n)
      expect(toCentimes(5.00)).toBe(500n)
      expect(toCentimes(0)).toBe(0n)
    })
  })

  describe('Sérialisation BigInt', () => {
    it('sérialise et désérialise correctement', () => {
      const original = 123456789n
      const serialized = serializeBigInt(original)
      const deserialized = deserializeBigInt(serialized)
      
      expect(serialized).toBe('123456789')
      expect(deserialized).toBe(original)
    })

    it('convertit les valeurs sérialisées pour les graphiques', () => {
      expect(serializedToOrbe('100000')).toBe(1000.00)
      expect(serializedToOrbe('500')).toBe(5.00)
    })
  })
})

describe('Audit Fixes Validation', () => {
  it('vérifie que les fonctions de currency sont exportées', () => {
    expect(typeof formatOrbe).toBe('function')
    expect(typeof toOrbe).toBe('function')
    expect(typeof toCentimes).toBe('function')
    expect(typeof serializeBigInt).toBe('function')
    expect(typeof deserializeBigInt).toBe('function')
    expect(typeof serializedToOrbe).toBe('function')
  })

  it('vérifie que serializeBigInt retourne une string', () => {
    const result = serializeBigInt(100000n)
    expect(typeof result).toBe('string')
    expect(() => JSON.stringify({ amount: result })).not.toThrow()
  })
})
