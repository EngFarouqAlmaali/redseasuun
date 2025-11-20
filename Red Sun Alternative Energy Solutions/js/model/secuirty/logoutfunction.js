// في users-management.js
function logout() {
    if (confirm('هل تريد تسجيل الخروج؟')) {
        if (window.authManager) {
            window.authManager.logout();
        } else {
            // طريقة احتياطية
            localStorage.removeItem('userAuthenticated');
            localStorage.removeItem('authTimestamp');
            window.location.href = 'user_managment_login2.html';
        }
    }
}