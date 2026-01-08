// constants.js больше не нужен!

// --- НАСТРОЙКА SUPABASE ---
const SUPABASE_URL = 'https://brinoaifolxiuyczysfh.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_T_alRtXRkt4EvMghf6eJHw_VI5aIs6b';

// Инициализация
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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

// Логика паспорта (Session ID)
let userSessionId = localStorage.getItem('user_session_id');
if (!userSessionId) {
    userSessionId = generateUUID();
    localStorage.setItem('user_session_id', userSessionId);
}

// --- ФУНКЦИИ ПОЛУЧЕНИЯ ЦИТАТЫ (СЕРВЕРНАЯ ОПТИМИЗАЦИЯ) ---

async function getSmartQuoteObj() {
    try {
        // Вызываем нашу SQL функцию get_random_quote
        const { data, error } = await supabase.rpc('get_random_quote');

        if (error) throw error;
        
        // Если база пустая (чего быть не должно) или ошибка
        if (!data || data.length === 0) {
            console.warn("База пуста?");
            return FALLBACK_QUOTE;
        }

        const newQuote = data[0];

        // Простая защита от повтора подряд (если выпала та же самая)
        if (currentQuoteObj.id && newQuote.id === currentQuoteObj.id) {
            // Пробуем еще раз (рекурсия один раз)
            const retry = await supabase.rpc('get_random_quote');
            if (retry.data && retry.data.length > 0) {
                return retry.data[0];
            }
        }

        return newQuote;

    } catch (e) {
        console.error("Ошибка получения цитаты:", e);
        // Если ошибка сети — показываем резервную
        return FALLBACK_QUOTE;
    }
}

function updateQuote(quoteObj) {
    currentQuoteObj = quoteObj;
    quoteText.textContent = quoteObj.text;
    
    // Если автор "Free Inspiration", можно не показывать (или показывать, как хочешь)
    // Здесь логика: показываем автора всегда, если он есть
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

        // Запрашиваем новую
        const newQuote = await getSmartQuoteObj();
        updateQuote(newQuote);
        
        magicBtn.disabled = false;
        btnContent.classList.remove('hidden');
        btnLoader.classList.add('hidden');
    };

    quoteWrapper.addEventListener('transitionend', transitionHandler);
}

// --- ЗАПУСК ---
initParticles();

(async () => {
    // 1. Показываем подсказку
    setTimeout(() => {
        if (addHint) {
            addHint.classList.remove('opacity-0', 'translate-x-4');
        }
    }, 1500);

    // 2. Получаем первую цитату (сразу из базы!)
    currentQuoteObj = await getSmartQuoteObj();
    
    // 3. Подготавливаем DOM
    quoteText.textContent = currentQuoteObj.text;
    if (currentQuoteObj.author) {
        quoteAuthor.textContent = `© ${currentQuoteObj.author}`;
    }

    // 4. Плавно показываем
    setTimeout(() => {
        updateQuote(currentQuoteObj);
    }, 100);
})();


// --- ЛОГИКА МОДАЛЬНОГО ОКНА И ОТПРАВКИ ---
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

// Клик по кнопке плюс
addQuoteBtn.addEventListener('click', () => {
    openModal();
    if (addHint) addHint.classList.add('hidden');
});

closeModal.addEventListener('click', closeModalFunc);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModalFunc();
});

// Копирование
function resetCopyHint() {
    copyHint.textContent = "нажми чтобы скопировать";
    copyHint.classList.remove('text-green-400', 'tracking-normal');
    copyHint.classList.add('text-white/30', 'tracking-[0.3em]');
}

function handleCopy() {
    if (!currentQuoteObj.text) return;
    const textToCopy = currentQuoteObj.author 
        ? `${currentQuoteObj.text}\n© ${currentQuoteObj.author}` 
        : currentQuoteObj.text;

    navigator.clipboard.writeText(textToCopy).then(() => {
        copyHint.textContent = "Скопировано!";
        copyHint.classList.remove('text-white/30', 'tracking-[0.3em]');
        copyHint.classList.add('text-green-400', 'tracking-widest');
        setTimeout(resetCopyHint, 2000);
    });
}

magicBtn.addEventListener('click', handleGenerate);
quoteWrapper.addEventListener('click', handleCopy);

// Частицы
function initParticles() {
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        const size = Math.random() * 5 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDuration = `${Math.random() * 10 + 10}s`;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        particlesContainer.appendChild(particle);
    }
}

// Генератор UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}