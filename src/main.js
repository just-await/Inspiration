import './style.css'
import { createClient } from '@supabase/supabase-js'

// --- НАСТРОЙКИ ---
const SUPABASE_URL = 'https://brinoaifolxiuyczysfh.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_T_alRtXRkt4EvMghf6eJHw_VI5aIs6b';
const ANIMATION_DURATION = 900; 

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        flowType: 'pkce'
    }
});

// --- ЭЛЕМЕНТЫ DOM ---
const quoteWrapper = document.getElementById('quote-wrapper');
const quoteText = document.getElementById('quote-text');
const quoteAuthor = document.getElementById('quote-author');
const copyHint = document.getElementById('copy-hint'); 
const magicBtn = document.getElementById('magic-btn');
const btnLoader = document.getElementById('btn-loader');
const btnContent = document.getElementById('btn-content');
const particlesContainer = document.getElementById('particles-container');

// Модальное окно цитаты
const addQuoteBtn = document.getElementById('add-quote-btn');
const modalOverlay = document.getElementById('modal-overlay');
const modalContent = document.getElementById('modal-content');
const closeModal = document.getElementById('close-modal');
const quoteForm = document.getElementById('quote-form');
const formStep = document.getElementById('form-step');
const successStep = document.getElementById('success-step');
const inputText = document.getElementById('input-text');
const charCount = document.getElementById('char-count');
const submitBtn = document.getElementById('submit-btn');
const submitLoader = document.getElementById('submit-loader');
const displayAuthorName = document.getElementById('display-author-name');
const addHint = document.getElementById('add-hint');

// Авторизация
const profileBtn = document.getElementById('profile-btn');
const authModalOverlay = document.getElementById('auth-modal-overlay');
const authModalContent = document.getElementById('auth-modal-content');
const closeAuthModalBtn = document.getElementById('close-auth-modal');
const authForm = document.getElementById('auth-form');
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const authNameGroup = document.getElementById('auth-name-group');
const authNameInput = document.getElementById('auth-name');
const authEmailInput = document.getElementById('auth-email');
const authPasswordInput = document.getElementById('auth-password');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const authError = document.getElementById('auth-error');

// Сброс пароля и Google
const forgotPasswordBtn = document.getElementById('forgot-password-btn');
const authPasswordGroup = document.getElementById('auth-password-group');
const authTabs = document.getElementById('auth-tabs');
const authSuccessMsg = document.getElementById('auth-success-msg');
const backToLoginWrapper = document.getElementById('back-to-login-wrapper');
const backToLoginBtn = document.getElementById('back-to-login-btn');
const resetPasswordModal = document.getElementById('reset-password-modal');
const resetPasswordContent = document.getElementById('reset-password-content');
const resetPasswordForm = document.getElementById('reset-password-form');
const newPasswordInput = document.getElementById('new-password-input');
const resetSubmitBtn = document.getElementById('reset-submit-btn');
const googleLoginBtn = document.getElementById('google-login-btn');
const googleAuthGroup = document.getElementById('google-auth-group');

// Окна подтверждений и Toast
const toast = document.getElementById('toast-notification');
const toastMessage = document.getElementById('toast-message');
const toastIcon = document.getElementById('toast-icon');
let toastTimeout;

const logoutModal = document.getElementById('logout-modal');
const logoutModalContent = document.getElementById('logout-modal-content');
const btnCancelLogout = document.getElementById('btn-cancel-logout');
const btnConfirmLogout = document.getElementById('btn-confirm-logout');

const deleteAccountModal = document.getElementById('delete-account-modal');
const deleteAccountContent = document.getElementById('delete-account-content');
const btnCancelDelete = document.getElementById('btn-cancel-delete');
const btnConfirmDelete = document.getElementById('btn-confirm-delete');

// Профиль Drawer & Настройки
const profileDrawer = document.getElementById('profile-drawer');
const profileDrawerOverlay = document.getElementById('profile-drawer-overlay');
const closeProfileBtn = document.getElementById('close-profile-btn');
const profileGreeting = document.getElementById('profile-greeting');
const userQuotesList = document.getElementById('user-quotes-list');
const drawerLogoutBtn = document.getElementById('drawer-logout-btn');
const openSettingsBtn = document.getElementById('open-settings-btn');

const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const changeUsernameForm = document.getElementById('change-username-form');
const settingsUsernameInput = document.getElementById('settings-username-input');
const saveUsernameBtn = document.getElementById('save-username-btn');
const triggerDeleteAccountBtn = document.getElementById('trigger-delete-account-btn');

