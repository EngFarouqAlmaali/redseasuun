// js/model/security/login2.js
const password = {
    password: "RED3435@#"
};

const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglepassword");
const eyeIcon = togglePassword.querySelector("i");
const loginButton = document.getElementById("btn-id");

// إظهار/إخفاء كلمة المرور
togglePassword.addEventListener("click", function (e) {
    e.preventDefault();
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    eyeIcon.classList.toggle("fa-eye");
    eyeIcon.classList.toggle("fa-eye-slash");
});

// التحقق من كلمة المرور عند الضغط على زر الدخول
loginButton.addEventListener("click", function (e) {
    e.preventDefault();
    const enteredPassword = passwordInput.value;

    // استخدام مدير المصادقة للتحقق
    if (window.authManager.login(enteredPassword)) {
        alert("✅ تم تسجيل الدخول بنجاح!");
        
        // إعادة التوجيه للصفحة الرئيسية بعد تسجيل الدخول الناجح
        setTimeout(() => {
            window.location.href = "user_managment.html";
        }, 1000);
    } else {
        alert("❌ كلمة المرور غير صحيحة، حاول مرة أخرى.");
        passwordInput.value = "";
        passwordInput.focus();
        
        // إضافة تأثير اهتزاز للحقل عند الخطأ
        passwordInput.style.animation = 'shake 0.5s';
        setTimeout(() => {
            passwordInput.style.animation = '';
        }, 500);
    }
});

// السماح بالدخول بالضغط على Enter
passwordInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        loginButton.click();
    }
});

// إضافة أنيميشن الاهتزاز للCSS
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);