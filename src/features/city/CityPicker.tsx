import { useId, useMemo, useState, type KeyboardEvent } from 'react'
import { getCitySuggestions } from './cities'

type CityPickerProps = {
  value: string
  onChange: (city: string) => void
}

export function CityPicker({ value, onChange }: CityPickerProps) {
  const inputId = useId()
  const listId = useId()
  const [isFocused, setIsFocused] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const suggestions = useMemo(() => getCitySuggestions(value), [value])
  const isOpen = isFocused && value.trim().length > 0

  const selectCity = (city: string) => {
    onChange(city)
    setIsFocused(false)
    setActiveIndex(-1)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (event.key === 'Escape') setIsFocused(false)
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((current) => Math.min(current + 1, suggestions.length - 1))
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((current) => Math.max(current - 1, 0))
    }

    if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault()
      selectCity(suggestions[activeIndex].name)
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setIsFocused(false)
      setActiveIndex(-1)
    }
  }

  return (
    <div className="city-picker">
      <label className="city-picker-label" htmlFor={inputId}>Ваш город</label>
      <span className="city-picker-field"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 10c0 5-7 10-7 10s-7-5-7-10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.4" /></svg><input id={inputId} value={value} onChange={(event) => { onChange(event.target.value); setActiveIndex(-1) }} onFocus={() => setIsFocused(true)} onBlur={(event) => { if (!event.currentTarget.closest('.city-picker')?.contains(event.relatedTarget as Node | null)) setIsFocused(false) }} onKeyDown={handleKeyDown} placeholder="Введите город" aria-label="Ваш город" autoComplete="address-level2" role="combobox" aria-autocomplete="list" aria-expanded={isOpen} aria-controls={isOpen ? listId : undefined} aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined} /></span>
      {isOpen && <span className="city-suggestions" id={listId} role="listbox" aria-label="Варианты городов">{suggestions.length > 0 ? suggestions.map((city, index) => <button key={city.name} id={`${listId}-${index}`} type="button" role="option" aria-selected={index === activeIndex} className={index === activeIndex ? 'active' : ''} onMouseDown={(event) => event.preventDefault()} onClick={() => selectCity(city.name)}><span className="city-suggestion-pin" aria-hidden="true">⌖</span><span><strong>{city.name}</strong><small>{city.region}</small></span></button>) : <span className="city-suggestions-empty">Нет точного совпадения — можно указать город вручную</span>}</span>}
    </div>
  )
}
