interface AboutPageProps {
  isDarkTheme: boolean
  onToggleTheme: () => void
}

const principles = [
  { mark: '⌕', title: 'Сравнивать проще', text: 'Собираем цену, рейтинг магазина, наличие и доставку в одном понятном списке.' },
  { mark: '⌖', title: 'Учитываем ваш город', text: 'Показываем предложения с учётом региона, чтобы цена была ближе к реальной покупке.' },
  { mark: '♡', title: 'Помогаем не торопиться', text: 'Сохраняйте варианты, сравнивайте модели и задавайте цену, которую готовы ждать.' },
]

export function AboutPage({ isDarkTheme, onToggleTheme }: AboutPageProps) {
  return <section className="about-page" aria-labelledby="about-title">
    <button className="theme-button about-theme-button" type="button" aria-label={isDarkTheme ? 'Включить светлую тему' : 'Включить тёмную тему'} aria-pressed={isDarkTheme} onClick={onToggleTheme}>{isDarkTheme ? '☀' : '☾'}</button>
    <header className="about-hero"><span className="overline">Price Hunter · о сервисе</span><h1 id="about-title">Цены без лишнего шума</h1><p>Price Hunter помогает выбирать технику спокойно: находить нужную модель, сравнивать предложения магазинов и понимать, за что вы платите.</p></header>
    <section className="about-intro" aria-label="Что делает Price Hunter"><span aria-hidden="true">PH</span><p>Мы собрали главное для выбора в одном месте: актуальные предложения, рейтинг магазина, наличие, условия доставки и историю цены. Вы решаете, что важнее — минимальная цена, быстрый заказ или конкретный магазин.</p></section>
    <section className="about-principles" aria-label="Принципы сервиса">{principles.map((principle) => <article key={principle.title}><span aria-hidden="true">{principle.mark}</span><h2>{principle.title}</h2><p>{principle.text}</p></article>)}</section>
    <section className="about-note"><span className="overline">Наш подход</span><h2>Помочь принять решение, а не перегрузить выбором.</h2><p>Сервис развивается вместе с каталогом и магазинами. Мы хотим, чтобы перед покупкой техники у вас было достаточно информации для уверенного выбора — без десятков открытых вкладок.</p></section>
  </section>
}
