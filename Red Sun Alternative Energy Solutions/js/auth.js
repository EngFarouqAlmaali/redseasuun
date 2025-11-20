/**
 * Dashboard Authentication Guard - إصدار مبسط وفعال
 * يجب إضافة هذا الملف في بداية جميع صفحات الداش بورد
 */

// متغير للتحكم في عرض المحتوى
let contentLoaded = false;

// دالة للحصول على cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// التحقق من صحة التوكن
function validateAuthToken(token) {
    try {
        const data = JSON.parse(atob(token));
        return data.auth === true && data.user === 'admin';
    } catch (e) {
        return false;
    }
}

// التحقق من المصادقة
function checkAuthentication() {
    // البحث في cookie
    const cookieToken = getCookie('authToken');
    if (cookieToken && validateAuthToken(cookieToken)) {
        return true;
    }
    
    // البحث في localStorage
    try {
        const storageToken = localStorage.getItem('authToken');
        if (storageToken && validateAuthToken(storageToken)) {
            // استعادة التوكن في cookie
            document.cookie = `authToken=${storageToken}; path=/; SameSite=Lax`;
            return true;
        }
    } catch (e) {
        // تجربة sessionStorage
        try {
            const sessionToken = sessionStorage.getItem('authToken');
            if (sessionToken && validateAuthToken(sessionToken)) {
                document.cookie = `authToken=${sessionToken}; path=/; SameSite=Lax`;
                return true;
            }
        } catch (e2) {
            // تجاهل الخطأ
        }
    }
    
    return false;
}

// مسح بيانات المصادقة
function clearAuth() {
    // مسح cookie
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    // مسح من storage
    try {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
    } catch (e) {
        // تجاهل الخطأ
    }
    
    console.log('تم مسح بيانات المصادقة');
}

// إعادة التوجيه لصفحة تسجيل الدخول
function redirectToLogin(message = 'يجب تسجيل الدخول أولاً') {
    // عرض رسالة للمستخدم
    document.body.innerHTML = `
        <div style="
            font-family: 'Tajawal', Arial, sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1a1a2e 100%);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            text-align: center;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            z-index: 9999;
        ">
            <div style="
                background: rgba(30, 41, 59, 0.9);
                padding: 40px;
                border-radius: 20px;
                border: 1px solid rgba(6, 182, 212, 0.3);
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            ">
                <div style="font-size: 4rem; color: #ef4444; margin-bottom: 20px;">
                    <i class="fa-solid fa-lock" style="font-family: 'Font Awesome 6 Free';"></i>
                </div>
                <h1 style="margin-bottom: 15px; color: #22d3ee;">غير مصرح بالوصول</h1>
                <p style="margin-bottom: 20px; color: #94a3b8;">${message}</p>
                <p style="color: #06b6d4;">جاري التوجيه لصفحة تسجيل الدخول...</p>
                <div style="margin-top: 20px;">
                    <div style="
                        width: 40px;
                        height: 40px;
                        border: 3px solid #334155;
                        border-top: 3px solid #06b6d4;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin: 0 auto;
                    "></div>
                </div>
            </div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    
    // التوجيه بعد ثانيتين
    setTimeout(() => {
        window.location.href = 'admin_login2.html';
    }, 2000);
}

// تسجيل الخروج
function logout() {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
        clearAuth();
        redirectToLogin('تم تسجيل الخروج بنجاح');
    }
}

// عرض المحتوى بعد التحقق من المصادقة
function showContent() {
    if (!contentLoaded) {
        document.body.style.display = 'block';
        document.body.style.opacity = '1';
        contentLoaded = true;
        
        // إضافة زر تسجيل الخروج
        addLogoutButton();
        
        console.log('تم عرض المحتوى المحمي');
    }
}

// إضافة زر تسجيل الخروج
function addLogoutButton() {
    // التحقق من وجود زر تسجيل الخروج
    if (document.querySelector('#authLogoutBtn')) {
        return;
    }
    
    const logoutBtn = document.createElement('button');
    logoutBtn.id = 'authLogoutBtn';
    logoutBtn.innerHTML = '<i class="fa-solid fa-sign-out-alt"></i> خروج';
    logoutBtn.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;
        border: none;
        padding: 12px 18px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        z-index: 9998;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        font-family: 'Tajawal', Arial, sans-serif;
    `;
    
    logoutBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)';
    });
    
    logoutBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
    });
    
    logoutBtn.addEventListener('click', logout);
    
    document.body.appendChild(logoutBtn);
}

// الفحص الرئيسي - يتم تنفيذه فوراً
(function() {
    // إخفاء المحتوى فوراً
    document.documentElement.style.opacity = '0';
    
    // فحص المصادقة
    if (!checkAuthentication()) {
        console.log('فشل في المصادقة');
        clearAuth();
        redirectToLogin();
        return;
    }
    
    console.log('تم التحقق من المصادقة بنجاح');
    
    // إظهار المحتوى
    document.documentElement.style.opacity = '1';
    
    // التحقق من حالة الصفحة
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showContent);
    } else {
        showContent();
    }
    
    // فحص دوري كل 5 دقائق
    setInterval(() => {
        if (!checkAuthentication()) {
            console.log('انتهت صلاحية الجلسة');
            clearAuth();
            redirectToLogin('انتهت صلاحية جلستك');
        }
    }, 300000);
    
})();

// تصدير الدوال للاستخدام الخارجي
window.authGuard = {
    checkAuth: checkAuthentication,
    logout: logout,
    clearAuth: clearAuth
};