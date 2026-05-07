import './style.css'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://brinoaifolxiuyczysfh.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_T_alRtXRkt4EvMghf6eJHw_VI5aIs6b';
const ANIMATION_DURATION = 900; 

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { flowType: 'pkce' }
});

const CATEGORIES = {
    'all': 'Всё подряд',
    'motivation': '🔥 Мотивация',
    'humor': '😂 Юмор',
    'wisdom': '🦉 Мудрость',
    'absurd': '🤪 Абсурд',
    'love': '❤️ Любовь',
    'media': '🎬 Из медиа',
    'thoughts': '💭 Мысли вслух'
};

const CATEGORY_DESCRIPTIONS = {
    'thoughts': 'Ваши личные инсайты и наблюдения за миром.',
    'motivation': 'Фразы, заставляющие встать с дивана и действовать.',
    'humor': 'Потому что без смеха в этом мире не выжить.',
    'wisdom': 'Глубокие философские мысли, проверенные временем.',
    'absurd': 'Волк не тигр, но в цирке не выступает. Постирония и дичь.',
    'love': 'О самом главном, нежном и разбивающем сердце.',
    'media': 'Легендарные строчки из кино, сериалов и книг.'
};

const quoteWrapper = document.getElementById('quote-wrapper');
const quoteText = document.getElementById('quote-text');
const quoteAuthor = document.getElementById('quote-author');
const copyHint = document.getElementById('copy-hint'); 
const magicBtn = document.getElementById('magic-btn');
const btnLoader = document.getElementById('btn-loader');
const btnContent = document.getElementById('btn-content');
const particlesContainer = document.getElementById('particles-container');

// Элементы Лайков и Мета
const quoteMetaRow = document.getElementById('quote-meta-row');
const likeBtn = document.getElementById('like-btn');
const likeIcon = document.getElementById('like-icon');
const likeCountEl = document.getElementById('like-count');
const saveBtn = document.getElementById('save-btn');

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
const closeSuccessBtn = document.getElementById('close-success-btn');

// Категории и внешний автор
const inputCategory = document.getElementById('input-category');
const categoryDescText = document.getElementById('category-desc-text');
const isExternalAuthorCheckbox = document.getElementById('is-external-author');
const defaultAuthorBlock = document.getElementById('default-author-block');
const customAuthorBlock = document.getElementById('custom-author-block');
const inputCustomAuthor = document.getElementById('input-custom-author');

// Фильтр на главной
const openFilterBtn = document.getElementById('open-filter-btn');
const filterModal = document.getElementById('filter-modal');
const filterModalContent = document.getElementById('filter-modal-content');
const closeFilterBtn = document.getElementById('close-filter-btn');
const filterOptions = document.querySelectorAll('.filter-option');
const currentCategoryLabel = document.getElementById('current-category-label');

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

const deleteQuoteModal = document.getElementById('delete-quote-modal');
const deleteQuoteContent = document.getElementById('delete-quote-content');
const deleteQuoteWarning = document.getElementById('delete-quote-warning');
const btnCancelDeleteQuote = document.getElementById('btn-cancel-delete-quote');
const btnConfirmDeleteQuote = document.getElementById('btn-confirm-delete-quote');

// Профиль Drawer & Настройки
const profileDrawer = document.getElementById('profile-drawer');
const profileDrawerOverlay = document.getElementById('profile-drawer-overlay');
const closeProfileBtn = document.getElementById('close-profile-btn');
const profileGreeting = document.getElementById('profile-greeting');
const userQuotesList = document.getElementById('user-quotes-list');
const drawerLogoutBtn = document.getElementById('drawer-logout-btn');
const openSettingsBtn = document.getElementById('open-settings-btn');
const tabMyQuotes = document.getElementById('tab-my-quotes');
const tabLikedQuotes = document.getElementById('tab-liked-quotes');

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
let quoteToDeleteId = null; 
let currentCategoryFilter = 'all';
let currentProfileTab = 'my_quotes';

let likedQuotes = new Set();
let myQuotesCache =[]; 
let editingQuoteId = null; 

const FALLBACK_QUOTE = {
    text: "Интернет пропал, но твоя сила воли — на месте.",
    author: "Система",
    is_external_author: true,
    likes_count: 0
};

