
import { Lesson, DictionaryEntry, Article, Product, Course, CatalogCategory, CatalogVideo, HistoryEvent, KinbakushiNode, KinbakushiEdge, AppEvent } from './types';

// EmailJS Default Configuration (Used for initialization)
export const DEFAULT_EMAILJS_PUBLIC_KEY = 'o38PgmQCq4yaVRdhP';
export const DEFAULT_EMAILJS_SERVICE_ID = 'service_wsjsyxi';
export const DEFAULT_EMAILJS_TEMPLATE_ID = 'template_rwv2q7i';

// --- AI Prompts ---

export const AI_TRANSLATION_SYSTEM_PROMPT = `
### ROLE
You are an expert Shibari (Japanese rope bondage) instructor and professional translator. You are translating video subtitles for an English-speaking audience. Your voice is authoritative yet gentle, clear, and encouraging—like a mentor teaching a hands-on workshop.

### TASK
Translate the provided Russian transcript into natural, fluent American English.

### CRITICAL RULES
1. **Preserve Structure:** Output the EXACT same number of lines/segments as the input. The translation must match the timing of the original speech.
2. **Phonetic Restoration:** The input text often contains Russian transliterations of English terms (e.g., "тикей" = TK, "сингл колонтайн" = Single Column Tie, "фул тикей" = Full TK). You MUST recognize these phonetic matches and convert them back to the correct English terminology. Never translate "тикей" or "decay" literally if the context implies "TK".
3. **Natural Flow:** Use contractions ("I'll", "don't", "it's"). Avoid robotic phrasing.
4. **Anatomy & Safety:**
   - Use "shift" or "move" for soft tissue (e.g., "shift the breast tissue"), NEVER "displace" or "relocate" (too medical).
   - Use "Align" for ropes/spine (e.g., "align the binding").
   - Use "Pecs" or "Pectorals" for muscle; "Breast tissue" for the gland area.

### GLOSSARY (Strict Adherence)
- **ТК / Тикей / Taka Taka / Дикей** -> TK / Takate Kote
- **Full TK / Фул тикей** -> Full TK (Never "Full decay")
- **Обвязка** -> Tie / Binding / Harness
- **Сингл калантай / Сингл / Колонтайн** -> Single Column Tie
- **Столб / Стем** -> Column / Stem
- **Тур** -> Wrap (Upper Wrap / Lower Wrap). *Never "Tour".*
- **Кануки** -> Kanuki
- **Складывание рук** -> Arm positioning
- **По касательной** -> Outwards / Following the natural angle
- **Микроприхват** -> Skin pinch / Pinching
- **Стеснительная веревка** -> "Shy rope" concept
- **Escape узел** -> Escape knot / Safety release
- **Модель** -> Model / Partner

### STYLE GUIDE EXAMPLES
- **Input:** "Делаем вот такое движение." -> **Translation:** "Use this motion."
- **Input:** "Мы вытесняем грудь." -> **Translation:** "We gently shift the breast tissue."
- **Input:** "Он не тянется." -> **Translation:** "It doesn't budge / It holds firm."

### INPUT DATA
`;

