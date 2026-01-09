// 1. Импортируем стили
import './style.css'

// 2. Импортируем клиент Supabase
import { createClient } from '@supabase/supabase-js'

// --- НАСТРОЙКА SUPABASE ---
// (В идеале ключи хранят в .env файлах, но пока оставим так для простоты)
const SUPABASE_URL = 'https://brinoaifolxiuyczysfh.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_T_alRtXRkt4EvMghf6eJHw_VI5aIs6b';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- ЭЛЕМЕНТЫ DOM ---
const quoteWrapper = document.getElementById('quote-wrapper');
const quoteText = document.getElementById('quote-text');
const quoteAuthor = document.getElementById('quote-author');
const copyHint = document.getElementById('copy-hint'); 
const magicBtn = document.getElementById('magic-btn');
const btnLoader = document.getElementById('btn-loader');
const btnContent = document.getElementById('btn-content');
const particlesContainer = document.getElementById('particles-container');

// Модальное окно
const addQuoteBtn = document.getElementById('add-quote-btn');
const modalOverlay = document.getElementById('modal-overlay');
const modalContent = document.getElementById('modal-content');
const closeModal = document.getElementById('close-modal');
const quoteForm = document.getElementById('quote-form');
const formStep = document.getElementById('form-step');
const successStep = document.getElementById('success-step');
const inputText = document.getElementById('input-text');
const inputAuthor = document.getElementById('input-author');
const charCount = document.getElementById('char-count');
const submitBtn = document.getElementById('submit-btn');
const submitLoader = document.getElementById('submit-loader');
const inputContact = document.getElementById('input-contact');

// Подсказка
const addHint = document.getElementById('add-hint');

// Переменные состояния
let currentQuoteObj = { text: "", author: null, id: null };

// Резервная фраза (на случай если интернета нет вообще)
const FALLBACK_QUOTE = {
    text: "Интернет пропал, но твоя сила воли — на месте.",
    author: "Система"
};

// ... (выше остались импорты и DOM элементы) ...

// --- ЛОГИКА ПАСПОРТА ---
let userSessionId = localStorage.getItem('user_session_id');
if (!userSessionId) {
    userSessionId = generateUUID();
    localStorage.setItem('user_session_id', userSessionId);
}

// --- НОВАЯ ЛОГИКА "КОЛОДА КАРТ" (БЕЗ ПОВТОРОВ) ---

// Очередь ID цитат, которые мы еще не показали
let quoteQueue = []; 

// Функция перемешивания (Fisher-Yates shuffle)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// 1. Заполняем очередь (скачиваем только ID)
async function refillQueue() {
    try {
        // Просим у базы только список номеров (это очень быстро)
        const { data, error } = await supabase.rpc('get_all_quote_ids');
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
            console.warn("В базе нет цитат");
            return false;
        }

        // Превращаем в чистый массив и перемешиваем
        quoteQueue = data; // data это массив чисел [1, 5, 20...]
        shuffleArray(quoteQueue);
        console.log(`Очередь обновлена: ${quoteQueue.length} цитат готовы к показу`);
        return true;

    } catch (e) {
        console.error("Ошибка обновления очереди:", e);
        return false;
    }
}

// 2. Получаем следующую цитату
async function getSmartQuoteObj() {
    // Если очередь пуста, наполняем её заново
    if (quoteQueue.length === 0) {
        const success = await refillQueue();
        if (!success) return FALLBACK_QUOTE; // Если база лежит
    }

    // Достаем последний ID из массива (удаляя его оттуда)
    const nextId = quoteQueue.pop();

    try {
        // Запрашиваем полный текст ОДНОЙ конкретной цитаты по ID
        const { data, error } = await supabase
            .from('quotes')
            .select('*')
            .eq('id', nextId)
            .single();

        if (error || !data) throw error;

        return data;

    } catch (e) {
        console.error("Ошибка загрузки текста цитаты:", e);
        // Если конкретная цитата сломалась, пробуем следующую (рекурсия)
        return getSmartQuoteObj();
    }
}

// ... (ниже функции updateQuote, handleGenerate и т.д. остаются без изменений) ...

function updateQuote(quoteObj) {
    currentQuoteObj = quoteObj;
    quoteText.textContent = quoteObj.text;
    
    if (quoteObj.author) {
        quoteAuthor.textContent = `© ${quoteObj.author}`;
        quoteAuthor.classList.remove('opacity-0', 'translate-y-4');
    } else {
        quoteAuthor.classList.add('opacity-0', 'translate-y-4');
    }

    quoteWrapper.classList.remove('fade-out', 'initial-hidden');
    quoteWrapper.classList.add('fade-in');
    resetCopyHint();
}

function handleGenerate() {
    if (magicBtn.disabled) return;

    magicBtn.disabled = true;
    btnContent.classList.add('hidden');
    btnLoader.classList.remove('hidden');

    quoteWrapper.classList.remove('fade-in');
    quoteWrapper.classList.add('fade-out');
    quoteAuthor.classList.add('opacity-0', 'translate-y-4');

    const transitionHandler = async function(e) {
        if (e.target !== quoteWrapper) return;
        if (e.propertyName !== 'opacity' && e.propertyName !== 'transform') return;

        quoteWrapper.removeEventListener('transitionend', transitionHandler);

        // Запрашиваем новую с сервера
        const newQuote = await getSmartQuoteObj();
        updateQuote(newQuote);
        
        magicBtn.disabled = false;
        btnContent.classList.remove('hidden');
        btnLoader.classList.add('hidden');
    };

    quoteWrapper.addEventListener('transitionend', transitionHandler);
}