let userSessionId = localStorage.getItem('user_session_id');
if (!userSessionId) {
    userSessionId = generateUUID();
    localStorage.setItem('user_session_id', userSessionId);
}

// ==========================================
// ФИЛЬТРЫ НА ГЛАВНОЙ
// ==========================================
function updateFilterModalUI() {
    filterOptions.forEach(btn => {
        if (btn.dataset.category === currentCategoryFilter) {
            btn.classList.add('bg-purple-500/20', 'border-purple-500', 'text-white');
            btn.classList.remove('bg-white/5', 'border-white/10', 'text-white/70');
        } else {
            btn.classList.remove('bg-purple-500/20', 'border-purple-500', 'text-white');
            btn.classList.add('bg-white/5', 'border-white/10', 'text-white/70');
        }
    });
}

function openFilterModal() {
    updateFilterModalUI();
    filterModal.classList.remove('hidden');
    setTimeout(() => {
        filterModal.classList.remove('opacity-0');
        filterModalContent.classList.remove('scale-95');
        filterModalContent.classList.add('scale-100');
    }, 10);
}

function closeFilterModal() {
    filterModal.classList.add('opacity-0');
    filterModalContent.classList.remove('scale-100');
    filterModalContent.classList.add('scale-95');
    setTimeout(() => {
        filterModal.classList.add('hidden');
    }, 300);
}

openFilterBtn.addEventListener('click', openFilterModal);
closeFilterBtn.addEventListener('click', closeFilterModal);
filterModal.addEventListener('click', (e) => {
    if (e.target === filterModal) closeFilterModal();
});

filterOptions.forEach(btn => {
    btn.addEventListener('click', async () => {
        const selectedCat = btn.dataset.category;
        if (currentCategoryFilter === selectedCat) {
            closeFilterModal();
            return;
        }
        
        currentCategoryFilter = selectedCat;
        currentCategoryLabel.textContent = CATEGORIES[selectedCat] || 'Всё подряд';
        
        updateFilterModalUI();
        closeFilterModal();
        
        quoteQueue =[];
        nextQuoteObj = null;
        await handleGenerate(); 
    });
});

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

function openDeleteQuoteModal(quoteId, isApproved) {
    quoteToDeleteId = quoteId;
    if (isApproved) {
        deleteQuoteWarning.textContent = "Эта цитата будет навсегда удалена с сайта и перестанет выпадать другим пользователям.";
    } else {
        deleteQuoteWarning.textContent = "Вы уверены, что хотите удалить эту отклоненную цитату из вашей истории?";
    }
    deleteQuoteModal.classList.remove('opacity-0', 'pointer-events-none');
    deleteQuoteContent.classList.remove('scale-95');
    deleteQuoteContent.classList.add('scale-100');
}

function closeDeleteQuoteModal() {
    deleteQuoteModal.classList.add('opacity-0', 'pointer-events-none');
    deleteQuoteContent.classList.remove('scale-100');
    deleteQuoteContent.classList.add('scale-95');
    setTimeout(() => { quoteToDeleteId = null; }, 300);
}

btnCancelDeleteQuote.addEventListener('click', closeDeleteQuoteModal);

btnConfirmDeleteQuote.addEventListener('click', async () => {
    if (!quoteToDeleteId) return;
    btnConfirmDeleteQuote.disabled = true;
    try {
        const { error } = await supabase.from('quotes').delete().eq('id', quoteToDeleteId);
        if (error) throw error;
        showToast("Цитата успешно удалена", "success");
        closeDeleteQuoteModal();
        if (currentProfileTab === 'my_quotes') loadUserQuotes();
        if (currentProfileTab === 'liked_quotes') loadLikedQuotes();
    } catch (err) {
        showToast("Ошибка при удалении", "error");
    } finally {
        btnConfirmDeleteQuote.disabled = false;
    }
});


// ==========================================
// АВТОРИЗАЦИЯ И СБРОС ПАРОЛЯ
// ==========================================

function updateLikesUI() {
    if (!currentQuoteObj || !currentQuoteObj.id) return;
    likeCountEl.textContent = currentQuoteObj.likes_count || 0;
    if (likedQuotes.has(currentQuoteObj.id)) {
        likeIcon.setAttribute('fill', 'currentColor');
        likeIcon.classList.remove('text-white/40');
        likeIcon.classList.add('text-red-500');
    } else {
        likeIcon.setAttribute('fill', 'none');
        likeIcon.classList.remove('text-red-500');
        likeIcon.classList.add('text-white/40');
    }
}

supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') showResetPasswordModal();
    if (event === 'SIGNED_IN') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('mode') === 'recovery') {
            window.history.replaceState(null, '', window.location.pathname);
            showResetPasswordModal();
        }
    }

    if (session && session.user) {
        currentUser = session.user;
        profileBtn.classList.add('ring-2', 'ring-green-400');
        
        Promise.all([
            supabase.from('profiles').select('username').eq('id', currentUser.id).single(),
            supabase.from('likes').select('quote_id').eq('user_id', currentUser.id)
        ]).then(([profileRes, likesRes]) => {
            if (profileRes.data && profileRes.data.username) {
                currentUsername = profileRes.data.username;
                profileGreeting.textContent = `Привет, ${currentUsername}!`;
            }
            if (likesRes.data) {
                likedQuotes = new Set(likesRes.data.map(item => item.quote_id));
                updateLikesUI();
            }
        });
    } else {
        currentUser = null;
        currentUsername = "Пользователь";
        likedQuotes.clear(); 
        profileBtn.classList.remove('ring-2', 'ring-green-400');
        profileGreeting.textContent = `Привет!`;
        updateLikesUI();
    }
});

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


// ==========================================
// ШТОРКА ПРОФИЛЯ
// ==========================================

tabMyQuotes.addEventListener('click', () => {
    if (currentProfileTab === 'my_quotes') return;
    currentProfileTab = 'my_quotes';
    tabMyQuotes.classList.replace('text-white/40', 'text-white');
    tabMyQuotes.classList.replace('border-transparent', 'border-purple-500');
    tabLikedQuotes.classList.replace('text-white', 'text-white/40');
    tabLikedQuotes.classList.replace('border-purple-500', 'border-transparent');
    loadUserQuotes();
});

tabLikedQuotes.addEventListener('click', () => {
    if (currentProfileTab === 'liked_quotes') return;
    currentProfileTab = 'liked_quotes';
    tabLikedQuotes.classList.replace('text-white/40', 'text-white');
    tabLikedQuotes.classList.replace('border-transparent', 'border-purple-500');
    tabMyQuotes.classList.replace('text-white', 'text-white/40');
    tabMyQuotes.classList.replace('border-purple-500', 'border-transparent');
    loadLikedQuotes();
});

async function loadUserQuotes() {
    userQuotesList.innerHTML = '<div class="text-white/30 text-sm text-center mt-10">Загрузка...</div>';
    
    const { data, error } = await supabase
        .from('quotes')
        .select('id, text, is_approved, status, rejection_reason, category, admin_note, likes_count, is_external_author, author')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
        userQuotesList.innerHTML = '<div class="text-white/30 text-sm text-center mt-10">Вы еще не предлагали фразы</div>';
        return;
    }

    myQuotesCache = data; 
    renderQuoteList(data, true);
}

async function loadLikedQuotes() {
    userQuotesList.innerHTML = '<div class="text-white/30 text-sm text-center mt-10">Загрузка...</div>';
    
    const { data, error } = await supabase
        .from('likes')
        .select('quote_id, quotes (id, text, author, category)')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
        userQuotesList.innerHTML = '<div class="text-white/30 text-sm text-center mt-10">Вы еще ничего не лайкнули</div>';
        return;
    }

    const quotes = data.map(item => item.quotes).filter(q => q !== null);
    renderQuoteList(quotes, false);
}