export const UI_TRANSLATIONS = {
  ru: {
    shop: "Магазин",
    shop_subtitle: "Веревки, наборы и аксессуары",
    courses: "Курсы",
    courses_subtitle: "Обучающие видеопрограммы",
    catalog: "Каталог",
    catalog_subtitle: "Библиотека видео",
    history: "История",
    history_subtitle: "Путь искусства Шибари",
    kinbakushi: "Мастера",
    kinbakushi_subtitle: "Генеалогия (Influential Bakushis)",
    kinbakushi_controls: "Зум колесиком, перемещение драгом",
    cart: "Корзина",
    articles: "Статьи",
    dictionary: "Словарь",
    navazu: "Навадзу", // Legacy fallback
    events: "Афиша",
    events_subtitle: "Мероприятия и Воркшопы",
    login: "Войти",
    logout: "Выйти",
    register: "Регистрация",
    settings: "Общие настройки",
    course_content: "Содержание курса",
    current_lesson: "Текущий урок",
    add_to_cart: "Добавить в корзину",
    buy_course: "Купить курс",
    details: "Подробнее",
    in_stock: "В наличии",
    faq: "Частые вопросы",
    description: "Описание",
    modules: "Модули курса",
    author: "Автор",
    empty_cart: "Ваша корзина пуста",
    checkout: "Оформить заказ",
    total: "Итого",
    read_more: "Читать",
    locked_module: "Модуль заблокирован",
    login_to_access: "Войдите для доступа",
    user_name: "Имя пользователя",
    country: "Страна",
    city: "Город",
    role: "Роль",
    experience: "Опыт",
    email: "Почта",
    password: "Пароль",
    back: "Назад",
    next: "Далее",
    copyright: "Shibari School © 2023.",
    order_success_title: "Мы получили ваш заказ!",
    order_success_message: "Ссылка на курс отправлена на вашу почту.",
    guest_email_label: "Ваш Email для отправки заказа",
    continue_shopping: "Продолжить покупки",
    invalid_credentials: "Неверный email или пароль. Если вы только что зарегистрировались, проверьте почту для подтверждения аккаунта.",
    auth_error: "Ошибка авторизации",
    account_created: "Аккаунт создан! Проверьте почту для подтверждения.",
    event_location: "Место проведения",
    event_date: "Дата и время",
    event_price: "Стоимость",
    register_event: "Записаться"
  },
  en: {
    shop: "Shop",
    shop_subtitle: "Ropes, kits & accessories",
    courses: "Courses",
    courses_subtitle: "Educational video programs",
    catalog: "Catalog",
    catalog_subtitle: "Video Library",
    history: "History",
    history_subtitle: "The Path of Shibari Art",
    kinbakushi: "Masters",
    kinbakushi_subtitle: "Influential Bakushis Graph",
    kinbakushi_controls: "Scroll to zoom, Drag to move",
    cart: "Cart",
    articles: "Articles",
    dictionary: "Glossary",
    navazu: "Nawazu", // Legacy fallback
    events: "Events",
    events_subtitle: "Workshops & Meetings",
    login: "Sign In",
    logout: "Sign Out",
    register: "Sign Up",
    settings: "Settings",
    course_content: "Course Content",
    current_lesson: "Current Lesson",
    add_to_cart: "Add to Cart",
    buy_course: "Buy Course",
    details: "Details",
    in_stock: "In Stock",
    faq: "FAQ",
    description: "Description",
    modules: "Course Modules",
    author: "Author",
    empty_cart: "Your cart is empty",
    checkout: "Checkout",
    total: "Total",
    read_more: "Read more",
    locked_module: "Module Locked",
    login_to_access: "Login to access",
    user_name: "Username",
    country: "Country",
    city: "City",
    role: "Role",
    experience: "Experience",
    email: "Email",
    password: "Password",
    back: "Back",
    next: "Next",
    copyright: "Shibari School © 2023.",
    order_success_title: "Order Received!",
    order_success_message: "Course link has been sent to your email.",
    guest_email_label: "Your Email for order details",
    continue_shopping: "Continue Shopping",
    invalid_credentials: "Invalid email or password. If you just registered, please verify your email.",
    auth_error: "Authentication Error",
    account_created: "Account created! Check email to verify.",
    event_location: "Location",
    event_date: "Date & Time",
    event_price: "Price",
    register_event: "Register"
  }
};

export const INITIAL_DICTIONARY: DictionaryEntry[] = [
  { term: 'Уке', term_en: 'Uke', definition: 'Принимающая сторона в шибари...', definition_en: 'The receiving side in shibari. The person being tied. From Japanese ukeru — "to receive".' },
  { term: 'Семэ', term_en: 'Seme', definition: 'Связывающая сторона, риггер...', definition_en: 'The tying side, the rigger. The one who creates the rope pattern and leads the session.' },
  { term: 'Кинбаку', term_en: 'Kinbaku', definition: '«Тугое связывание»...', definition_en: '"Tight binding" — Japanese art of bondage emphasizing aesthetics, emotion, and tradition.' },
  { term: 'Шибари', term_en: 'Shibari', definition: 'Искусство связывания...', definition_en: 'The art of tying. Often used synonymously with Kinbaku in modern contexts.' }
];

