// js/model/security/authentication.js
class AuthenticationManager {
    constructor() {
        this.isAuthenticated = false;
        this.validPassword = "RED3435@#"; // نفس كلمة السر في login2.js
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.setupAutoLogout();
    }

    checkAuthentication() {
        const authStatus = localStorage.getItem('userAuthenticated');
        const authTime = localStorage.getItem('authTimestamp');
        
        if (authStatus === 'true' && authTime) {
            // التحقق من أن الجلسة لم تنتهِ (24 ساعة)
            const currentTime = new Date().getTime();
            const authTimestamp = parseInt(authTime);
            const sessionDuration = 24 * 60 * 60 * 1000; // 24 ساعة
            
            if (currentTime - authTimestamp < sessionDuration) {
                this.isAuthenticated = true;
                return true;
            } else {
                this.logout();
            }
        }
        
        // إذا لم يكن مسجلاً دخول، إعادة التوجيه لصفحة login2
        if (!this.isAuthenticated) {
            this.redirectToLogin();
            return false;
        }
    }

    login(password) {
        if (password === this.validPassword) {
            this.isAuthenticated = true;
            localStorage.setItem('userAuthenticated', 'true');
            localStorage.setItem('authTimestamp', new Date().getTime().toString());
            
            // تسجيل محاولة الدخول الناجحة
            this.logLoginAttempt(true);
            
            return true;
        } else {
            // تسجيل محاولة الدخول الفاشلة
            this.logLoginAttempt(false, password);
            return false;
        }
    }

    logout() {
        this.isAuthenticated = false;
        localStorage.removeItem('userAuthenticated');
        localStorage.removeItem('authTimestamp');
        this.redirectToLogin();
    }

    redirectToLogin() {
        // منع التكرار في إعادة التوجيه
        if (!window.location.href.includes('login2.html')) {
            window.location.href = 'user_managment_login2.html';
        }
    }

    setupAutoLogout() {
        // تسجيل خروج تلقائي بعد 24 ساعة
        setInterval(() => {
            this.checkAuthentication();
        }, 60 * 60 * 1000); // التحقق كل ساعة

        // تسجيل خروج عند إغلاق المتصفح
        window.addEventListener('beforeunload', () => {
            // يمكنك اختيار حفظ الجلسة أو لا
        });
    }

    logLoginAttempt(success, attemptedPassword = '') {
        const logEntry = {
            timestamp: new Date().toISOString(),
            success: success,
            ip: this.getUserIP(),
            userAgent: navigator.userAgent,
            attemptedPassword: success ? '******' : attemptedPassword // إخفاء كلمة السر في السجلات
        };

        // حفظ في localStorage (يمكن تعديله لحفظ في السيرفر)
        const loginLogs = JSON.parse(localStorage.getItem('loginAttempts') || '[]');
        loginLogs.push(logEntry);
        
        // حفظ آخر 100 محاولة فقط
        if (loginLogs.length > 100) {
            loginLogs.splice(0, loginLogs.length - 100);
        }
        
        localStorage.setItem('loginAttempts', JSON.stringify(loginLogs));

        // إشعار في الكونسول للأغراض التنموية
        if (success) {
            console.log('✅ تم تسجيل الدخول بنجاح');
        } else {
            console.warn('❌ محاولة دخول فاشلة');
        }
    }

    getUserIP() {
        // هذه دالة مبسطة، في بيئة حقيقية تحتاج لسيرفر
        return 'unknown';
    }

    getAuthStatus() {
        return this.isAuthenticated;
    }

    // دالة لتغيير كلمة السر (للمسؤول فقط)
    changePassword(newPassword, oldPassword) {
        if (oldPassword === this.validPassword) {
            this.validPassword = newPassword;
            
            // في بيئة حقيقية، هنا يتم حفظ كلمة السر الجديدة في السيرفر
            console.log('✅ تم تغيير كلمة السر بنجاح');
            return true;
        }
        return false;
    }
}

// إنشاء نسخة عامة
window.authManager = new AuthenticationManager();