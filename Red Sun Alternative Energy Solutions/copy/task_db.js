// تهيئة Firebase
        const firebaseConfig = {
            apiKey: "AIzaSyC-J-ij1-K0sswYVhTq_dH6rawEYCJelvQ",
            authDomain: "task-db-97136.firebaseapp.com",
            projectId: "task-db-97136",
            storageBucket: "task-db-97136.firebasestorage.app",
            messagingSenderId: "31225933725",
            appId: "1:31225933725:web:17fb6f90d2cf0a3f0f0974",
            measurementId: "G-EDQ9XD9RN7"
        };
        
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();
        
        // متغيرات التطبيق
        let currentFilter = 'all';
        let currentPriority = 'medium';
        let tasks = [];
        let editingTaskId = null;
        
        // تهيئة التطبيق عند تحميل الصفحة
        document.addEventListener('DOMContentLoaded', function() {
            loadTasks();
            setupEventListeners();
            showNotification('info', 'مرحباً بك في نظام إدارة المهام المتقدم', 3000);
        });
        
        // إعداد مستمعي الأحداث
        function setupEventListeners() {
            // إضافة مهمة عند الضغط على Enter في حقل العنوان
            document.getElementById('task-title').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    addTask();
                }
            });
            
            // تحميل تفضيلات المستخدم
            loadUserPreferences();
        }