function renderQuoteList(data, isMyQuotes) {
    userQuotesList.innerHTML = '';
    data.forEach(quote => {
        let statusHtml = '';
        let reasonHtml = '';
        let adminNoteHtml = '';
        let deleteBtnHtml = '';
        let editBtnHtml = '';
        let likesHtml = '';

        if (isMyQuotes) {
            let statusIcon, statusColor, statusText;
            const currentStatus = quote.status || (quote.is_approved ? 'approved' : 'pending');

            if (currentStatus === 'approved') {
                statusIcon = '✅'; statusColor = 'text-green-400'; statusText = 'Одобрено';
                
                likesHtml = `
                    <div class="flex items-center gap-1.5 text-white/40 bg-white/5 px-2 py-1 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-red-500/80"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" /></svg>
                        <span class="text-xs font-bold font-mono">${quote.likes_count || 0}</span>
                    </div>
                `;
            } else if (currentStatus === 'rejected') {
                statusIcon = '❌'; statusColor = 'text-red-400'; statusText = 'Отклонено';
            } else {
                statusIcon = '⏳'; statusColor = 'text-yellow-400'; statusText = 'На модерации';
            }

            statusHtml = `<span class="${statusColor} flex items-center gap-1">${statusIcon} ${statusText}</span>`;

            if (currentStatus === 'rejected' && quote.rejection_reason) {
                reasonHtml = `<div class="mt-3 text-xs text-red-200/90 bg-red-500/20 p-2.5 rounded-md border border-red-500/30 leading-relaxed"><b>От модератора:</b> ${quote.rejection_reason}</div>`;
            }
            if (quote.admin_note) {
                adminNoteHtml = `<div class="mt-3 text-xs text-blue-200/90 bg-blue-500/20 p-2.5 rounded-md border border-blue-500/30 leading-relaxed"><b>От модератора:</b> ${quote.admin_note}</div>`;
            }
            if (currentStatus === 'approved' || currentStatus === 'rejected') {
                deleteBtnHtml = `
                    <button class="delete-quote-btn absolute top-3 right-3 text-white/20 hover:text-red-400 transition-colors" data-id="${quote.id}" data-approved="${currentStatus === 'approved'}">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                `;
            }
            if (currentStatus === 'pending' || currentStatus === 'rejected') {
                editBtnHtml = `
                    <button class="edit-quote-btn absolute top-3 right-10 text-white/20 hover:text-blue-400 transition-colors" data-id="${quote.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                    </button>
                `;
            }
        } else {
            statusHtml = `<span class="text-white/50">© ${quote.author || 'Неизвестен'}</span>`;
        }

        const catName = CATEGORIES[quote.category] || '💭 Другое';

        const quoteEl = document.createElement('div');
        quoteEl.className = 'bg-white/5 border border-white/10 rounded-lg p-4 relative flex flex-col w-full overflow-hidden';
        
        quoteEl.innerHTML = `
            ${editBtnHtml}
            ${deleteBtnHtml}
            <span class="text-[10px] uppercase tracking-widest text-purple-400 font-bold mb-2">${catName}</span>
            <p class="text-white/80 text-sm leading-relaxed mb-3 break-words break-all whitespace-pre-wrap pr-14">"${quote.text}"</p>
            <div class="flex items-center justify-between text-xs font-semibold mt-auto pt-2">
                ${statusHtml}
                ${likesHtml}
            </div>
            ${reasonHtml}
            ${adminNoteHtml}
        `;
        userQuotesList.appendChild(quoteEl);
    });
}

userQuotesList.addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.delete-quote-btn');
    if (deleteBtn) {
        const quoteId = deleteBtn.dataset.id;
        const isApproved = deleteBtn.dataset.approved === 'true';
        openDeleteQuoteModal(quoteId, isApproved);
    }
    
    const editBtn = e.target.closest('.edit-quote-btn');
    if (editBtn) {
        const quoteId = editBtn.dataset.id;
        const quoteToEdit = myQuotesCache.find(q => q.id == quoteId);
        if (quoteToEdit) {
            closeProfileDrawer();
            setTimeout(() => openQuoteModal(quoteToEdit), 300);
        }
    }
});

