
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