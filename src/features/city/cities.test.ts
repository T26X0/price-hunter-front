import { describe, expect, it } from 'vitest'
import { getCitySuggestions } from './cities'

describe('getCitySuggestions', () => {
  it('finds a city by its name, regardless of case', () => {
    expect(getCitySuggestions('екат')).toContainEqual({ name: 'Екатеринбург', region: 'Свердловская область' })
  })

  it('also finds a city by its region', () => {
    expect(getCitySuggestions('приморский')).toContainEqual({ name: 'Владивосток', region: 'Приморский край' })
  })
})