function openProfileDrawer() {
    profileDrawerOverlay.classList.remove('hidden');
    setTimeout(() => {
        profileDrawerOverlay.classList.remove('opacity-0');
        profileDrawer.classList.remove('translate-x-full');
    }, 10);
    
    if (currentProfileTab === 'my_quotes') loadUserQuotes();
    else loadLikedQuotes();
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
// МОДАЛКА ДОБАВЛЕНИЯ/РЕДАКТИРОВАНИЯ ЦИТАТЫ
// ==========================================

inputCategory.addEventListener('change', (e) => {
    const selected = e.target.value;
    categoryDescText.textContent = CATEGORY_DESCRIPTIONS[selected] || '';
});

isExternalAuthorCheckbox.addEventListener('change', (e) => {
    if (e.target.checked) {
        defaultAuthorBlock.classList.add('hidden');
        customAuthorBlock.classList.remove('hidden');
        inputCustomAuthor.required = true;
    } else {
        defaultAuthorBlock.classList.remove('hidden');
        customAuthorBlock.classList.add('hidden');
        inputCustomAuthor.required = false;
    }
});

function openQuoteModal(quoteToEdit = null) {
    if (quoteToEdit) {
        editingQuoteId = quoteToEdit.id;
        document.getElementById('quote-modal-title').textContent = 'Редактировать искру';
        document.getElementById('quote-modal-subtitle').textContent = 'Внесите правки и отправьте заново.';
        submitBtn.querySelector('span').textContent = 'Сохранить изменения';
        
        inputText.value = quoteToEdit.text;
        inputCategory.value = quoteToEdit.category || 'thoughts';
        categoryDescText.textContent = CATEGORY_DESCRIPTIONS[inputCategory.value] || '';
        
        if (quoteToEdit.is_external_author) {
            isExternalAuthorCheckbox.checked = true;
            defaultAuthorBlock.classList.add('hidden');
            customAuthorBlock.classList.remove('hidden');
            inputCustomAuthor.required = true;
            inputCustomAuthor.value = quoteToEdit.author;
        } else {
            isExternalAuthorCheckbox.checked = false;
            defaultAuthorBlock.classList.remove('hidden');
            customAuthorBlock.classList.add('hidden');
            inputCustomAuthor.required = false;
            inputCustomAuthor.value = '';
        }
        
        const currentLength = inputText.value.length;
        charCount.innerText = `${currentLength}/90`;
        if (currentLength >= 90) charCount.classList.add('text-red-500');
        else charCount.classList.remove('text-red-500');
        
    } else {
        editingQuoteId = null;
        document.getElementById('quote-modal-title').textContent = 'Добавить искру';
        document.getElementById('quote-modal-subtitle').textContent = 'Поделитесь мудростью с миром.';
        submitBtn.querySelector('span').textContent = 'Предложить фразу';
        quoteForm.reset();
        
        isExternalAuthorCheckbox.checked = false;
        defaultAuthorBlock.classList.remove('hidden');
        customAuthorBlock.classList.add('hidden');
        inputCustomAuthor.required = false;
        categoryDescText.textContent = CATEGORY_DESCRIPTIONS['thoughts'];
        
        charCount.innerText = "0/90";
        charCount.classList.remove('text-red-500');
    }

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
    openQuoteModal(null);
    if (addHint) addHint.classList.add('hidden');
});

closeModal.addEventListener('click', closeQuoteModal);
closeSuccessBtn.addEventListener('click', closeQuoteModal);
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
        const isExternal = isExternalAuthorCheckbox.checked;
        const authorName = isExternal ? inputCustomAuthor.value.trim() : currentUsername;
        const category = inputCategory.value;

        const quoteData = { 
            text: text, 
            author: authorName, 
            category: category,
            is_external_author: isExternal
        };

        if (editingQuoteId) {
            quoteData.status = 'pending';
            quoteData.rejection_reason = null;
            quoteData.admin_note = null;

            const { error } = await supabase.from('quotes').update(quoteData).eq('id', editingQuoteId);
            if (error) throw error;
            
            document.getElementById('success-title').textContent = 'Изменения сохранены!';
            document.getElementById('success-subtitle').textContent = 'Цитата отправлена на повторную модерацию.';
        } else {
            quoteData.session_id = userSessionId;
            quoteData.user_id = currentUser.id;
            
            const { error } = await supabase.from('quotes').insert([quoteData]);
            if (error) throw error;
            
            document.getElementById('success-title').textContent = 'Отправлено на модерацию!';
            document.getElementById('success-subtitle').textContent = 'Цитата появится в вашем профиле.';
        }

        formStep.classList.add('hidden');
        successStep.classList.remove('hidden');
        
        const tgBotLink = document.getElementById('tg-bot-link');
        if(tgBotLink) tgBotLink.href = `https://t.me/MyInspoMod_bot?start=${userSessionId}`;
        
    } catch (err) {
        console.error(err);
        showToast("Ошибка. Попробуйте позже.", 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.querySelector('span').textContent = editingQuoteId ? "Сохранить изменения" : "Предложить фразу";
        submitLoader.classList.add('hidden');
    }
});