// --- СОСТОЯНИЕ ---
let currentQuoteObj = { text: "", author: null, id: null };
let nextQuoteObj = null; 
let quoteQueue =[];

let authMode = 'login'; 
let currentUser = null; 
let currentUsername = "Пользователь";

const FALLBACK_QUOTE = {
    text: "Интернет пропал, но твоя сила воли — на месте.",
    author: "Система"
};

let userSessionId = localStorage.getItem('user_session_id');
if (!userSessionId) {
    userSessionId = generateUUID();
    localStorage.setItem('user_session_id', userSessionId);
}

// ==========================================
// КАСТОМНЫЕ УВЕДОМЛЕНИЯ И ОКНА
// ==========================================

function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    toastIcon.textContent = type === 'success' ? '✅' : '❌';
    toast.classList.remove('opacity-0', '-translate-y-4', 'pointer-events-none');
    toast.classList.add('opacity-100', 'translate-y-0');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', '-translate-y-4', 'pointer-events-none');
    }, 3000);
}

// Выход
function openLogoutModal() {
    logoutModal.classList.remove('opacity-0', 'pointer-events-none');
    logoutModalContent.classList.remove('scale-95');
    logoutModalContent.classList.add('scale-100');
}
function closeLogoutModal() {
    logoutModal.classList.add('opacity-0', 'pointer-events-none');
    logoutModalContent.classList.remove('scale-100');
    logoutModalContent.classList.add('scale-95');
}
btnCancelLogout.addEventListener('click', closeLogoutModal);
btnConfirmLogout.addEventListener('click', async () => {
    closeLogoutModal();
    await supabase.auth.signOut();
    showToast("Вы успешно вышли из аккаунта");
});

// Удаление аккаунта
function openDeleteModal() {
    deleteAccountModal.classList.remove('opacity-0', 'pointer-events-none');
    deleteAccountContent.classList.remove('scale-95');
    deleteAccountContent.classList.add('scale-100');
}
function closeDeleteModal() {
    deleteAccountModal.classList.add('opacity-0', 'pointer-events-none');
    deleteAccountContent.classList.remove('scale-100');
    deleteAccountContent.classList.add('scale-95');
}
btnCancelDelete.addEventListener('click', closeDeleteModal);
triggerDeleteAccountBtn.addEventListener('click', openDeleteModal);

btnConfirmDelete.addEventListener('click', async () => {
    btnConfirmDelete.disabled = true;
    btnConfirmDelete.textContent = "Удаление...";
    try {
        const { error } = await supabase.rpc('delete_own_account');
        if (error) throw error;
        
        await supabase.auth.signOut();
        closeDeleteModal();
        closeSettingsModal();
        showToast("Аккаунт успешно удален", "success");
    } catch (err) {
        showToast("Ошибка при удалении: " + err.message, "error");
        btnConfirmDelete.disabled = false;
        btnConfirmDelete.textContent = "Да, удалить навсегда";
    }
});


// ==========================================
// АВТОРИЗАЦИЯ
// ==========================================

supabase.auth.onAuthStateChange((event, session) => {
    // Старый метод (оставляем для надежности)
    if (event === 'PASSWORD_RECOVERY') {
        showResetPasswordModal();
    }

    // НОВЫЙ МЕТОД ДЛЯ PKCE FLOW:
    // Когда Supabase молча нас авторизовал по ссылке, мы проверяем флаг mode=recovery
    if (event === 'SIGNED_IN') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('mode') === 'recovery') {
            // Очищаем URL, чтобы окно не всплывало при обновлении страницы
            window.history.replaceState(null, '', window.location.pathname);
            showResetPasswordModal();
        }
    }

    if (session && session.user) {
        currentUser = session.user;
        profileBtn.classList.add('ring-2', 'ring-green-400');
        
        supabase.from('profiles').select('username').eq('id', currentUser.id).single()
            .then(({data}) => {
                if (data && data.username) {
                    currentUsername = data.username;
                    profileGreeting.textContent = `Привет, ${currentUsername}!`;
                }
            });
    } else {
        currentUser = null;
        currentUsername = "Пользователь";
        profileBtn.classList.remove('ring-2', 'ring-green-400');
        profileGreeting.textContent = `Привет!`;
    }
});

