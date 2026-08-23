export interface StoreBrand {
  label: string
  tone: string
}

const storeBrands: Record<string, StoreBrand> = {
  'М.Видео': { label: 'M.', tone: 'mvideo' },
  'Ситилинк': { label: 'C', tone: 'citilink' },
  Ozon: { label: 'O', tone: 'ozon' },
  'Яндекс Маркет': { label: 'Я', tone: 'yandex-market' },
  DNS: { label: 'DNS', tone: 'dns' },
  'restore:': { label: 're', tone: 'restore' },
  'Эльдорадо': { label: 'Э', tone: 'eldorado' },
}

export function storeBrandFor(store: string): StoreBrand {
  return storeBrands[store] || { label: store.slice(0, 1), tone: 'default' }
}