// ==========================================
// ЛОГИКА ОЧЕРЕДИ ЦИТАТ, ЛАЙКОВ И ИНТЕРФЕЙС
// ==========================================

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));[array[i], array[j]] = [array[j], array[i]];
    }
}

async function refillQueue() {
    try {
        const { data, error } = await supabase.rpc('get_all_quote_ids', { p_category: currentCategoryFilter });
        if (error) throw error;
        if (!data || data.length === 0) return false;

        quoteQueue = data.map(item => typeof item === 'object' && item.id ? item.id : item); 
        shuffleArray(quoteQueue);
        return true;
    } catch (e) {
        return false;
    }
}

async function fetchOneQuote(retryCount = 0) {
    if (retryCount > 3) return FALLBACK_QUOTE; 

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
        return fetchOneQuote(retryCount + 1);
    }
}

function updateQuoteUI(quoteObj) {
    currentQuoteObj = quoteObj;
    
    // ЖЕСТКАЯ ОПТИМИЗАЦИЯ: Убрали transition-all. 
    // Текст меняет размер моментально, пока он невидим (opacity: 0).
    if (quoteObj.text.length > 70) {
        quoteText.className = "text-2xl md:text-4xl lg:text-5xl font-black leading-tight text-white pb-2 break-words";
    } else {
        quoteText.className = "text-3xl md:text-5xl lg:text-6xl font-black leading-tight text-white pb-2 break-words";
    }
    
    quoteText.textContent = quoteObj.text;

    if (quoteObj.author) {
        quoteAuthor.textContent = `© ${quoteObj.author}`;
    } else {
        quoteAuthor.textContent = '';
    }

    updateLikesUI();

    // Даем браузеру миллисекунду на пересчет макета ДО начала анимации
    requestAnimationFrame(() => {
        quoteWrapper.classList.remove('fade-out', 'initial-hidden');
        quoteWrapper.classList.add('fade-in');
        if (quoteMetaRow) quoteMetaRow.classList.remove('opacity-0', 'translate-y-4');
        resetCopyHint();
    });
}

// ЛАЙК: ОБРАБОТЧИК КЛИКА
likeBtn.addEventListener('click', async (e) => {
    e.stopPropagation(); 
    
    if (!currentUser) {
        showToast("Войдите в аккаунт, чтобы ставить лайки", "error");
        openAuthModal();
        return;
    }
    
    if (!currentQuoteObj || !currentQuoteObj.id) return;
    
    const qId = currentQuoteObj.id;
    const isLiked = likedQuotes.has(qId);
    let currentCount = parseInt(likeCountEl.textContent) || 0;
    
    if (isLiked) {
        likedQuotes.delete(qId);
        likeIcon.setAttribute('fill', 'none');
        likeIcon.classList.replace('text-red-500', 'text-white/40');
        likeCountEl.textContent = Math.max(0, currentCount - 1);
        currentQuoteObj.likes_count = Math.max(0, currentCount - 1);
    } else {
        likedQuotes.add(qId);
        likeIcon.setAttribute('fill', 'currentColor');
        likeIcon.classList.replace('text-white/40', 'text-red-500');
        likeCountEl.textContent = currentCount + 1;
        currentQuoteObj.likes_count = currentCount + 1;
    }
    
    try {
        if (isLiked) {
            await supabase.from('likes').delete().match({ user_id: currentUser.id, quote_id: qId });
        } else {
            await supabase.from('likes').insert([{ user_id: currentUser.id, quote_id: qId }]);
        }
    } catch (err) {
        console.error(err);
    }
});

saveBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showToast("Закладки и плейлисты появятся в следующем обновлении!", "success");
});

async function handleGenerate() {
    if (magicBtn.disabled) return;

    magicBtn.disabled = true;
    
    if (!nextQuoteObj) {
        btnContent.classList.add('hidden');
        btnLoader.classList.remove('hidden');
    }

    quoteWrapper.classList.remove('fade-in');
    quoteWrapper.classList.add('fade-out');
    if (quoteMetaRow) quoteMetaRow.classList.add('opacity-0', 'translate-y-4');

    const performSwitch = async () => {
        if (!nextQuoteObj) {
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