// ОКНО СБРОСА ПАРОЛЯ
function showResetPasswordModal() {
    closeAuthModal();
    resetPasswordModal.classList.remove('hidden');
    setTimeout(() => {
        resetPasswordModal.classList.remove('opacity-0');
        resetPasswordContent.classList.remove('scale-95');
        resetPasswordContent.classList.add('scale-100');
    }, 10);
}

function closeResetPasswordModal() {
    resetPasswordModal.classList.add('opacity-0');
    resetPasswordContent.classList.remove('scale-100');
    resetPasswordContent.classList.add('scale-95');
    setTimeout(() => {
        resetPasswordModal.classList.add('hidden');
        resetPasswordForm.reset();
    }, 300);
}

resetPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    resetSubmitBtn.disabled = true;
    resetSubmitBtn.textContent = "Сохранение...";

    try {
        const newPassword = newPasswordInput.value;
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        
        closeResetPasswordModal();
        showToast("Пароль успешно изменен!", "success");
    } catch (err) {
        showToast("Ошибка: " + err.message, "error");
    } finally {
        resetSubmitBtn.disabled = false;
        resetSubmitBtn.textContent = "Сохранить пароль";
    }
});

// ЛОГИКА ВКЛАДОК
function setAuthMode(mode) {
    authMode = mode;
    authError.classList.add('hidden');
    authSuccessMsg.classList.add('hidden');
    authForm.reset();

    if (mode === 'login') {
        authTabs.classList.remove('hidden');
        googleAuthGroup.classList.remove('hidden');
        tabLogin.classList.replace('border-transparent', 'border-purple-500');
        tabLogin.classList.replace('text-white/40', 'text-white');
        tabRegister.classList.replace('border-purple-500', 'border-transparent');
        tabRegister.classList.replace('text-white', 'text-white/40');
        authNameGroup.classList.add('hidden');
        authNameInput.required = false;
        authPasswordGroup.classList.remove('hidden');
        authPasswordInput.required = true;
        forgotPasswordBtn.classList.remove('hidden');
        backToLoginWrapper.classList.add('hidden');
        authSubmitBtn.textContent = "Войти";

    } else if (mode === 'register') {
        authTabs.classList.remove('hidden');
        googleAuthGroup.classList.remove('hidden');
        tabRegister.classList.replace('border-transparent', 'border-purple-500');
        tabRegister.classList.replace('text-white/40', 'text-white');
        tabLogin.classList.replace('border-purple-500', 'border-transparent');
        tabLogin.classList.replace('text-white', 'text-white/40');
        authNameGroup.classList.remove('hidden');
        authNameInput.required = true;
        authPasswordGroup.classList.remove('hidden');
        authPasswordInput.required = true;
        forgotPasswordBtn.classList.add('hidden');
        backToLoginWrapper.classList.add('hidden');
        authSubmitBtn.textContent = "Зарегистрироваться";

    } else if (mode === 'reset') {
        authTabs.classList.add('hidden');
        googleAuthGroup.classList.add('hidden');
        authNameGroup.classList.add('hidden');
        authNameInput.required = false;
        authPasswordGroup.classList.add('hidden'); 
        authPasswordInput.required = false;
        backToLoginWrapper.classList.remove('hidden');
        authSubmitBtn.textContent = "Отправить ссылку для сброса";
    }
}

tabLogin.addEventListener('click', () => setAuthMode('login'));
tabRegister.addEventListener('click', () => setAuthMode('register'));
forgotPasswordBtn.addEventListener('click', () => setAuthMode('reset'));
backToLoginBtn.addEventListener('click', () => setAuthMode('login'));

// ОБРАБОТКА ВХОДА ЧЕРЕЗ GOOGLE
googleLoginBtn.addEventListener('click', async () => {
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin + window.location.pathname }
        });
        if (error) throw error;
    } catch (err) {
        showToast("Ошибка Google авторизации", 'error');
    }
});

