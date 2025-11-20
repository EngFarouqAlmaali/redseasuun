const firebaseConfig = {
    apiKey: "AIzaSyAQ_RrIYzdNgnBcbO-lPZryh_1XJqMt3fA",
    authDomain: "db-user22.firebaseapp.com",
    projectId: "db-user22",
    storageBucket: "db-user22.firebasestorage.app",
    messagingSenderId: "647256662913",
    appId: "1:647256662913:web:b5c3c5573503489f807e80",
    measurementId: "G-1HKSGVMHPZ"
};

// تهيئة Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

const DOCUMENTS_LIST = [
    "قوشان حديث",
    "مخطط موقع / مخطط أرضي",
    "سند تسجيل أرضي حديث",
    "مخطط موقع تنظيمي",
    "موافقة الجيران",
    "تعهد مصادق عليه من كاتب العدل (تعهد عدلي)",
    "هوية المالك",
    "تفويض مصادق من البنك",
    "فاتورة كهرباء أو رقم اشتراك",
    "صورة عن الهوية",
    "عرض السعر",
    "العقد",
    "سكتش",
    "رفع القياسات",
    "رسوم: 30 دينار أردني لشركة الكهرباء"
];

// تعريف المتغيرات العالمية
let loginSection, dashboardSection, loginForm, loading, nationalIdInput, passwordInput;
let togglePasswordBtn, logoutBtn, forgotPasswordLink, userNameSpan, userInfoDiv;
let completedDiv, pendingDiv, progressFill, progressText, notesDiv;
let themeToggleLogin, themeToggleDash;

function initializeElements() {
    loginSection = document.getElementById('loginSection');
    dashboardSection = document.getElementById('dashboardSection');
    loginForm = document.getElementById('loginForm');
    loading = document.getElementById('loading');
    nationalIdInput = document.getElementById('nationalId');
    passwordInput = document.getElementById('password');
    togglePasswordBtn = document.getElementById('togglePassword');
    logoutBtn = document.getElementById('logoutBtn');
    forgotPasswordLink = document.getElementById('forgotPassword');
    userNameSpan = document.getElementById('userName');
    userInfoDiv = document.getElementById('userInfo');
    completedDiv = document.getElementById('completedDocuments');
    pendingDiv = document.getElementById('pendingDocuments');
    progressFill = document.getElementById('progressFill');
    progressText = document.getElementById('progressText');
    notesDiv = document.getElementById('notesContent');
    themeToggleLogin = document.getElementById('themeToggleLogin');
    themeToggleDash = document.getElementById('themeToggleDash');
}

function showLoading(show = true) {
    if (loading) {
        loading.style.display = show ? 'flex' : 'none';
    }
}

function notify(msg, success = false) {
    const bar = document.createElement('div');
    bar.style.cssText = `
        position:fixed;top:24px;right:24px;background:${success ? '#10b981' : '#ef4444'};color:#fff;
        padding:16px 20px;border-radius:12px;font-weight:800;z-index:9999;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);
        transform:translateX(400px);transition:.4s;
    `;
    bar.innerHTML = `<i class="fas ${success ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${msg}`;
    document.body.appendChild(bar);
    setTimeout(() => bar.style.transform = 'translateX(0)', 100);
    setTimeout(() => {
        bar.style.transform = 'translateX(400px)';
        setTimeout(() => bar.remove(), 400);
    }, 3000);
}

function validateId(id) {
    return /^\d{10}$/.test(id);
}

function validatePass(p) {
    return p.length >= 6;
}

function setupEventListeners() {
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            togglePasswordBtn.innerHTML = `<i class="fas fa-eye${type === 'password' ? '-slash' : ''}"></i>`;
        });
    }

    if (themeToggleLogin) {
        themeToggleLogin.addEventListener('click', toggleTheme);
    }
    
    if (themeToggleDash) {
        themeToggleDash.addEventListener('click', toggleTheme);
    }

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', handleForgotPassword);
    }
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        document.querySelectorAll('.theme-toggle-login, .theme-toggle-dash').forEach(btn => {
            if (btn) btn.innerHTML = '<i class="fas fa-sun"></i>';
        });
    } else {
        document.body.classList.remove('dark-theme');
        document.querySelectorAll('.theme-toggle-login, .theme-toggle-dash').forEach(btn => {
            if (btn) btn.innerHTML = '<i class="fas fa-moon"></i>';
        });
    }
}

function toggleTheme() {
    const current = localStorage.getItem('theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', next);
    applyTheme(next);
}

async function handleLogin(e) {
    e.preventDefault();
    const id = nationalIdInput.value.trim();
    const pass = passwordInput.value;

    // إخفاء رسائل الخطأ أولاً
    const idError = document.getElementById('idError');
    const passwordError = document.getElementById('passwordError');
    
    if (idError) idError.style.display = 'none';
    if (passwordError) passwordError.style.display = 'none';

    if (!validateId(id)) {
        if (idError) idError.style.display = 'block';
        return;
    }

    if (!validatePass(pass)) {
        if (passwordError) passwordError.style.display = 'block';
        return;
    }

    showLoading(true);
    try {
        const snap = await db.collection('users').where('nationalId', '==', id).get();
        if (snap.empty) {
            notify('رقم الهوية غير مسجل');
            showLoading(false);
            return;
        }
        const userDoc = snap.docs[0];
        const userData = userDoc.data();
        if (userData.password !== pass) {
            notify('كلمة المرور غير صحيحة');
            showLoading(false);
            return;
        }
        const userInfo = { id: userDoc.id, ...userData };
        localStorage.setItem('currentUser', JSON.stringify(userInfo));
        notify('تم تسجيل الدخول بنجاح', true);
        showDashboard(userInfo);
    } catch (err) {
        console.error('Login error:', err);
        notify('حدث خطأ أثناء تسجيل الدخول');
    } finally {
        showLoading(false);
    }
}

