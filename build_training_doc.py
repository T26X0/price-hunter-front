from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.section import WD_SECTION
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.style import WD_STYLE_TYPE


OUT = "/Users/dmitrijzorin/IdeaProjects/untitled/price-hunter-front/Обучение_Формирование_потребности.docx"

BLUE = "2E74B5"
DARK = "1F4D78"
NAVY = "18344A"
LIGHT = "E8EEF5"
PALE = "F4F6F9"
GOLD = "D79B28"
MUTED = "64748B"
GREEN = "DDEFE5"
RED = "FCE8E6"
WHITE = "FFFFFF"


def set_font(run, size=None, bold=None, italic=None, color=None, name="Calibri"):
    run.font.name = name
    run._element.get_or_add_rPr().rFonts.set(qn("w:ascii"), name)
    run._element.get_or_add_rPr().rFonts.set(qn("w:hAnsi"), name)
    if size is not None:
        run.font.size = Pt(size)
    if bold is not None:
        run.bold = bold
    if italic is not None:
        run.italic = italic
    if color:
        run.font.color.rgb = RGBColor.from_string(color)


def shade(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def cell_margins(cell, top=100, start=130, bottom=100, end=130):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for m, v in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{m}"))
        if node is None:
            node = OxmlElement(f"w:{m}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(v))
        node.set(qn("w:type"), "dxa")


def set_cell_width(cell, dxa):
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_w = tc_pr.find(qn("w:tcW"))
    if tc_w is None:
        tc_w = OxmlElement("w:tcW")
        tc_pr.append(tc_w)
    tc_w.set(qn("w:w"), str(dxa))
    tc_w.set(qn("w:type"), "dxa")


def set_table_geometry(table, widths):
    table.autofit = False
    tbl_pr = table._tbl.tblPr
    tbl_w = tbl_pr.find(qn("w:tblW"))
    if tbl_w is None:
        tbl_w = OxmlElement("w:tblW")
        tbl_pr.append(tbl_w)
    tbl_w.set(qn("w:w"), str(sum(widths)))
    tbl_w.set(qn("w:type"), "dxa")
    tbl_ind = tbl_pr.find(qn("w:tblInd"))
    if tbl_ind is None:
        tbl_ind = OxmlElement("w:tblInd")
        tbl_pr.append(tbl_ind)
    tbl_ind.set(qn("w:w"), "120")
    tbl_ind.set(qn("w:type"), "dxa")
    grid = table._tbl.tblGrid
    for child in list(grid):
        grid.remove(child)
    for width in widths:
        col = OxmlElement("w:gridCol")
        col.set(qn("w:w"), str(width))
        grid.append(col)
    for row in table.rows:
        for idx, cell in enumerate(row.cells):
            set_cell_width(cell, widths[idx])
            cell_margins(cell)
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER


def keep_with_next(paragraph):
    paragraph.paragraph_format.keep_with_next = True


def add_field(paragraph, field):
    run = paragraph.add_run()
    begin = OxmlElement("w:fldChar")
    begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = field
    separate = OxmlElement("w:fldChar")
    separate.set(qn("w:fldCharType"), "separate")
    text = OxmlElement("w:t")
    text.text = "1"
    end = OxmlElement("w:fldChar")
    end.set(qn("w:fldCharType"), "end")
    run._r.extend([begin, instr, separate, text, end])


def add_p(doc, text="", bold=False, italic=False, color=None, size=None, after=6, align=None, style=None):
    p = doc.add_paragraph(style=style)
    p.paragraph_format.space_after = Pt(after)
    if align is not None:
        p.alignment = align
    r = p.add_run(text)
    set_font(r, size=size, bold=bold, italic=italic, color=color)
    return p


def add_bullet(doc, text, level=0):
    style = "List Bullet" if level == 0 else "List Bullet 2"
    p = add_p(doc, text, after=4, style=style)
    p.paragraph_format.line_spacing = 1.25
    return p


def add_number(doc, text):
    p = add_p(doc, text, after=4, style="List Number")
    p.paragraph_format.line_spacing = 1.25
    return p


def add_callout(doc, label, text, fill=PALE, accent=BLUE):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.LEFT
    set_table_geometry(table, [9360])
    c = table.cell(0, 0)
    shade(c, fill)
    p = c.paragraphs[0]
    p.paragraph_format.space_after = Pt(0)
    r = p.add_run(label + " ")
    set_font(r, bold=True, color=accent)
    r = p.add_run(text)
    set_font(r)
    add_p(doc, "", after=2)


def add_step_header(doc, n, title, purpose):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(6)
    keep_with_next(p)
    r = p.add_run(f"ШАГ {n}. ")
    set_font(r, size=14, bold=True, color=GOLD)
    r = p.add_run(title)
    set_font(r, size=14, bold=True, color=DARK)
    add_callout(doc, "Цель:", purpose, fill=LIGHT)


def add_example(doc, text):
    add_callout(doc, "Пример формулировки:", text, fill="FFF8E8", accent="8A5A00")


doc = Document()
sec = doc.sections[0]
sec.top_margin = Inches(1)
sec.bottom_margin = Inches(1)
sec.left_margin = Inches(1)
sec.right_margin = Inches(1)
sec.header_distance = Inches(0.492)
sec.footer_distance = Inches(0.492)

styles = doc.styles
normal = styles["Normal"]
normal.font.name = "Calibri"
normal._element.rPr.rFonts.set(qn("w:ascii"), "Calibri")
normal._element.rPr.rFonts.set(qn("w:hAnsi"), "Calibri")
normal.font.size = Pt(11)
normal.paragraph_format.space_after = Pt(6)
normal.paragraph_format.line_spacing = 1.25

for name, size, color, before, after in [
    ("Heading 1", 16, BLUE, 18, 10),
    ("Heading 2", 13, BLUE, 14, 7),
    ("Heading 3", 12, DARK, 10, 5),
]:
    st = styles[name]
    st.font.name = "Calibri"
    st._element.rPr.rFonts.set(qn("w:ascii"), "Calibri")
    st._element.rPr.rFonts.set(qn("w:hAnsi"), "Calibri")
    st.font.size = Pt(size)
    st.font.bold = True
    st.font.color.rgb = RGBColor.from_string(color)
    st.paragraph_format.space_before = Pt(before)
    st.paragraph_format.space_after = Pt(after)
    st.paragraph_format.keep_with_next = True

for name, left, first in [("List Bullet", 0.375, -0.188), ("List Bullet 2", 0.70, -0.18), ("List Number", 0.375, -0.188)]:
    st = styles[name]
    st.font.name = "Calibri"
    st.font.size = Pt(11)
    st.paragraph_format.left_indent = Inches(left)
    st.paragraph_format.first_line_indent = Inches(first)
    st.paragraph_format.space_after = Pt(4)
    st.paragraph_format.line_spacing = 1.25

# Header/footer
header = sec.header
hp = header.paragraphs[0]
hp.text = "ОБУЧЕНИЕ ОТДЕЛА ПРОДАЖ  |  ФОРМИРОВАНИЕ ПОТРЕБНОСТИ"
hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
for r in hp.runs:
    set_font(r, size=8.5, bold=True, color=MUTED)
footer = sec.footer
fp = footer.paragraphs[0]
fp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
r = fp.add_run("Внутренний учебный материал  •  ")
set_font(r, size=8.5, color=MUTED)
add_field(fp, "PAGE")

# Cover: workshop-style title stack
add_p(doc, "ПРАКТИЧЕСКОЕ ОБУЧЕНИЕ", bold=True, color=GOLD, size=10, after=14)
add_p(doc, "Формирование\nпотребности", bold=True, color=NAVY, size=30, after=8)
add_p(doc, "Продажи продвижения компаний на Яндекс Картах, 2ГИС и Zoon", color=MUTED, size=14, after=24)

metrics = doc.add_table(rows=1, cols=3)
metrics.alignment = WD_TABLE_ALIGNMENT.LEFT
set_table_geometry(metrics, [3120, 3120, 3120])
for i, (top, bottom) in enumerate([
    ("ФОРМАТ", "Лекция + практика"),
    ("РЕЗУЛЬТАТ", "Сотрудник формирует потребность"),
    ("КОНТРОЛЬ", "Ролевая игра ≥ 85%"),
]):
    c = metrics.cell(0, i)
    shade(c, "FFF8E8")
    p = c.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run(top + "\n")
    set_font(r, size=8.5, bold=True, color="8A5A00")
    r = p.add_run(bottom)
    set_font(r, size=10.5, bold=True, color=NAVY)

add_p(doc, "", after=18)
add_callout(doc, "Учебная цель:", "сформировать знание алгоритма формирования потребности и умение применять его в разговоре с ЛПР на основе фактов из карточек компании.", fill=LIGHT)
add_callout(doc, "Критерий результата:", "сотрудник без подсказок объясняет логику этапа и в ролевой игре корректно выполняет не менее 85% действий по чек-листу.", fill=GREEN, accent=DARK)

doc.add_page_break()

doc.add_heading("1. Смысл этапа", level=1)
add_p(doc, "Формирование потребности — это процесс, в котором менеджер помогает клиенту увидеть значимую бизнес-проблему, понять ее последствия и принять решение заняться ею. Менеджер не придумывает проблему: он опирается на факты, найденные при анализе карточек и подтвержденные клиентом в диалоге.")

add_callout(doc, "Переход состояния клиента:", "«Не вижу проблемы / не планировал заниматься» → «Понимаю влияние на клиентов и бизнес» → «Хочу узнать, как это можно исправить». ", fill="EAF3F8")

doc.add_heading("Почему этот этап важен", level=2)
add_bullet(doc, "Без сформированной потребности презентация звучит как перечень услуг и вызывает вопрос: «Зачем мне это?»")
add_bullet(doc, "Осознанная проблема делает ценность решения понятнее и уменьшает сопротивление цене.")
add_bullet(doc, "Клиент сам подтверждает выводы менеджера — это сильнее давления и категоричных обещаний.")

doc.add_heading("Главный принцип", level=2)
add_callout(doc, "Факт → влияние → пример → вопрос → мотивация.", "Каждый вывод должен быть связан с наблюдаемой ситуацией в карточке и поведением потенциального клиента.", fill="FFF8E8", accent="8A5A00")

doc.add_page_break()
doc.add_heading("Алгоритм формирования потребности", level=2)
flow = doc.add_table(rows=5, cols=3)
flow.alignment = WD_TABLE_ALIGNMENT.LEFT
set_table_geometry(flow, [900, 3000, 5460])
headers = ["№", "Этап", "Что должно произойти"]
for i, h in enumerate(headers):
    shade(flow.cell(0, i), LIGHT)
    p = flow.cell(0, i).paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(h)
    set_font(r, bold=True, color=NAVY)
rows = [
    ("1", "Проблема и последствия", "Клиент понимает, какой факт обнаружен и как он влияет на обращения, доверие или выручку."),
    ("2", "Пример из жизни", "Проблема становится наглядной через реальный сценарий выбора компании."),
    ("3", "Отношение к проблеме", "Клиент рассказывает, как работает с вопросом и планирует ли что-то менять."),
    ("4", "Мотивация к действию", "Клиент видит текущий результат, риск ухудшения и путь своего потенциального клиента."),
]
for ri, row in enumerate(rows, 1):
    for ci, txt in enumerate(row):
        p = flow.cell(ri, ci).paragraphs[0]
        if ci == 0:
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(txt)
        set_font(r, bold=(ci == 1))

doc.add_page_break()

add_step_header(doc, "1", "ПРЕЗЕНТАЦИЯ ПРОБЛЕМЫ И ПОСЛЕДСТВИЙ", "показать клиенту наличие конкретной проблемы и объяснить ее влияние на поведение потенциальных клиентов и бизнес.")
doc.add_heading("1.1. Озвучить проблему", level=2)
add_p(doc, "Проблема — это проверяемый факт, обнаруженный при подготовке к звонку. Начинайте с наблюдения, а не с оценки личности или качества бизнеса.")
add_bullet(doc, "не заполнена или неактуальна справочная информация;")
add_bullet(doc, "нет цен, услуг, фотографий, новостей или историй;")
add_bullet(doc, "отзывы остаются без ответов, негатив не обжалуется;")
add_bullet(doc, "карточка находится ниже конкурентов по целевым запросам;")
add_bullet(doc, "низкий рейтинг или недостаточно отзывов для уверенного выбора;")
add_bullet(doc, "информация на Яндекс Картах, 2ГИС и Zoon различается.")

add_example(doc, "«Анна Сергеевна, перед звонком я посмотрел вашу карточку. По запросу “косметология” она находится ниже пятой позиции, а в блоке услуг не указаны цены на основные процедуры». ")

doc.add_heading("1.2. Описать последствия", level=2)
add_p(doc, "Последствия показывают причинно-следственную связь. Не утверждайте, что клиент гарантированно теряет конкретную сумму, если у вас нет подтвержденных данных.")
chains = doc.add_table(rows=6, cols=3)
chains.alignment = WD_TABLE_ALIGNMENT.LEFT
set_table_geometry(chains, [2600, 3380, 3380])
for i, h in enumerate(["Факт", "Что происходит с пользователем", "Возможное последствие для бизнеса"]):
    shade(chains.cell(0, i), LIGHT)
    r = chains.cell(0, i).paragraphs[0].add_run(h)
    set_font(r, bold=True, color=NAVY)
chain_rows = [
    ("Нет цен", "Не понимает, подходит ли стоимость", "Уходит сравнивать конкурентов"),
    ("Слабый фотопоток", "Не может оценить качество и атмосферу", "Меньше доверия и обращений"),
    ("Нет ответов на отзывы", "Не видит вовлеченности компании", "Негатив сильнее влияет на решение"),
    ("Низкая позиция", "Может не дойти до карточки", "Часть спроса забирают компании выше"),
    ("Неактуальные контакты", "Не может связаться или приезжает не вовремя", "Потеря обращения и негативный опыт"),
]
for ri, row in enumerate(chain_rows, 1):
    for ci, txt in enumerate(row):
        r = chains.cell(ri, ci).paragraphs[0].add_run(txt)
        set_font(r)

add_callout(doc, "Формула:", "«Вижу [факт]. Из-за этого потенциальный клиент [реакция]. В результате компания может [бизнес-последствие]». ", fill=PALE)

add_step_header(doc, "2", "ПРИМЕР ИЗ ЖИЗНИ", "сделать проблему понятной и ощутимой через знакомую ситуацию выбора компании.")
add_p(doc, "Пример должен быть коротким, реалистичным и связанным с отраслью клиента. Главный герой — потенциальный покупатель, а не менеджер и не продукт.")

doc.add_heading("Конструктор примера", level=2)
for item in [
    "Возникла потребность: что именно ищет человек?",
    "Открыл карты: какой запрос и в каком радиусе использует?",
    "Сравнил карточки: на что смотрит — позицию, рейтинг, отзывы, фото, цены?",
    "Столкнулся с препятствием в карточке клиента.",
    "Выбрал компанию, где путь оказался проще и доверия больше.",
]:
    add_number(doc, item)

add_example(doc, "«Представьте человека, который ищет косметологию рядом с домом. Он сравнивает первые карточки: рейтинг, фото, цены и свежие отзывы. До вашего профиля он может не дойти, а без стоимости процедуры — выбрать понятную карточку конкурента». ")

doc.add_heading("Правила хорошего примера", level=2)
add_bullet(doc, "не затягивать: 20–40 секунд;")
add_bullet(doc, "не пугать и не обвинять клиента;")
add_bullet(doc, "не выдавать предположение за доказанный факт;")
add_bullet(doc, "заканчивать вопросом: «Насколько вам знакома такая ситуация?»")

add_step_header(doc, "3", "ВЫЯВЛЕНИЕ ОТНОШЕНИЯ К ПРОБЛЕМЕ", "понять, осознает ли клиент проблему, как решает ее сейчас и готов ли что-то менять.")
add_p(doc, "После объяснения остановитесь и задайте вопрос. Если менеджер продолжает говорить без реакции клиента, потребность не формируется — получается монолог.")

questions = doc.add_table(rows=4, cols=3)
questions.alignment = WD_TABLE_ALIGNMENT.LEFT
set_table_geometry(questions, [2200, 3900, 3260])
for i, h in enumerate(["Что выясняем", "Вопрос", "Что слушаем в ответе"]):
    shade(questions.cell(0, i), LIGHT)
    r = questions.cell(0, i).paragraphs[0].add_run(h)
    set_font(r, bold=True, color=NAVY)
qrows = [
    ("Осознание", "«Как сейчас работаете с карточками на геосервисах?»", "Есть ли ответственный, процесс и регулярность"),
    ("Результат", "«Что именно делаете и какой результат получаете?»", "Устраивает ли текущая динамика"),
    ("Готовность", "«Планировали что-то менять в этом направлении?»", "Есть ли намерение и срок"),
]
for ri, row in enumerate(qrows, 1):
    for ci, txt in enumerate(row):
        r = questions.cell(ri, ci).paragraphs[0].add_run(txt)
        set_font(r)

add_callout(doc, "Переход:", "если клиент признает проблему и хочет ее решать — переходите к презентации. Если не видит приоритета — переходите к созданию мотивации.", fill=GREEN, accent=DARK)

add_step_header(doc, "4", "СОЗДАНИЕ МОТИВАЦИИ К ДЕЙСТВИЮ", "усилить желание решить подтвержденную проблему, показав цену текущей ситуации и бездействия.")
add_p(doc, "Мотивация строится в три последовательных блока. Каждый блок опирается на то, что клиент уже рассказал. Не используйте давление, необоснованные прогнозы и гарантированные цифры.")

doc.add_heading("4.1. Результаты работы сейчас", level=2)
add_p(doc, "Соберите в один вывод текущие действия клиента и их результат. На этом этапе мы обрисовываем последствия, которые бизнес уже несет.")
add_example(doc, "«Получается, карточкой вы занимаетесь время от времени, отзывы часто остаются без ответа, а по основным запросам профиль находится ниже конкурентов. Поэтому часть потенциальных клиентов может выбирать компании, которые видит раньше и которым проще доверять». ")

doc.add_heading("4.2. Динамика ухудшения", level=2)
add_p(doc, "Покажите, к чему может привести продолжение текущих действий. Формулируйте прогноз условно и логично: «может», «вероятность», «если динамика сохранится». На этом этапе мы обрисовываем негативную картину в будущем.")
add_example(doc, "«Если ничего не менять, а конкуренты продолжат регулярно обновлять карточки и получать новые отзывы, разрыв в видимости и доверии может увеличиваться. Тогда возвращать позиции и внимание аудитории будет сложнее». ")
add_callout(doc, "Осторожно:", "фраза «через полгода рейтинг точно упадет до 3,9» допустима только при наличии прозрачного расчета. Без данных замените ее на условный сценарий.", fill=RED, accent="9B1C1C")

doc.add_heading("4.3. Путь клиента", level=2)
add_p(doc, "Покажите путь пользователя от возникновения потребности до обращения и объясните, на каких этапах карточка влияет на решение.")

journey = doc.add_table(rows=6, cols=3)
journey.alignment = WD_TABLE_ALIGNMENT.LEFT
set_table_geometry(journey, [2000, 3680, 3680])
for i, h in enumerate(["Этап пути", "Действие пользователя", "Роль карточки"]):
    shade(journey.cell(0, i), LIGHT)
    r = journey.cell(0, i).paragraphs[0].add_run(h)
    set_font(r, bold=True, color=NAVY)
jrows = [
    ("1. Потребность", "Ищет услугу рядом или по району", "Категории и ключевые запросы"),
    ("2. Выдача", "Просматривает первые результаты", "Позиция и привлекательность сниппета"),
    ("3. Сравнение", "Смотрит рейтинг, отзывы, фото, цены", "Полнота, актуальность и доверие"),
    ("4. Проверка", "Читает негатив и ответы компании", "Работа с репутацией"),
    ("5. Действие", "Звонит, строит маршрут, записывается", "Корректные контакты и понятный призыв"),
]
for ri, row in enumerate(jrows, 1):
    for ci, txt in enumerate(row):
        r = journey.cell(ri, ci).paragraphs[0].add_run(txt)
        set_font(r, bold=(ci == 0))

add_p(doc, "", after=1)
add_example(doc, "«Представьте клиента, который ищет шиномонтаж в радиусе трех километров. Сначала он видит выдачу, затем сравнивает несколько карточек, читает свежие отзывы, смотрит фотографии и цены. Если профиль находится ниже и не дает ответа на основные вопросы, шанс перехода и обращения снижается на нескольких этапах сразу. Согласны, что этот путь сейчас стоит упростить?»")

doc.add_heading("5. Готовые связки под типовые проблемы", level=1)
add_p(doc, "Используйте связки как опору, а не как текст для механического чтения. Всегда подставляйте факты конкретной карточки.")

scenarios = [
    ("Низкая позиция", "По запросу «…» карточка находится ниже … позиции", "Пользователь может не дойти до профиля", "Часть обращений может уходить компаниям выше", "Как вы сейчас контролируете позиции по ключевым запросам?"),
    ("Низкий рейтинг", "Рейтинг ниже части ближайших конкурентов", "При сравнении возникает дополнительное сомнение", "Меньше переходов и записей при прочих равных", "Видите влияние рейтинга на обращения?"),
    ("Мало свежих отзывов", "Последние отзывы выходят нерегулярно", "Пользователь не видит свежего подтверждения качества", "Карточка может выглядеть менее актуальной", "Как сейчас получаете обратную связь от клиентов?"),
    ("Нет ответов", "Отзывы остаются без реакции компании", "Негатив читается без позиции бизнеса", "Снижается ощущение вовлеченности", "Кто сейчас отвечает на отзывы и как быстро?"),
    ("Не заполнены услуги и цены", "В карточке нет части услуг или стоимости", "Клиент не может быстро сравнить предложение", "Уходит искать понятный вариант", "Планировали обновить услуги и прайс?"),
    ("Слабый контент", "Мало актуальных фото и публикаций", "Сложнее оценить качество, команду и атмосферу", "Меньше доверия до первого контакта", "Какие материалы обновляете сейчас?"),
]

for title, fact, behavior, impact, question in scenarios:
    if title == "Слабый контент":
        doc.add_page_break()
    doc.add_heading(title, level=2)
    t = doc.add_table(rows=4, cols=2)
    t.alignment = WD_TABLE_ALIGNMENT.LEFT
    set_table_geometry(t, [1800, 7560])
    data = [("Факт", fact), ("Влияние", behavior), ("Последствие", impact), ("Вопрос", question)]
    for ri, (label, val) in enumerate(data):
        shade(t.cell(ri, 0), LIGHT)
        r = t.cell(ri, 0).paragraphs[0].add_run(label)
        set_font(r, bold=True, color=NAVY)
        r = t.cell(ri, 1).paragraphs[0].add_run(val)
        set_font(r)
    add_p(doc, "", after=1)

doc.add_heading("6. Полный речевой модуль", level=1)
add_callout(doc, "Задача:", "связать анализ карточки, последствия, пример и вопросы в естественный диалог продолжительностью 1,5–3 минуты.", fill=LIGHT)

script_parts = [
    ("1. Разрешение", "«Можно коротко поделюсь, что увидел в вашей карточке и как это может влиять на обращения?»"),
    ("2. Факт", "«По запросу “… ” вы сейчас находитесь ниже … позиции. При этом в карточке …»"),
    ("3. Последствие", "«Из-за этого потенциальный клиент может …, и часть обращений может уходить к компаниям, которые видны выше и дают больше информации»."),
    ("4. Пример", "«Представьте человека, который … Он открывает карты, сравнивает … и выбирает …»"),
    ("5. Отношение", "«Как сейчас работаете с этим вопросом? Что делаете и какой результат получаете?»"),
    ("6. Готовность", "«Планировали что-то менять в этом направлении?»"),
    ("7. Мотивация", "«Получается, сейчас … Если ситуация сохранится, … А на пути клиента это влияет на …»"),
    ("8. Контроль", "«Согласны, что этот вопрос стоит решить?» / «Рассказать, как мы можем это выстроить?»"),
]
for label, phrase in script_parts:
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(6)
    r = p.add_run(label + "  ")
    set_font(r, bold=True, color=BLUE)
    r = p.add_run(phrase)
    set_font(r)

doc.add_heading("Ветвление по ответам клиента", level=2)
branches = doc.add_table(rows=5, cols=3)
branches.alignment = WD_TABLE_ALIGNMENT.LEFT
set_table_geometry(branches, [2300, 3500, 3560])
for i, h in enumerate(["Ответ клиента", "Что это означает", "Действие менеджера"]):
    shade(branches.cell(0, i), LIGHT)
    r = branches.cell(0, i).paragraphs[0].add_run(h)
    set_font(r, bold=True, color=NAVY)
brows = [
    ("«Да, работаем»", "Проблема осознана", "Уточнить: что делаете, кто отвечает, какой результат"),
    ("«Нет, не работаем»", "Осознание и готовность неясны", "Спросить, планировали ли заниматься"),
    ("«Да, планировали»", "Потребность сформирована", "Уточнить срок и перейти к презентации"),
    ("«Нет, не планировали»", "Низкий приоритет", "Пройти три блока мотивации и запросить согласие"),
]
for ri, row in enumerate(brows, 1):
    for ci, txt in enumerate(row):
        r = branches.cell(ri, ci).paragraphs[0].add_run(txt)
        set_font(r, bold=(ci == 0))

doc.add_heading("7. Как понять, что цель достигнута", level=1)
add_p(doc, "Этап завершен не тогда, когда менеджер высказал все аргументы, а когда изменилось состояние клиента.")
add_bullet(doc, "клиент подтверждает наличие проблемы: «Да, есть такое», «Согласен»;")
add_bullet(doc, "объясняет, как вопрос решается сейчас и почему результат не устраивает;")
add_bullet(doc, "признает последствия для видимости, доверия или обращений;")
add_bullet(doc, "говорит, что вопрос нужно решать;")
add_bullet(doc, "просит рассказать о решении или согласен перейти к презентации.")

add_callout(doc, "Правильный переход:", "«Тогда расскажу, как мы можем закрыть именно эти точки на Яндекс Картах, 2ГИС и Zoon и какой формат работы подойдет вашей компании». ", fill=GREEN, accent=DARK)

doc.add_heading("Типичные ошибки", level=2)
mistakes = doc.add_table(rows=7, cols=2)
mistakes.alignment = WD_TABLE_ALIGNMENT.LEFT
set_table_geometry(mistakes, [3900, 5460])
for i, h in enumerate(["Ошибка", "Как исправить"]):
    shade(mistakes.cell(0, i), LIGHT)
    r = mistakes.cell(0, i).paragraphs[0].add_run(h)
    set_font(r, bold=True, color=NAVY)
mrows = [
    ("Начать презентацию сразу", "Сначала добиться признания проблемы и желания ее решать"),
    ("Давить и запугивать", "Использовать факты, условные формулировки и вопросы"),
    ("Говорить общими словами", "Показывать конкретный блок карточки и запрос"),
    ("Приписывать точные потери", "Не называть суммы и сроки без данных"),
    ("Долго говорить без паузы", "После каждого смыслового блока получать реакцию"),
    ("Спорить с клиентом", "Уточнять логику и возвращаться к наблюдаемым фактам"),
]
for ri, row in enumerate(mrows, 1):
    for ci, txt in enumerate(row):
        r = mistakes.cell(ri, ci).paragraphs[0].add_run(txt)
        set_font(r)

doc.add_heading("8. План обучающей встречи для тимлида", level=1)
training = doc.add_table(rows=5, cols=5)
training.alignment = WD_TABLE_ALIGNMENT.LEFT
set_table_geometry(training, [1250, 1800, 2500, 2350, 1460])
for i, h in enumerate(["Этап", "Цель", "Действия тимлида", "Действия сотрудника", "Критерий"]):
    shade(training.cell(0, i), LIGHT)
    p = training.cell(0, i).paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(h)
    set_font(r, bold=True, color=NAVY, size=9.5)
trows = [
    ("Расскажу", "Усвоить знание", "Объяснить логику и четыре шага", "Ответить на вопросы", "Может пересказать"),
    ("Покажу", "Увидеть применение", "Продемонстрировать звонок или запись", "Отметить шаги по рамке", "Верно находит этапы"),
    ("Сделаем вместе", "Сформировать умение", "Дать кейс и подсказки", "Провести ролевую игру", "≥ 85% с опорой"),
    ("Сделай сам", "Закрепить навык", "Дать новый кейс, затем ОС", "Провести без подсказок", "≥ 85% самостоятельно"),
]
for ri, row in enumerate(trows, 1):
    for ci, txt in enumerate(row):
        p = training.cell(ri, ci).paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT if ci in (2, 3) else WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(txt)
        set_font(r, size=9.5, bold=(ci == 0))

doc.add_heading("Вопросы на проверку понимания", level=2)
for q in [
    "Что такое сформированная потребность и какое состояние клиента нам нужно получить?",
    "Почему нельзя переходить к презентации сразу после озвучивания проблемы?",
    "Из каких четырех шагов состоит алгоритм?",
    "Чем последствия отличаются от примера из жизни?",
    "Что делать, если клиент говорит, что не планировал заниматься карточками?",
    "Как понять, что этап завершен и пора переходить к презентации?",
]:
    add_bullet(doc, q)

doc.add_heading("Практические кейсы", level=2)
add_bullet(doc, "Косметология: позиция ниже пятой, мало свежих отзывов, цены заполнены частично.")
add_bullet(doc, "Автосервис: график актуален, но нет ответов на негатив и слабый фотопоток.")
add_bullet(doc, "Стоматология: высокий рейтинг, но карточка редко обновляется и услуги на площадках различаются.")
add_p(doc, "Задание: за 3 минуты подготовить связку «факт → влияние → пример → вопросы → мотивация», затем провести ролевую игру.", bold=True, color=DARK, after=8)

doc.add_page_break()

doc.add_heading("9. Чек-лист оценки ролевой игры", level=1)
check = doc.add_table(rows=13, cols=4)
check.alignment = WD_TABLE_ALIGNMENT.LEFT
set_table_geometry(check, [650, 5860, 1250, 1600])
for i, h in enumerate(["№", "Критерий", "Баллы", "Заметки"]):
    shade(check.cell(0, i), LIGHT)
    p = check.cell(0, i).paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(h)
    set_font(r, bold=True, color=NAVY)
criteria = [
    "Начал с конкретного факта из анализа карточки",
    "Связал факт с поведением потенциального клиента",
    "Показал возможное бизнес-последствие без неподтвержденных цифр",
    "Привел короткий и отраслевой пример из жизни",
    "Задал вопрос об осознании проблемы",
    "Уточнил текущие действия и результат",
    "Задал вопрос о готовности решать",
    "При необходимости показал текущий негативный результат",
    "При необходимости показал динамику ухудшения",
    "Объяснил путь клиента",
    "Получил согласие с проблемой",
    "Корректно перешел к презентации",
]
for ri, criterion in enumerate(criteria, 1):
    vals = [str(ri), criterion, "0 / 1", ""]
    for ci, txt in enumerate(vals):
        p = check.cell(ri, ci).paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER if ci in (0, 2) else WD_ALIGN_PARAGRAPH.LEFT
        r = p.add_run(txt)
        set_font(r, size=9.5)

add_p(doc, "Итог: ______ / 12. Целевой результат — не менее 10 баллов (≈ 85%).", bold=True, color=DARK, after=8)
add_callout(doc, "Резюме:", "менеджер формирует потребность тогда, когда помогает клиенту самостоятельно связать состояние карточки с поведением пользователей, последствиями для бизнеса и необходимостью действовать. Только после подтверждения этой связи начинается презентация решения.", fill="EAF3F8")

# Repeat header rows on multi-page tables. Rows remain free to split naturally,
# which avoids large blank pages when a content row is taller than the space left.
for table in doc.tables:
    for idx, row in enumerate(table.rows):
        tr_pr = row._tr.get_or_add_trPr()
        if len(table.rows) == 1:
            cant_split = OxmlElement("w:cantSplit")
            tr_pr.append(cant_split)
        if idx == 0 and len(table.rows) >= 5:
            hdr = OxmlElement("w:tblHeader")
            hdr.set(qn("w:val"), "true")
            tr_pr.append(hdr)

doc.core_properties.title = "Формирование потребности"
doc.core_properties.subject = "Обучение нового менеджера отдела продаж"
doc.core_properties.author = "Отдел продаж"
doc.save(OUT)
print(OUT)