export const INITIAL_ARTICLES: Article[] = [
  { id: 1, title: 'Философия веревки', title_en: 'Philosophy of Rope', url: '#', description: 'Разбор мифов...', description_en: 'Debunking myths: BDSM vs Japanese Art. Aesthetics vs Fixation.' },
  { id: 2, title: 'Эмоциональная безопасность', title_en: 'Emotional Safety', url: '#', description: 'RACK vs PRICK...', description_en: 'How to discuss boundaries. Safewords and non-verbal signals.' },
  { id: 3, title: 'С чего начать', title_en: 'Where to Start', url: '#', description: 'Соло или с партнером?', description_en: 'Pros and cons of self-suspension vs partner work.' },
  { id: 4, title: 'Этикет', title_en: 'Etiquette', url: '#', description: 'Правила джемов.', description_en: 'How to behave at rope jams. Touching rules.' }
];

const CONTENT_EN_LOREM = [
  "Welcome to this module of Shibari School. Here we will analyze the theoretical foundations and practical aspects of this topic in detail.",
  "It is important to pay attention to details and observe safety precautions. Practice shows that consistent study of the material gives the best results.",
  "In this video lesson, we will look at key knots, ties, and positions that are necessary to master this level.",
  "Do not forget to refer to the glossary for explanations of terms and practice regularly.",
  "The safety of the model and the rigger is our top priority. Always check the condition of ropes and tools before starting a session."
];

const LESSON_TITLES_RU = [
  "Что такое шибари", "Базовая безопасность", "Веревки - как выбрать", "Анатомия",
  "Сингл-коллонтай", "Дабл-коллонтай", "Короткая футо", "Шортики (Хип)",
  "Мини-обвязки", "ТК базовая", "Модификатор к ТК", "Основы ичинавы"
];

const LESSON_TITLES_EN = [
  "What is Shibari", "Basic Safety", "Choosing Ropes", "Anatomy",
  "Single Column Tie", "Double Column Tie", "Futomomo (Short)", "Hip Harness",
  "Mini Ties", "Basic TK (Box Tie)", "TK Modifiers", "Ichinawa Basics"
];

export const INITIAL_LESSONS: Lesson[] = LESSON_TITLES_RU.map((title, i) => {
  const startArticleId = (i * 8) + 1;
  return {
    id: i + 1,
    title: title,
    title_en: LESSON_TITLES_EN[i],
    videoUrl: 'https://youtu.be/kIhIR9Kl8ZA',
    videoUrl_en: 'https://youtu.be/kIhIR9Kl8ZA',
    content: ["Контент урока на русском..."],
    content_en: CONTENT_EN_LOREM,
    relatedArticles: [startArticleId, startArticleId + 1, startArticleId + 2, startArticleId + 3]
  };
});

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    title: "Набор джута 'Start' (3 шт.)",
    title_en: "Jute Starter Kit (3 pcs)",
    color: "Натуральный",
    color_en: "Natural",
    description_short: "Комплект для новичка: 3 веревки по 8 метров.",
    description_short_en: "Beginner set: 3 ropes x 8 meters.",
    description_long: "Полное описание...",
    description_long_en: "Perfect starter kit. Includes 3 ropes, 6mm diameter. Processed and ready to use.",
    price: 45,
    images: ["https://ae-pic-a1.aliexpress-media.com/kf/S495d509b0d07444e90c460039d83ac94b.jpg"],
    faq: [{ question: "Стирка?", answer: "Нет." }]
  },
  {
    id: 2,
    title: "Веревка джутовая (8м)",
    title_en: "Jute Rope (8m)",
    color: "Красный (Akai)",
    color_en: "Red (Akai)",
    description_short: "Окрашенный вручную джут.",
    description_short_en: "Hand-dyed jute. Deep red color.",
    description_long: "Описание...",
    description_long_en: "Single rope 8m. Professional dye, does not stain skin.",
    price: 18,
    images: ["https://ae-pic-a1.aliexpress-media.com/kf/S495d509b0d07444e90c460039d83ac94b.jpg"]
  },
  {
      id: 3,
      title: "Кольцо для подвеса",
      title_en: "Suspension Ring",
      color: "Сталь",
      color_en: "Steel",
      description_short: "Сварное кольцо 15см.",
      description_short_en: "Welded steel ring 15cm.",
      description_long: "...",
      description_long_en: "Reliable steel ring for suspension points.",
      price: 35,
      images: ["https://ae-pic-a1.aliexpress-media.com/kf/S495d509b0d07444e90c460039d83ac94b.jpg"]
  }
];