function showDashboard(user) {
    if (loginSection) loginSection.style.display = 'none';
    if (dashboardSection) dashboardSection.style.display = 'block';
    if (userNameSpan) userNameSpan.textContent = user.fullName || 'مستخدم';

    if (userInfoDiv) {
        userInfoDiv.innerHTML = `
            <div class="info-row">
                <div class="info-label"><i class="fas fa-user"></i> الاسم الكامل</div>
                <div class="info-value">${user.fullName || '—'}</div>
            </div>
            <div class="info-row">
                <div class="info-label"><i class="fas fa-id-card"></i> رقم الهوية</div>
                <div class="info-value">${user.nationalId || '—'}</div>
            </div>
            <div class="info-row">
                <div class="info-label"><i class="fas fa-phone"></i> رقم الهاتف</div>
                <div class="info-value">${user.phoneNumber || '—'}</div>
            </div>
            <div class="info-row">
                <div class="info-label"><i class="fas fa-solar-panel"></i> حجم النظام</div>
                <div class="info-value">${user.systemSize || 0} كيلوواط</div>
            </div>
            <div class="info-row">
                <div class="info-label"><i class="fas fa-map-marker-alt"></i> العنوان</div>
                <div class="info-value">${user.address || '—'}</div>
            </div>
            ${user.paymentMethod ? `
            <div class="info-row">
                <div class="info-label"><i class="fas fa-credit-card"></i> طريقة الدفع</div>
                <div class="info-value">${user.paymentMethod}</div>
            </div>` : ''}
            ${user.paymentDetails ? `
            <div class="info-row">
                <div class="info-label"><i class="fas fa-info-circle"></i> تفاصيل الدفع</div>
                <div class="info-value">${user.paymentDetails}</div>
            </div>` : ''}
        `;
    }

    if (notesDiv) {
        let notesHTML = '';
        if (user.commissionNotes) {
            notesHTML += `<div class="note-item"><div class="note-label"><i class="fas fa-university"></i> ملاحظات المفوضية</div><div class="note-text">${user.commissionNotes}</div></div>`;
        }
        if (user.companyNotes) {
            notesHTML += `<div class="note-item"><div class="note-label"><i class="fas fa-building"></i> ملاحظات الشركة</div><div class="note-text">${user.companyNotes}</div></div>`;
        }
        notesDiv.innerHTML = notesHTML || '<div class="no-notes">لا توجد ملاحظات حالياً</div>';
    }

    renderDocuments(user);
}

function renderDocuments(user) {
    if (!completedDiv || !pendingDiv || !progressFill || !progressText) return;

    const docs = user.documents || [];
    completedDiv.innerHTML = '';
    pendingDiv.innerHTML = '';

    let completedCount = 0;
    let pendingCount = 0;

    docs.forEach((status, idx) => {
        if (idx >= DOCUMENTS_LIST.length) return;
        const card = document.createElement('div');
        card.className = `doc-card ${status ? 'completed' : 'pending'}`;
        card.innerHTML = `
            <div class="doc-icon"><i class="fas ${status ? 'fa-check-circle' : 'fa-clock'}"></i></div>
            <div class="doc-info">
                <div class="doc-name">${DOCUMENTS_LIST[idx]}</div>
                <div class="doc-status">${status ? 'مكتملة' : 'قيد الانتظار'}</div>
            </div>
            <div class="doc-num">${idx + 1}</div>
        `;
        if (status) {
            completedDiv.appendChild(card);
            completedCount++;
        } else {
            pendingDiv.appendChild(card);
            pendingCount++;
        }
    });

    if (completedCount === 0) {
        completedDiv.innerHTML = '<div class="no-documents">لا توجد وثائق مكتملة</div>';
    }
    if (pendingCount === 0) {
        pendingDiv.innerHTML = '<div class="no-documents">كل الوثائق مكتملة</div>';
    }

    const total = DOCUMENTS_LIST.length;
    const percent = total ? Math.round((completedCount / total) * 100) : 0;
    progressFill.style.width = `${percent}%`;
    progressText.textContent = `${completedCount} / ${total}`;

    const statItems = document.querySelectorAll('.stat-item');
    if (statItems.length >= 3) {
        statItems[0].querySelector('.stat-value').textContent = completedCount;
        statItems[1].querySelector('.stat-value').textContent = pendingCount;
        statItems[2].querySelector('.stat-value').textContent = `${percent}%`;
    }
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    if (dashboardSection) dashboardSection.style.display = 'none';
    if (loginSection) loginSection.style.display = 'block';
    if (loginForm) loginForm.reset();
    notify('تم تسجيل الخروج بنجاح', true);
}

function handleForgotPassword(e) {
    e.preventDefault();
    notify('لاستعادة كلمة المرور، اتصل بمدير النظام على 0796908910 أو 0796545743');
}

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupEventListeners();
    
    // تطبيق السمة
    applyTheme(localStorage.getItem('theme') || 'light');
    
    // التحقق من وجود مستخدم مسجل دخوله
    const saved = localStorage.getItem('currentUser');
    if (saved) {
        try {
            const userData = JSON.parse(saved);
            showDashboard(userData);
        } catch (e) {
            console.error('Error loading user data:', e);
            localStorage.removeItem('currentUser');
            if (loginSection) loginSection.style.display = 'block';
        }
    } else {
        if (loginSection) loginSection.style.display = 'block';
    }
    
    // إخفاء شاشة التحميل
    setTimeout(() => {
        if (loading) loading.style.display = 'none';
    }, 600);
});