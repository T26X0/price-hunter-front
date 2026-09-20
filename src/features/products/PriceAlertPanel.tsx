import { useEffect, useState } from 'react'
import type { PriceAlert } from './priceAlerts'

const formatNumber = new Intl.NumberFormat('ru-RU')

interface PriceAlertPanelProps {
  alert?: PriceAlert
  currentPrice: number
  productName: string
  onSave: (targetPrice: number) => void
}

function suggestedTarget(currentPrice: number) {
  return Math.floor(currentPrice * .95 / 100) * 100
}

export function PriceAlertPanel({ alert, currentPrice, productName, onSave }: PriceAlertPanelProps) {
  const [targetPrice, setTargetPrice] = useState(() => String(alert?.targetPrice || suggestedTarget(currentPrice)))
  const target = Number.parseInt(targetPrice, 10)
  const isValidTarget = Number.isFinite(target) && target > 0 && target < currentPrice

  useEffect(() => {
    setTargetPrice(String(alert?.targetPrice || suggestedTarget(currentPrice)))
  }, [alert?.id, alert?.targetPrice, currentPrice])

  return <section className="price-alert-panel" aria-labelledby="price-alert-title">
    <div className="price-alert-icon" aria-hidden="true">⌁</div>
    <div className="price-alert-copy"><span className="overline">Контроль бюджета</span><h2 id="price-alert-title">Отслеживать цену</h2><p>{alert?.active ? `Уведомление включено: сообщим, когда ${productName} будет стоить ${formatNumber.format(alert.targetPrice)} ₽ или меньше.` : 'Укажите цену, которую готовы заплатить, и не пропустите снижение.'}</p></div>
    <form className="price-alert-form" onSubmit={(event) => { event.preventDefault(); if (isValidTarget) onSave(target) }}>
      <label><span>Целевая цена</span><div><input type="number" min="1" inputMode="numeric" value={targetPrice} onChange={(event) => setTargetPrice(event.target.value)} aria-label="Целевая цена" /><b>₽</b></div></label>
      <button type="submit" disabled={!isValidTarget}>{alert ? 'Обновить цель' : 'Включить'}</button>
      {!isValidTarget && <small>Цена должна быть ниже текущей — {formatNumber.format(currentPrice)} ₽.</small>}
    </form>
    <a href="#alerts" className="price-alert-link">Все уведомления →</a>
  </section>
}
