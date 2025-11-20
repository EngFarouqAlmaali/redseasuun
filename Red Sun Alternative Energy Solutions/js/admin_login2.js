// بيانات المدير المعتمدة
const ADMIN_CREDENTIALS = {
    email: 'admin7789f@redsea.com',
    secretCode: '8896018',
    password: 'admin44568#@0'
};

// تبديل رؤية كلمة المرور
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

togglePassword.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // تغيير الأيقونة
    const icon = this.querySelector('i');
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
});

// التحقق من صحة النموذج
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const secretInput = document.getElementById('secret');

function showError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    input.classList.add('error');
    error.textContent = message;
    error.style.display = 'block';
}

function hideError(inputId, errorId) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    input.classList.remove('error');
    error.style.display = 'none';
}

// التحقق من البريد الإلكتروني
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// التحقق من بيانات الاعتماد
function validateCredentials(email, secretCode, password) {
    return email === ADMIN_CREDENTIALS.email && 
           secretCode === ADMIN_CREDENTIALS.secretCode && 
           password === ADMIN_CREDENTIALS.password;
}

// حفظ حالة تسجيل الدخول - إصدار مبسط
function setLoginSession() {
    // إنشاء token بسيط
    const token = btoa(JSON.stringify({
        auth: true,
        time: Date.now(),
        user: 'admin'
    }));
    
    // حفظ في cookie بدون انتهاء صلاحية (session cookie)
    document.cookie = `authToken=${token}; path=/; SameSite=Lax`;
    
    // حفظ في storage للنسخ الاحتياطي
    try {
        localStorage.setItem('authToken', token);
    } catch (e) {
        // إذا لم يكن متاحاً
        sessionStorage.setItem('authToken', token);
    }
    
    console.log('تم حفظ الجلسة بنجاح');
}

// التحقق من حالة تسجيل الدخول
function isLoggedIn() {
    // البحث عن التوكن في cookie أولاً
    const cookieToken = getCookie('authToken');
    if (cookieToken) {
        return validateToken(cookieToken);
    }
    
    // البحث في localStorage
    try {
        const storageToken = localStorage.getItem('authToken');
        if (storageToken) {
            return validateToken(storageToken);
        }
    } catch (e) {
        // تجربة sessionStorage
        const sessionToken = sessionStorage.getItem('authToken');
        if (sessionToken) {
            return validateToken(sessionToken);
        }
    }
    
    return false;
}

// التحقق من صحة التوكن
function validateToken(token) {
    try {
        const data = JSON.parse(atob(token));
        return data.auth === true && data.user === 'admin';
    } catch (e) {
        return false;
    }
}

// دالة للحصول على قيمة cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// أحداث الإدخال
emailInput.addEventListener('input', function() {
    if (this.value.trim() === '') {
        showError('email', 'emailError', 'البريد الإلكتروني مطلوب');
    } else if (!validateEmail(this.value)) {
        showError('email', 'emailError', 'يرجى إدخال بريد إلكتروني صحيح');
    } else {
        hideError('email', 'emailError');
    }
});

secretInput.addEventListener('input', function() {
    if (this.value.trim() === '') {
        showError('secret', 'secretError', 'الرمز السري مطلوب');
    } else {
        hideError('secret', 'secretError');
    }
});

passwordInput.addEventListener('input', function() {
    if (this.value.trim() === '') {
        showError('password', 'passwordError', 'كلمة المرور مطلوبة');
    } else if (this.value.length < 6) {
        showError('password', 'passwordError', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    } else {
        hideError('password', 'passwordError');
    }
});

// إرسال النموذج
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    let isValid = true;
    
    // التحقق من جميع الحقول
    if (emailInput.value.trim() === '') {
        showError('email', 'emailError', 'البريد الإلكتروني مطلوب');
        isValid = false;
    } else if (!validateEmail(emailInput.value)) {
        showError('email', 'emailError', 'يرجى إدخال بريد إلكتروني صحيح');
        isValid = false;
    }
    
    if (secretInput.value.trim() === '') {
        showError('secret', 'secretError', 'الرمز السري مطلوب');
        isValid = false;
    }
    
    if (passwordInput.value.trim() === '') {
        showError('password', 'passwordError', 'كلمة المرور مطلوبة');
        isValid = false;
    }
    
    if (isValid) {
        // التحقق من صحة بيانات تسجيل الدخول
        const email = emailInput.value.trim();
        const secretCode = secretInput.value.trim();
        const password = passwordInput.value;
        
        if (validateCredentials(email, secretCode, password)) {
            // إخفاء رسائل الخطأ
            hideError('email', 'emailError');
            hideError('secret', 'secretError');
            hideError('password', 'passwordError');
            
            // عرض رسالة تحميل
            const submitBtn = document.querySelector('.submit-btn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري التحقق...';
            submitBtn.disabled = true;
            
            // محاكاة تأخير قصير
            setTimeout(() => {
                // حفظ حالة تسجيل الدخول
                setLoginSession();
                
                // عرض رسالة نجاح
                submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> تم بنجاح!';
                submitBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                
                // التوجه للداش بورد فوراً
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 500);
                
            }, 800);
            
        } else {
            // عرض رسالة خطأ
            if (email !== ADMIN_CREDENTIALS.email) {
                showError('email', 'emailError', 'البريد الإلكتروني غير صحيح');
            }
            if (secretCode !== ADMIN_CREDENTIALS.secretCode) {
                showError('secret', 'secretError', 'الرمز السري غير صحيح');
            }
            if (password !== ADMIN_CREDENTIALS.password) {
                showError('password', 'passwordError', 'كلمة المرور غير صحيحة');
            }
            
            // هز النموذج للإشارة للخطأ
            const loginContainer = document.querySelector('.login-container');
            loginContainer.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                loginContainer.style.animation = '';
            }, 500);
        }
    }
});

// تحسين تجربة المستخدم
document.querySelectorAll('.form-control').forEach(input => {
    input.addEventListener('focus', function() {
        const errorElement = this.parentElement.querySelector('.error-message');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
        this.classList.remove('error');
    });
});

// فحص إذا كان المستخدم مسجل دخول بالفعل عند تحميل الصفحة
window.addEventListener('load', function() {
    if (isLoggedIn()) {
        console.log('المستخدم مسجل دخول بالفعل، توجيه للداش بورد...');
        window.location.href = 'dashboard.html';
    }
});