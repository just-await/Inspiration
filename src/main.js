import './style.css'
import { createClient } from '@supabase/supabase-js'

// --- НАСТРОЙКИ ---
const SUPABASE_URL = 'https://brinoaifolxiuyczysfh.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_T_alRtXRkt4EvMghf6eJHw_VI5aIs6b';
// ВАЖНО: Должно совпадать с CSS (0.9s -> 900)
const ANIMATION_DURATION = 900; 

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
const addHint = document.getElementById('add-hint');

// --- СОСТОЯНИЕ ---
let currentQuoteObj = { text: "", author: null, id: null };
let nextQuoteObj = null; 
let quoteQueue = [];

const FALLBACK_QUOTE = {
    text: "Интернет пропал, но твоя сила воли — на месте.",
    author: "Система"
};

// --- ЛОГИКА ПАСПОРТА ---
let userSessionId = localStorage.getItem('user_session_id');
if (!userSessionId) {
    userSessionId = generateUUID();
    localStorage.setItem('user_session_id', userSessionId);
}

// --- ЛОГИКА ОЧЕРЕДИ ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

async function refillQueue() {
    try {
        const { data, error } = await supabase.rpc('get_all_quote_ids');
        if (error) throw error;
        if (!data || data.length === 0) return false;

        quoteQueue = data; 
        shuffleArray(quoteQueue);
        return true;
    } catch (e) {
        console.error("Ошибка очереди:", e);
        return false;
    }
}

// --- ПОЛУЧЕНИЕ ЦИТАТЫ ---
async function fetchOneQuote() {
    if (quoteQueue.length === 0) {
        const success = await refillQueue();
        if (!success) return FALLBACK_QUOTE;
    }

    const nextId = quoteQueue.pop();

    try {
        const { data, error } = await supabase
            .from('quotes')
            .select('*')
            .eq('id', nextId)
            .single();

        if (error || !data) throw error;
        return data;
    } catch (e) {
        console.error("Ошибка загрузки:", e);
        return fetchOneQuote();
    }
}

// --- ОБНОВЛЕНИЕ ИНТЕРФЕЙСА ---
function updateQuoteUI(quoteObj) {
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

// --- ГЛАВНАЯ КНОПКА ---
async function handleGenerate() {
    if (magicBtn.disabled) return;

    magicBtn.disabled = true;
    
    // Анимация исчезновения
    quoteWrapper.classList.remove('fade-in');
    quoteWrapper.classList.add('fade-out');
    quoteAuthor.classList.add('opacity-0', 'translate-y-4');

    const performSwitch = async () => {
        // Если буфер пуст, грузим сейчас
        if (!nextQuoteObj) {
            btnContent.classList.add('hidden');
            btnLoader.classList.remove('hidden');
            nextQuoteObj = await fetchOneQuote();
        }

        const quoteToShow = nextQuoteObj;
        nextQuoteObj = null;

        updateQuoteUI(quoteToShow);

        magicBtn.disabled = false;
        btnContent.classList.remove('hidden');
        btnLoader.classList.add('hidden');

        // Грузим следующую в фоне
        fetchOneQuote().then(q => { nextQuoteObj = q; });
    };

    // Ждем окончания анимации CSS (900мс)
    setTimeout(performSwitch, ANIMATION_DURATION); 
}


// --- ЗАПУСК ---
initParticles();

(async () => {
    setTimeout(() => {
        if (addHint) addHint.classList.remove('opacity-0', 'translate-x-4');
    }, 1500);

    quoteText.textContent = "Ловим вдохновение...";
    quoteWrapper.classList.remove('initial-hidden');
    quoteWrapper.classList.add('fade-in');

    const firstQuote = await fetchOneQuote();
    
    quoteWrapper.classList.remove('fade-in');
    quoteWrapper.classList.add('fade-out');

    setTimeout(() => {
        updateQuoteUI(firstQuote);
        fetchOneQuote().then(q => { nextQuoteObj = q; });
    }, ANIMATION_DURATION); // Используем ту же переменную времени
})();


// --- МОДАЛКА, КОПИРОВАНИЕ И ПРОЧЕЕ ---
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
        console.error(err);
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

function resetCopyHint() {
    copyHint.textContent = "нажми чтобы скопировать";
    copyHint.classList.remove('text-green-400', 'tracking-normal');
    copyHint.classList.add('text-white/30', 'tracking-[0.3em]');
}

function handleCopy() {
    if (!currentQuoteObj.text) return;
    const textToCopy = currentQuoteObj.author ? `${currentQuoteObj.text}\n© ${currentQuoteObj.author}` : currentQuoteObj.text;
    navigator.clipboard.writeText(textToCopy).then(() => {
        copyHint.textContent = "Скопировано!";
        copyHint.classList.remove('text-white/30', 'tracking-[0.3em]');
        copyHint.classList.add('text-green-400', 'tracking-widest');
        setTimeout(resetCopyHint, 2000);
    });
}

function initParticles() {
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 8 : 20;
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        const sizeBase = isMobile ? 3 : 5; 
        const size = Math.random() * sizeBase + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
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

magicBtn.addEventListener('click', handleGenerate);
quoteWrapper.addEventListener('click', handleCopy);