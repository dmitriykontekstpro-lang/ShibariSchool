







import { Lesson, DictionaryEntry, Article, Product, Course, CatalogCategory, CatalogVideo, HistoryEvent } from './types';

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
    cart: "Корзина",
    articles: "Статьи",
    dictionary: "Словарь",
    navazu: "Навадзу",
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
    account_created: "Аккаунт создан! Проверьте почту для подтверждения."
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
    cart: "Cart",
    articles: "Articles",
    dictionary: "Glossary",
    navazu: "Nawazu",
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
    account_created: "Account created! Check email to verify."
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

// --- INITIAL CATALOG DATA ---

export const INITIAL_CATALOG_CATEGORIES: CatalogCategory[] = [
    {
        id: 'cat_level',
        label: 'Уровень',
        subcategories: [
            { id: 'lvl_new', label: 'Новичкам' },
            { id: 'lvl_cont', label: 'Продолжающим' },
            { id: 'lvl_exp', label: 'Экспертам' },
            { id: 'lvl_pro', label: 'Профи' }
        ]
    },
    {
        id: 'cat_content',
        label: 'Содержимое',
        subcategories: [
            { id: 'cont_prac', label: 'Практика' },
            { id: 'cont_theo', label: 'Теория' }
        ]
    },
    {
        id: 'cat_type',
        label: 'Тип материала',
        subcategories: [
            { id: 'type_lec', label: 'Лекция' },
            { id: 'type_lab', label: 'Лаб' },
            { id: 'type_les', label: 'Урок' },
            { id: 'type_stream', label: 'Стрим' },
            { id: 'type_broadcast', label: 'Трансляция' }
        ]
    },
    {
        id: 'cat_length',
        label: 'Длина',
        subcategories: [
            { id: 'len_short', label: 'Короткий' },
            { id: 'len_med', label: 'Средний' },
            { id: 'len_long', label: 'Длинный' },
            { id: 'len_none', label: 'Нет' }
        ]
    },
    {
        id: 'cat_teacher',
        label: 'Преподаватель',
        subcategories: [
            { id: 'teach_enot', label: 'Енот' },
            { id: 'teach_maria', label: 'Мария' },
            { id: 'teach_anna', label: 'Анна' },
            { id: 'teach_none', label: 'Нет' }
        ]
    },
    {
        id: 'cat_body',
        label: 'Часть тела',
        subcategories: [
            { id: 'body_arms', label: 'Руки' },
            { id: 'body_head', label: 'Голова' },
            { id: 'body_hip', label: 'Бедро' },
            { id: 'body_foot', label: 'Ступня' },
            { id: 'body_hand', label: 'Рука' },
            { id: 'body_torso', label: 'Торс' },
            { id: 'body_chest', label: 'Грудь' },
            { id: 'body_mix', label: 'Микс' },
            { id: 'body_none', label: 'Нет' }
        ]
    },
    {
        id: 'cat_lesson_type',
        label: 'Тип урока',
        subcategories: [
            { id: 'lt_med', label: 'Медицина' },
            { id: 'lt_tie', label: 'Обвязка' },
            { id: 'lt_anat', label: 'Анатомия' },
            { id: 'lt_cert', label: 'Сертификация' }
        ]
    },
    {
        id: 'cat_nawazu',
        label: 'Навадзу',
        subcategories: [
            { id: 'naw_1a', label: '1A-ku' },
            { id: 'naw_1b', label: '1B-ku' },
            { id: 'naw_2a', label: '2A-ku' },
            { id: 'naw_2b', label: '2B-ku' },
            { id: 'naw_none', label: 'Нет' }
        ]
    },
    {
        id: 'cat_tie_name',
        label: 'Обвязка',
        subcategories: [
            { id: 'tie_futo', label: 'Футомомо' },
            { id: 'tie_tk', label: 'ТК' },
            { id: 'tie_agura', label: 'Агура' },
            { id: 'tie_teppo', label: 'Теппо' },
            { id: 'tie_none', label: 'Нет' }
        ]
    },
    {
        id: 'cat_suspension',
        label: 'Подвесы',
        subcategories: [
            { id: 'susp_full', label: 'Подвес' },
            { id: 'susp_floor', label: 'На полу' },
            { id: 'susp_part', label: 'Полуподвес' },
            { id: 'susp_none', label: 'Нет' }
        ]
    }
];

export const INITIAL_CATALOG_VIDEOS: CatalogVideo[] = [
    { 
        id: 1, 
        title: 'Прямой узел', 
        description: 'Основа всех основ.', 
        video_url: 'https://youtu.be/kIhIR9Kl8ZA', 
        category_refs: [{ categoryId: 'cat_level', subcategoryId: 'lvl_new' }]
    },
    { 
        id: 2, 
        title: 'Грудная обвязка', 
        description: 'Классика.', 
        video_url: 'https://youtu.be/kIhIR9Kl8ZA', 
        category_refs: [{ categoryId: 'cat_tie_name', subcategoryId: 'tie_tk' }]
    },
    { 
        id: 3, 
        title: 'Боковой подвес', 
        description: 'Техника безопасности.', 
        video_url: 'https://youtu.be/kIhIR9Kl8ZA', 
        category_refs: [{ categoryId: 'cat_suspension', subcategoryId: 'susp_part' }]
    },
];

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
