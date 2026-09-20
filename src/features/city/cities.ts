export type CitySuggestion = {
  name: string
  region: string
}

export const cities: CitySuggestion[] = [
  { name: 'Москва', region: 'Москва' },
  { name: 'Санкт-Петербург', region: 'Санкт-Петербург' },
  { name: 'Екатеринбург', region: 'Свердловская область' },
  { name: 'Новосибирск', region: 'Новосибирская область' },
  { name: 'Казань', region: 'Республика Татарстан' },
  { name: 'Нижний Новгород', region: 'Нижегородская область' },
  { name: 'Челябинск', region: 'Челябинская область' },
  { name: 'Самара', region: 'Самарская область' },
  { name: 'Омск', region: 'Омская область' },
  { name: 'Ростов-на-Дону', region: 'Ростовская область' },
  { name: 'Уфа', region: 'Республика Башкортостан' },
  { name: 'Красноярск', region: 'Красноярский край' },
  { name: 'Пермь', region: 'Пермский край' },
  { name: 'Воронеж', region: 'Воронежская область' },
  { name: 'Волгоград', region: 'Волгоградская область' },
  { name: 'Краснодар', region: 'Краснодарский край' },
  { name: 'Саратов', region: 'Саратовская область' },
  { name: 'Тюмень', region: 'Тюменская область' },
  { name: 'Ижевск', region: 'Удмуртская Республика' },
  { name: 'Барнаул', region: 'Алтайский край' },
  { name: 'Иркутск', region: 'Иркутская область' },
  { name: 'Хабаровск', region: 'Хабаровский край' },
  { name: 'Ярославль', region: 'Ярославская область' },
  { name: 'Владивосток', region: 'Приморский край' },
  { name: 'Калининград', region: 'Калининградская область' },
  { name: 'Сочи', region: 'Краснодарский край' },
  { name: 'Сургут', region: 'Ханты-Мансийский автономный округ' },
]

function normalize(value: string) {
  return value.trim().toLocaleLowerCase('ru-RU').replaceAll('ё', 'е')
}

export function getCitySuggestions(query: string, limit = 6) {
  const normalizedQuery = normalize(query)
  if (!normalizedQuery) return []

  return cities
    .filter((city) => normalize(`${city.name} ${city.region}`).includes(normalizedQuery))
    .slice(0, limit)
}