export const INITIAL_COURSES: Course[] = [
    {
        id: 1,
        title: "Основы Шибари: Интенсив",
        title_en: "Shibari Fundamentals: Intensive",
        author: "Master Kenji",
        description_short: "Полный курс для начинающих. От первого узла до подвеса.",
        description_short_en: "Complete beginner course. From first knot to suspension.",
        description_long: "Этот курс охватывает все базовые аспекты безопасности, анатомии и техники...",
        description_long_en: "This course covers all basic aspects of safety, anatomy and technique...",
        video_url: "https://youtu.be/kIhIR9Kl8ZA",
        image_url: "",
        price: 99,
        modules: [
            "1. Введение и Безопасность",
            "2. Подготовка веревок",
            "3. Одинарная колонна",
            "4. Двойная колонна",
            "5. Базовые обвязки тела",
            "6. Хип-харнесс",
            "7. Грудная обвязка",
            "8. Первый частичный подвес"
        ],
        faq: [
            { question: "Нужен ли партнер?", answer: "Желательно, но можно тренироваться на манекене." }
        ]
    },
    {
        id: 2,
        title: "Флорворк и Эмоции",
        title_en: "Floorwork & Emotions",
        author: "Anna Rope",
        description_short: "Искусство красивого связывания на полу.",
        description_short_en: "The art of beautiful floor bondage.",
        description_long: "Углубленный курс по эстетике и взаимодействию...",
        description_long_en: "In-depth course on aesthetics and interaction...",
        video_url: "https://youtu.be/kIhIR9Kl8ZA",
        image_url: "",
        price: 79,
        modules: [
            "1. Психология взаимодействия",
            "2. Позы на полу",
            "3. Декоративные узлы",
            "4. Динамика в статике",
            "5. Сенсорная депривация",
            "6. Работа с дыханием",
            "7. Последействие (Aftercare)",
            "8. Создание сцены"
        ],
        faq: []
    }
];

export const INITIAL_EVENTS: AppEvent[] = [
    {
        id: 1,
        title: "Веревочный Джем",
        description: "Открытая практика для всех уровней. Приходите со своими веревками или возьмите в аренду на месте. Чай и печеньки включены.",
        date: "2024-10-24",
        time: "19:00",
        location: "Москва, Студия 'Узел', ул. Ленина 10",
        image_url: "https://images.unsplash.com/photo-1576615278693-f7253b272714?auto=format&fit=crop&q=80&w=800",
        price: "500 руб",
        registration_url: "#"
    },
    {
        id: 2,
        title: "Мастер-класс: Подвесы",
        description: "Продвинутый воркшоп по технике безопасности в подвесах. Только для пар с опытом.",
        date: "2024-11-05",
        time: "12:00",
        location: "Санкт-Петербург, Лофт Проект",
        image_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800",
        price: "5000 руб",
        registration_url: "#"
    }
];

