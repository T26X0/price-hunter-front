import type { PriceAlert } from './priceAlerts'

const formatNumber = new Intl.NumberFormat('ru-RU')
const formatDate = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })

interface AlertsPageProps {
  alerts: PriceAlert[]
  isDarkTheme: boolean
  onToggleTheme: () => void
  onToggleAlert: (id: string) => void
  onRemoveAlert: (id: string) => void
  onOpenProduct: (sku: string) => void
}

export function AlertsPage({ alerts, isDarkTheme, onToggleTheme, onToggleAlert, onRemoveAlert, onOpenProduct }: AlertsPageProps) {
  const activeAlerts = alerts.filter((alert) => alert.active).length

  return <section className="alerts-page" aria-labelledby="alerts-title">
    <button className="theme-button alerts-theme-button" type="button" aria-label={isDarkTheme ? 'Включить светлую тему' : 'Включить тёмную тему'} aria-pressed={isDarkTheme} onClick={onToggleTheme}>{isDarkTheme ? '☀' : '☾'}</button>
    <header className="alerts-page-header"><div><span className="overline">Price Hunter · контроль цены</span><h1 id="alerts-title">Уведомления</h1><p>{alerts.length ? `Активно ${activeAlerts} ${activeAlerts === 1 ? 'уведомление' : activeAlerts < 5 ? 'уведомления' : 'уведомлений'}. Цели сохранены в этом браузере.` : 'Здесь появятся товары, цену которых вы решили отслеживать.'}</p></div>{alerts.length > 0 && <span className="alerts-count">{activeAlerts} активно</span>}</header>
    {alerts.length === 0 ? <section className="alerts-empty"><span aria-hidden="true">⌁</span><h2>Пока нет целей по цене</h2><p>Откройте товар, задайте желаемую цену — и мы добавим его сюда.</p><a href="#catalog">Открыть каталог →</a></section> : <div className="alerts-grid">{alerts.map((alert) => <article className={`alert-card${alert.active ? '' : ' paused'}`} key={alert.id}><div className="alert-card-top"><span className={alert.active ? 'alert-status active' : 'alert-status'}>{alert.active ? 'Отслеживается' : 'На паузе'}</span><button className="alert-remove" type="button" onClick={() => onRemoveAlert(alert.id)} aria-label={`Удалить уведомление для ${alert.productName}`}>×</button></div><button className="alert-product" type="button" onClick={() => onOpenProduct(alert.sku)}><span className="alert-product-visual" aria-hidden="true">▯</span><span><strong>{alert.productName}</strong><small>⌖ {alert.city || 'Город не выбран'}</small></span></button><div className="alert-target"><span>Сообщить при цене</span><strong>до {formatNumber.format(alert.targetPrice)} ₽</strong></div><footer><small>Создано {formatDate.format(new Date(alert.createdAt))}</small><button type="button" onClick={() => onToggleAlert(alert.id)}>{alert.active ? 'Поставить на паузу' : 'Включить'}</button></footer></article>)}</div>}
  </section>
}
