const firebaseConfig = {
    apiKey: "AIzaSyAQ_RrIYzdNgnBcbO-lPZryh_1XJqMt3fA",
    authDomain: "db-user22.firebaseapp.com",
    projectId: "db-user22",
    storageBucket: "db-user22.firebasestorage.app",
    messagingSenderId: "647256662913",
    appId: "1:647256662913:web:b5c3c5573503489f807e80",
    measurementId: "G-1HKSGVMHPZ"
};

firebase.initializeApp(firebaseConfig);
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

const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const loading = document.getElementById('loading');
const nationalIdInput = document.getElementById('nationalId');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('togglePassword');
const logoutBtn = document.getElementById('logoutBtn');
const forgotPasswordLink = document.getElementById('forgotPassword');
const userNameSpan = document.getElementById('userName');
const userInfoDiv = document.getElementById('userInfo');
const completedDiv = document.getElementById('completedDocuments');
const pendingDiv = document.getElementById('pendingDocuments');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const notesDiv = document.getElementById('notesContent');
const themeToggleLogin = document.getElementById('themeToggleLogin');
const themeToggleDash = document.getElementById('themeToggleDash');

function showLoading(show = true) {
    loading.style.display = show ? 'flex' : 'none';
}