// --- ЗАПУСК ---
// 1. СРАЗУ запускаем частицы (не ждем базу)
initParticles();

// 2. СРАЗУ показываем подсказку (не ждем базу)
setTimeout(() => {
    if (addHint) {
        addHint.classList.remove('opacity-0', 'translate-x-4');
    }
}, 500); // Уменьшил задержку до 500мс, чтобы интерфейс ожил быстрее

(async () => {
    // 3. Показываем "Загрузка..." или красивую фразу-заглушку СРАЗУ
    // Это уберет ощущение, что сайт завис
    quoteText.textContent = "Ловим вдохновение...";
    quoteWrapper.classList.remove('fade-out', 'initial-hidden');
    quoteWrapper.classList.add('fade-in');
    
    // 4. Параллельно стучимся в базу
    // (Пользователь пока читает "Ловим вдохновение...", это займет 0.5-1 сек)
    currentQuoteObj = await getSmartQuoteObj();
    
    // 5. Как только база ответила — плавно меняем текст
    // Сначала скрываем заглушку
    quoteWrapper.classList.remove('fade-in');
    quoteWrapper.classList.add('fade-out');

    setTimeout(() => {
        // Меняем текст на настоящий
        quoteText.textContent = currentQuoteObj.text;
        if (currentQuoteObj.author) {
            quoteAuthor.textContent = `© ${currentQuoteObj.author}`;
            quoteAuthor.classList.remove('opacity-0', 'translate-y-4');
        }
        
        // Показываем снова
        quoteWrapper.classList.remove('fade-out');
        quoteWrapper.classList.add('fade-in');
    }, 900); // Ждем пока исчезнет заглушка (время transition в CSS у нас 1s, можно уменьшить до 0.5s для скорости)

})();


// --- ЛОГИКА МОДАЛЬНОГО ОКНА ---
function openModal() {
    modalOverlay.classList.remove('hidden');
    setTimeout(() => {
        modalOverlay.classList.remove('opacity-0');
        modalContent.classList.remove('scale-95');
        modalContent.classList.add('scale-100');
    }, 10);
}

function closeModalFunc() {
    modalOverlay.classList.add('opacity-0');
    modalContent.classList.remove('scale-100');
    modalContent.classList.add('scale-95');
    setTimeout(() => {
        modalOverlay.classList.add('hidden');
        setTimeout(() => {
            formStep.classList.remove('hidden');
            successStep.classList.add('hidden');
            quoteForm.reset();
            charCount.innerText = "0/90";
            charCount.classList.remove('text-red-500');
        }, 300);
    }, 300);
}

inputText.addEventListener('input', () => {
    const currentLength = inputText.value.length;
    charCount.innerText = `${currentLength}/90`;
    if (currentLength >= 90) charCount.classList.add('text-red-500');
    else charCount.classList.remove('text-red-500');
});

quoteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const text = inputText.value.trim();
    const author = inputAuthor.value.trim();
    const contact = inputContact.value.trim().replace('@', '');

    if (!text || !author) return;

    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = "Отправка...";
    submitLoader.classList.remove('hidden');

    try {
        const { error } = await supabase
            .from('quotes')
            .insert([{ text: text, author: author, contact: contact, session_id: userSessionId }]);

        if (error) throw error;

        formStep.classList.add('hidden');
        successStep.classList.remove('hidden');

        const botLinkBtn = successStep.querySelector('a');
        botLinkBtn.href = `https://t.me/MyInspoMod_bot?start=${userSessionId}`;
    } catch (err) {
        console.error('Ошибка отправки:', err);
        alert('Ошибка. Попробуйте позже.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.querySelector('span').textContent = "Предложить фразу";
        submitLoader.classList.add('hidden');
    }
});

addQuoteBtn.addEventListener('click', () => {
    openModal();
    if (addHint) addHint.classList.add('hidden');
});

closeModal.addEventListener('click', closeModalFunc);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModalFunc();
});

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
function resetCopyHint() {
    copyHint.textContent = "нажми чтобы скопировать";
    copyHint.classList.remove('text-green-400', 'tracking-normal');
    copyHint.classList.add('text-white/30', 'tracking-[0.3em]');
}

function handleCopy() {
    if (!currentQuoteObj.text) return;
    const textToCopy = currentQuoteObj.author 
        ? `${currentQuoteObj.text}` 
        : currentQuoteObj.text;

    navigator.clipboard.writeText(textToCopy).then(() => {
        copyHint.textContent = "Скопировано!";
        copyHint.classList.remove('text-white/30', 'tracking-[0.3em]');
        copyHint.classList.add('text-green-400', 'tracking-widest');
        setTimeout(resetCopyHint, 2000);
    });
}

function initParticles() {
    // Если ширина экрана меньше 768px (телефон), делаем 8 частиц. Если ПК — 20.
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 8 : 20;

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        // Немного уменьшим размер частиц на мобилках для скорости
        const sizeBase = isMobile ? 3 : 5; 
        const size = Math.random() * sizeBase + 2;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        // Разная скорость: от 10 до 20 секунд
        particle.style.animationDuration = `${Math.random() * 10 + 10}s`;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        particlesContainer.appendChild(particle);
    }
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Слушатели основных кнопок
magicBtn.addEventListener('click', handleGenerate);
quoteWrapper.addEventListener('click', handleCopy);