export const INITIAL_CATALOG_CATEGORIES: CatalogCategory[] = [];
export const INITIAL_CATALOG_VIDEOS: CatalogVideo[] = [];
export const APP_LOGO_URL = "https://cqpqyhehoiybggjuljzn.supabase.co/storage/v1/object/public/Enot/raccoon_logo.png";
export const INITIAL_HISTORY: HistoryEvent[] = [
  {
    id: 1,
    date_display: "1400-1600",
    title_ru: "Ходзёдзюцу",
    title_en: "Hojojutsu",
    description_ru: "Воинское искусство связывания пленников самураями. Использовалось для конвоирования, допроса и демонстрации статуса пленника.",
    description_en: "The martial art of restraining prisoners by samurai. Used for transport, interrogation, and displaying the prisoner's status.",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Hojojutsu.jpg/440px-Hojojutsu.jpg"
  },
  {
    id: 2,
    date_display: "1900-1940",
    title_ru: "Эпоха Ито Сейу",
    title_en: "Ito Seiu Era",
    description_ru: "Трансформация из боевого искусства в эротическое. Ито Сейу, 'отец современного кинбаку', популяризирует связывание через провокационные фотографии и истории.",
    description_en: "Transformation from martial art to erotic form. Ito Seiu, the 'father of modern Kinbaku', popularizes bondage through provocative photography and stories.",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/2/23/Ito_Seiyu_Binding.jpg"
  },
  {
    id: 3,
    date_display: "1950s",
    title_ru: "Нукибори",
    title_en: "Nukibori",
    description_ru: "Послевоенная Япония. Расцвет журналов 'Kitan Club'. Популяризация эстетики связывания без подвеса.",
    description_en: "Post-war Japan. The rise of 'Kitan Club' magazines. Popularization of non-suspension bondage aesthetics.",
    image_url: ""
  },
  {
    id: 4,
    date_display: "1970-1990",
    title_ru: "Новая Волна",
    title_en: "New Wave Masters",
    description_ru: "Мастера (Акечи, Нуреки) совершенствуют технику. Появляются сложные геометрические подвесы.",
    description_en: "Masters like Akechi and Nureki refine the technique. Complex geometric suspensions emerge.",
    image_url: ""
  },
  {
    id: 5,
    date_display: "2000s",
    title_ru: "Глобализация",
    title_en: "Globalization",
    description_ru: "Шибари выходит за пределы Японии. Интернет способствует распространению знаний. Появляются школы в Европе и США.",
    description_en: "Shibari expands beyond Japan. The internet facilitates the spread of knowledge. Schools appear in Europe and the USA.",
    image_url: ""
  },
  {
    id: 6,
    date_display: "2024",
    title_ru: "Современность",
    title_en: "Modern Era",
    description_ru: "Шибари как практика осознанности, искусство и соматическая терапия.",
    description_en: "Shibari as mindfulness, art, and somatic therapy.",
    image_url: ""
  }
];

// --- KINBAKUSHI DATA (Derived from JSON) ---