// ОБРАБОТКА ГЛАВНОЙ ФОРМЫ (EMAIL)
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authError.classList.add('hidden');
    authSuccessMsg.classList.add('hidden');
    authSubmitBtn.disabled = true;
    authSubmitBtn.textContent = "Загрузка...";

    const email = authEmailInput.value;
    const password = authPasswordInput.value;
    const name = authNameInput.value;

    try {
        if (authMode === 'login') {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            closeAuthModal();
            showToast("С возвращением!");

        } else if (authMode === 'register') {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { username: name },
                    emailRedirectTo: window.location.origin + window.location.pathname
                }
            });
            if (error) throw error;
            
            authSuccessMsg.textContent = "На вашу почту отправлено письмо. Перейдите по ссылке внутри для подтверждения аккаунта.";
            authSuccessMsg.classList.remove('hidden');
            authForm.reset();

        } else if (authMode === 'reset') {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                // ДОБАВЛЕН ФЛАГ ?mode=recovery СЮДА!
                redirectTo: window.location.origin + window.location.pathname + '?mode=recovery',
            });
            if (error) throw error;

            authSuccessMsg.textContent = "Ссылка для восстановления отправлена на ваш email.";
            authSuccessMsg.classList.remove('hidden');
            authEmailInput.value = '';
        }

    } catch (err) {
        authError.textContent = err.message === "Invalid login credentials" 
            ? "Неверная почта или пароль" 
            : "Ошибка: " + err.message;
        authError.classList.remove('hidden');
    } finally {
        authSubmitBtn.disabled = false;
        if (authMode === 'login') authSubmitBtn.textContent = "Войти";
        if (authMode === 'register') authSubmitBtn.textContent = "Зарегистрироваться";
        if (authMode === 'reset') authSubmitBtn.textContent = "Отправить ссылку для сброса";
    }
});

function openAuthModal() {
    if (currentUser) {
        openProfileDrawer();
        return;
    }
    
    setAuthMode('login');
    authModalOverlay.classList.remove('hidden');
    setTimeout(() => {
        authModalOverlay.classList.remove('opacity-0');
        authModalContent.classList.remove('scale-95');
        authModalContent.classList.add('scale-100');
    }, 10);
}

function closeAuthModal() {
    authModalOverlay.classList.add('opacity-0');
    authModalContent.classList.remove('scale-100');
    authModalContent.classList.add('scale-95');
    setTimeout(() => {
        authModalOverlay.classList.add('hidden');
        authForm.reset();
        authError.classList.add('hidden');
        authSuccessMsg.classList.add('hidden');
    }, 300);
}

profileBtn.addEventListener('click', openAuthModal);
closeAuthModalBtn.addEventListener('click', closeAuthModal);


// --- ФУНКЦИИ ЛИЧНОГО КАБИНЕТА ---
async function loadUserQuotes() {
    userQuotesList.innerHTML = '<div class="text-white/30 text-sm text-center mt-10">Загрузка...</div>';
    
    const { data, error } = await supabase
        .from('quotes')
        .select('text, is_approved, status, rejection_reason')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
        userQuotesList.innerHTML = '<div class="text-white/30 text-sm text-center mt-10">Вы еще не предлагали фразы</div>';
        return;
    }

    userQuotesList.innerHTML = '';
    data.forEach(quote => {
        let statusIcon, statusColor, statusText;
        const currentStatus = quote.status || (quote.is_approved ? 'approved' : 'pending');

        if (currentStatus === 'approved') {
            statusIcon = '✅'; statusColor = 'text-green-400'; statusText = 'Одобрено';
        } else if (currentStatus === 'rejected') {
            statusIcon = '❌'; statusColor = 'text-red-400'; statusText = 'Отклонено';
        } else {
            statusIcon = '⏳'; statusColor = 'text-yellow-400'; statusText = 'На модерации';
        }

        let reasonHtml = '';
        if (currentStatus === 'rejected' && quote.rejection_reason) {
            reasonHtml = `<div class="mt-3 text-xs text-red-200/90 bg-red-500/20 p-2.5 rounded-md border border-red-500/30 leading-relaxed"><b>Причина:</b> ${quote.rejection_reason}</div>`;
        }

        const quoteEl = document.createElement('div');
        quoteEl.className = 'bg-white/5 border border-white/10 rounded-lg p-4 relative flex flex-col w-full overflow-hidden';
        
        quoteEl.innerHTML = `
            <p class="text-white/80 text-sm leading-relaxed mb-3 break-words break-all whitespace-pre-wrap">"${quote.text}"</p>
            <div class="flex items-center justify-between text-xs font-semibold">
                <span class="${statusColor} flex items-center gap-1">${statusIcon} ${statusText}</span>
            </div>
            ${reasonHtml}
        `;
        userQuotesList.appendChild(quoteEl);
    });
}

function openProfileDrawer() {
    profileDrawerOverlay.classList.remove('hidden');
    setTimeout(() => {
        profileDrawerOverlay.classList.remove('opacity-0');
        profileDrawer.classList.remove('translate-x-full');
    }, 10);
    loadUserQuotes();
}