export const INITIAL_KINBAKUSHI_NODES: KinbakushiNode[] = [
  // --- PRE-1800 / 1800s (Top Layer) ---
  { id: 'hojojutsu', label: 'Hojōjutsu', type: 'concept', era: 'Pre-1800', x: 200, y: 50 },
  { id: 'ukiyo_e', label: 'Ukiyo-e / Shunga', type: 'concept', era: 'Pre-1800', x: 500, y: 50 },
  { id: 'kabuki', label: 'Kabuki', type: 'concept', era: 'Pre-1800', x: 800, y: 50 },
  { id: 'edo_torture', label: 'Edo Torture', type: 'era_context', era: '1600-1868', x: 350, y: 100 },
  
  { id: 'tsukioka_yoshitoshi', label: 'Tsukioka Yoshitoshi', dates: '1839-1892', role: 'Ukiyo-E Master', era: '1800s', x: 500, y: 150 },
  { id: 'lonely_house', label: 'Lonely House (1885)', date: '1885', type: 'work', category: 'Fundamental work', x: 650, y: 200 },

  // --- 1900s - 1950s (Founders) ---
  { id: 'seiu_itou', label: 'Seiu Itou', dates: '1882-1961', role: 'Painter, writer', era: '1900s', x: 500, y: 300 },
  { id: 'seiu_suspension', label: 'Seiu 1919 photo', date: '1919', type: 'work', category: 'Fundamental work', x: 350, y: 320 },
  
  { id: 'nawa_yumio', label: 'Nawa Yumio', dates: '1912-2006', role: 'Martial artist', era: '1950s', x: 300, y: 450 },
  { id: 'toshiyuki_suma', label: 'Toshiyuki Suma', dates: '1920-1992', role: 'Writer', era: '1950s', x: 700, y: 450 },
  { id: 'takashi_tsujimura', label: 'Takashi Tsujimura', dates: '1921-1987', era: '1950s', x: 100, y: 450 },
  
  { id: 'ten_positions', label: 'Ten positions (1952)', author: 'Reiko Kita', date: '1952', type: 'work', category: 'Fundamental work', x: 850, y: 450 },
  { id: 'kitan_club', label: 'Kitan Club', dates: '1952-1975', type: 'magazine', era: '1950s', x: 500, y: 400 },
  { id: 'uramado', label: 'Uramado', dates: '1956-1965', type: 'magazine', era: '1950s', x: 600, y: 500 },
  { id: 'chimuo_nureki', label: 'Chimuo Nureki', dates: '1930-2013', era: '1950s', x: 500, y: 550 },

  // --- 1970s - 1980s (Golden Age & Media) ---
  { id: 'oniroku_dan', label: 'Oniroku Dan', dates: '1931-2011', role: 'Writer', era: '1950s-1980s', x: 800, y: 550 },
  { id: 'hana_to_hebi', label: 'Hana to Hebi', type: 'work', category: 'Book/Film', x: 950, y: 550 },
  { id: 'oni_pro', label: 'Oni Pro', dates: '1969-1974', type: 'group', era: '1970s', x: 800, y: 650 },
  { id: 'pink_films', label: 'Pink Films', dates: '1971-1988', type: 'genre/studio', icon: 'film_strip', era: '1970s', x: 950, y: 650 },
  { id: 'hiroshi_urado', label: 'Hiroshi Urado', dates: '1933', era: '1970s', x: 900, y: 700 },
  
  { id: 'eikichi_osada', label: 'Eikichi Osada', dates: '1925-2001', era: '1970s', x: 100, y: 600 },
  { id: 'hayakawa_yoshikazu', label: 'Hayakawa Yoshikazu', dates: 'b.1949', era: '1970s', x: 250, y: 600 },
  
  { id: 'sm_sniper', label: 'S&M Sniper', dates: '1979-2009', type: 'magazine', era: '1980s', x: 200, y: 700 },
  { id: 'eizo_chiba', label: 'Eizo Chiba', type: 'person', notes: 'Tanbikai', x: 200, y: 500 },
  
  { id: 'nobuyoshi_araki', label: 'Nobuyoshi Araki', dates: 'b.1940', role: 'Photographer', era: '1980s', x: 950, y: 800 },
  { id: 'sakurada_denjiro', label: 'Sakurada Denjiro', dates: 'b.1952', era: '1980s', x: 500, y: 700 },
  { id: 'theatre_poo', label: 'Theatre Poo', dates: '1983-2019', type: 'place', era: '1980s', x: 600, y: 700 },
  { id: 'kinbiken', label: 'Kinbiken', dates: '1985-2009', type: 'place', era: '1980s', x: 400, y: 700 },
  
  { id: 'masato_marai', label: 'Masato Marai', dates: 'b.1956', era: '1980s', x: 100, y: 700 },
  { id: 'norio_sugiura', label: 'Norio Sugiura', dates: 'b.1942', role: 'Photographer', era: '1980s', x: 950, y: 900 },
  { id: 'haruki_yukimura', label: 'Haruki Yukimura', dates: '1948-2016', era: '1980s', x: 300, y: 700 },
  { id: 'jouen', label: 'Jouen (Minomura Kou)', date: '1989', type: 'work', category: 'Video/Book', x: 800, y: 850 },

  // --- 1990s ---
  { id: 'takumi_miura', label: 'Takumi Miura', dates: '1967-2021', era: '1990s', x: 400, y: 800 },
  { id: 'baku_yu_kai', label: 'Baku Yu Kai', date: '1996', type: 'place', era: '1990s', x: 500, y: 800 },
  { id: 'denki_akechi', label: 'Denki Akechi', dates: '1940-2005', era: '1990s', x: 600, y: 800 },
  { id: 'saikatsu', label: 'Saikatsu', dates: '1940-2024', era: '1990s', x: 700, y: 800 },
  
  { id: 'naka_akira', label: 'Naka Akira', dates: 'b.1959', era: '1990s', x: 400, y: 900 },
  { id: 'shigonawa_bingo', label: 'Shigonawa Bingo', dates: 'b.1963', era: '1990s', x: 300, y: 900 },
  { id: 'go_arisue', label: 'Go Arisue', dates: 'b.1954', era: '1990s', x: 200, y: 800 },
  { id: 'mai_randa', label: 'Mai Randa', dates: '1959-2022', era: '1990s', x: 150, y: 900 },
  { id: 'yoi_yoshida', label: 'Yoi Yoshida', role: 'Manga books', era: '1990s', x: 250, y: 900 },
  { id: 'ranki_kazami', label: 'Ranki Kazami', dates: 'b.1962', role: 'Manuals', era: '1990s', x: 150, y: 1000 },

  // --- 2000s / Current ---
  { id: 'ren_yagami', label: 'Ren Yagami', dates: 'b.1984', era: '2000s', x: 700, y: 1000 },
  { id: 'tenma_haru', label: 'Tenma Haru', dates: 'b.1975', era: '2000s', x: 750, y: 1100 },
  { id: 'akechi_kanna', label: 'Akechi Kanna', dates: 'b.1972', era: '2000s', x: 600, y: 950 },
  { id: 'hajime_kinoko', label: 'Hajime Kinoko', dates: 'b.1977', era: '2000s', x: 650, y: 1050 },
  { id: 'kasumi_hourai', label: 'Kasumi Hourai', dates: 'b.1980', era: '2000s', x: 600, y: 1150 },
  { id: 'riccardo_wildties', label: 'Riccardo Wildties', dates: 'b.1976', role: 'Ichiban Deshi', era: '2000s', x: 450, y: 1050 },
  { id: 'naoko', label: 'Naoko', role: 'Deshi', era: '2000s', x: 350, y: 1050 },
  { id: 'student_ody', label: 'Student Odyu', dates: 'b.1983', era: '2000s', x: 500, y: 1200 }, // Not in edges but in nodes
  
  { id: 'osada_steve', label: 'Osada Steve', dates: 'b.?', era: '2000s', x: 100, y: 800 },
  { id: 'osada_kazumi', label: 'Osada Kazumi', dates: 'b.?', era: '2000s', x: 0, y: 800 },
  
  { id: 'bar_mitsu', label: 'Bar Mitsu', type: 'place', era: '2000s', x: 400, y: 1150 },
  { id: 'bar_ubu', label: 'Bar UBU', type: 'place', era: '2000s', x: 300, y: 1150 },
  { id: 'six_studio', label: 'Six studio', type: 'place', era: '2000s', x: 100, y: 900 }
];