function closeProfileDrawer() {
    profileDrawerOverlay.classList.add('opacity-0');
    profileDrawer.classList.add('translate-x-full');
    setTimeout(() => {
        profileDrawerOverlay.classList.add('hidden');
    }, 300);
}

closeProfileBtn.addEventListener('click', closeProfileDrawer);
profileDrawerOverlay.addEventListener('click', closeProfileDrawer);
drawerLogoutBtn.addEventListener('click', () => {
    closeProfileDrawer();
    openLogoutModal();
});


// ==========================================
// ПОЛНОЭКРАННЫЕ НАСТРОЙКИ ПРОФИЛЯ
// ==========================================

function openSettingsModal() {
    closeProfileDrawer();
    settingsUsernameInput.value = currentUsername;
    settingsModal.classList.remove('hidden');
    setTimeout(() => {
        settingsModal.classList.remove('opacity-0');
    }, 10);
}

function closeSettingsModal() {
    settingsModal.classList.add('opacity-0');
    setTimeout(() => {
        settingsModal.classList.add('hidden');
    }, 300);
}

openSettingsBtn.addEventListener('click', openSettingsModal);
closeSettingsBtn.addEventListener('click', closeSettingsModal);

// Смена Никнейма
changeUsernameForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    saveUsernameBtn.disabled = true;
    saveUsernameBtn.textContent = "...";

    try {
        const newName = settingsUsernameInput.value.trim();
        const { error } = await supabase.from('profiles').update({ username: newName }).eq('id', currentUser.id);
        if (error) throw error;
        
        await supabase.auth.updateUser({ data: { username: newName } });
        currentUsername = newName;
        profileGreeting.textContent = `Привет, ${newName}!`;
        
        showToast("Никнейм успешно изменен!");
    } catch (err) {
        showToast("Ошибка: " + err.message, "error");
    } finally {
        saveUsernameBtn.disabled = false;
        saveUsernameBtn.textContent = "Сохранить";
    }
});


// ==========================================
// МОДАЛКА ДОБАВЛЕНИЯ ЦИТАТЫ
// ==========================================

function openQuoteModal() {
    modalOverlay.classList.remove('hidden');
    setTimeout(() => {
        modalOverlay.classList.remove('opacity-0');
        modalContent.classList.remove('scale-95');
        modalContent.classList.add('scale-100');
    }, 10);
}

function closeQuoteModal() {
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

addQuoteBtn.addEventListener('click', () => {
    if (!currentUser) {
        showToast("Войдите в аккаунт, чтобы предлагать фразы", "error");
        openAuthModal();
        return;
    }
    
    displayAuthorName.textContent = currentUsername;

    openQuoteModal();
    if (addHint) addHint.classList.add('hidden');
});

closeModal.addEventListener('click', closeQuoteModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeQuoteModal();
});

inputText.addEventListener('input', () => {
    const currentLength = inputText.value.length;
    charCount.innerText = `${currentLength}/90`;
    if (currentLength >= 90) charCount.classList.add('text-red-500');
    else charCount.classList.remove('text-red-500');
});

quoteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = inputText.value.trim();
    if (!text) return;

    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = "Отправка...";
    submitLoader.classList.remove('hidden');

    try {
        const quoteData = { 
            text: text, 
            author: currentUsername, 
            session_id: userSessionId,
            user_id: currentUser.id
        };

        const { error } = await supabase.from('quotes').insert([quoteData]);
        if (error) throw error;

        formStep.classList.add('hidden');
        successStep.classList.remove('hidden');
        const botLinkBtn = successStep.querySelector('a');
        botLinkBtn.href = `https://t.me/MyInspoMod_bot?start=${userSessionId}`;
    } catch (err) {
        console.error(err);
        showToast("Ошибка. Попробуйте позже.", 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.querySelector('span').textContent = "Предложить фразу";
        submitLoader.classList.add('hidden');
    }
});


// ==========================================
// ЛОГИКА ОЧЕРЕДИ ЦИТАТ И ИНТЕРФЕЙС
// ==========================================

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
        return false;
    }
}

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
        return fetchOneQuote();
    }
}

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

async function handleGenerate() {
    if (magicBtn.disabled) return;

    magicBtn.disabled = true;
    
    quoteWrapper.classList.remove('fade-in');
    quoteWrapper.classList.add('fade-out');
    quoteAuthor.classList.add('opacity-0', 'translate-y-4');

    const performSwitch = async () => {
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

        fetchOneQuote().then(q => { nextQuoteObj = q; });
    };

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
    }, ANIMATION_DURATION); 
})();

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