export const INITIAL_KINBAKUSHI_EDGES: KinbakushiEdge[] = [
  // Roots
  { source: 'hojojutsu', target: 'tsukioka_yoshitoshi', type: 'important_influence' },
  { source: 'ukiyo_e', target: 'tsukioka_yoshitoshi', type: 'important_influence' },
  { source: 'tsukioka_yoshitoshi', target: 'lonely_house', type: 'work_published' },
  { source: 'tsukioka_yoshitoshi', target: 'seiu_itou', type: 'important_influence' },
  { source: 'edo_torture', target: 'seiu_itou', type: 'important_influence' },
  
  // Founders
  { source: 'seiu_itou', target: 'seiu_suspension', type: 'work_published' },
  { source: 'seiu_itou', target: 'nawa_yumio', type: 'direct_relationship' },
  { source: 'seiu_itou', target: 'toshiyuki_suma', type: 'direct_relationship' },
  { source: 'toshiyuki_suma', target: 'ten_positions', type: 'work_published' },
  { source: 'toshiyuki_suma', target: 'kitan_club', type: 'work_published' },
  
  // Kitan Club Nexus
  { source: 'eizo_chiba', target: 'kitan_club', type: 'work_published' },
  { source: 'takashi_tsujimura', target: 'kitan_club', type: 'work_published' },
  { source: 'nawa_yumio', target: 'kitan_club', type: 'work_published' },
  
  // Oniroku & Media
  { source: 'nawa_yumio', target: 'oniroku_dan', type: 'direct_relationship' },
  { source: 'oniroku_dan', target: 'uramado', type: 'direct_relationship' },
  { source: 'oniroku_dan', target: 'chimuo_nureki', type: 'direct_relationship' },
  { source: 'oniroku_dan', target: 'oni_pro', type: 'work_published' },
  { source: 'oniroku_dan', target: 'hana_to_hebi', type: 'work_published' },
  { source: 'oniroku_dan', target: 'pink_films', type: 'work_published' },
  { source: 'oniroku_dan', target: 'sm_sniper', type: 'work_published' },
  { source: 'hiroshi_urado', target: 'oni_pro', type: 'direct_relationship' },
  
  // Main Lineage Continued
  { source: 'chimuo_nureki', target: 'sakurada_denjiro', type: 'direct_relationship' },
  { source: 'sakurada_denjiro', target: 'theatre_poo', type: 'work_published' },
  { source: 'sakurada_denjiro', target: 'kinbiken', type: 'work_published' },
  
  // Kinbiken / Naka Lineage
  { source: 'kinbiken', target: 'naka_akira', type: 'direct_relationship' },
  { source: 'naka_akira', target: 'riccardo_wildties', type: 'direct_relationship', label: 'Ichiban Deshi' },
  { source: 'naka_akira', target: 'naoko', type: 'direct_relationship', label: 'Deshi' },
  { source: 'naka_akira', target: 'bar_mitsu', type: 'work_published' },
  { source: 'naka_akira', target: 'shigonawa_bingo', type: 'direct_relationship' },
  { source: 'shigonawa_bingo', target: 'bar_ubu', type: 'work_published' },
  
  // Arisue Branch
  { source: 'go_arisue', target: 'yoi_yoshida', type: 'direct_relationship' },
  { source: 'go_arisue', target: 'mai_randa', type: 'direct_relationship' },
  { source: 'mai_randa', target: 'ranki_kazami', type: 'direct_relationship' },
  
  // Osada Branch
  { source: 'eikichi_osada', target: 'sm_sniper', type: 'work_published' },
  { source: 'eikichi_osada', target: 'osada_kazumi', type: 'direct_relationship' },
  { source: 'eikichi_osada', target: 'osada_steve', type: 'direct_relationship' },
  { source: 'osada_steve', target: 'six_studio', type: 'work_published' },
  
  // S&M Sniper Contributors
  { source: 'hayakawa_yoshikazu', target: 'sm_sniper', type: 'work_published' },
  { source: 'masato_marai', target: 'sm_sniper', type: 'work_published' },
  { source: 'haruki_yukimura', target: 'sm_sniper', type: 'work_published' },
  
  // Others
  { source: 'norio_sugiura', target: 'jouen', type: 'work_published' },
  { source: 'takumi_miura', target: 'baku_yu_kai', type: 'work_published' },
  
  // Akechi Lineage
  { source: 'denki_akechi', target: 'baku_yu_kai', type: 'work_published' },
  { source: 'denki_akechi', target: 'akechi_kanna', type: 'direct_relationship' },
  { source: 'akechi_kanna', target: 'ren_yagami', type: 'direct_relationship' },
  { source: 'akechi_kanna', target: 'hajime_kinoko', type: 'direct_relationship' },
  
  // Kinoko Lineage
  { source: 'hajime_kinoko', target: 'kasumi_hourai', type: 'direct_relationship' },
  { source: 'hajime_kinoko', target: 'tenma_haru', type: 'direct_relationship' },
  { source: 'hajime_kinoko', target: 'ren_yagami', type: 'direct_relationship' }, // Shared student
  { source: 'ren_yagami', target: 'tenma_haru', type: 'direct_relationship' }
];
