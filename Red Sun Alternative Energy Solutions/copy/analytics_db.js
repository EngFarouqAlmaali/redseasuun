        // تهيئة Firebase مع التطبيقات المتعددة
        const firebaseConfig1 = {
            apiKey: "AIzaSyC4mOkOj7XvH8lSmhq5x5Y6d7v8Xb8Y8b8",
            authDomain: "advanced-analytics-system.firebaseapp.com",
            projectId: "advanced-analytics-system",
            storageBucket: "advanced-analytics-system.appspot.com",
            messagingSenderId: "1234567890",
            appId: "1:1234567890:web:abcdef123456"
        };

        const firebaseConfig2 = {
            apiKey: "AIzaSyAQ_RrIYzdNgnBcbO-lPZryh_1XJqMt3fA",
            authDomain: "db-user22.firebaseapp.com",
            projectId: "db-user22",
            storageBucket: "db-user22.firebasestorage.app",
            messagingSenderId: "647256662913",
            appId: "1:647256662913:web:b5c3c5573503489f807e80",
            measurementId: "G-1HKSGVMHPZ"
        };

        const firebaseConfig3 = {
            apiKey: "AIzaSyC-J-ij1-K0sswYVhTq_dH6rawEYCJelvQ",
            authDomain: "task-db-97136.firebaseapp.com",
            projectId: "task-db-97136",
            storageBucket: "task-db-97136.firebasestorage.app",
            messagingSenderId: "31225933725",
            appId: "1:31225933725:web:17fb6f90d2cf0a3f0f0974",
            measurementId: "G-EDQ9XD9RN7"
        };

        // تهيئة Firebase
        firebase.initializeApp(firebaseConfig1, "analytics");
        firebase.initializeApp(firebaseConfig2, "users");
        firebase.initializeApp(firebaseConfig3, "tasks");

        // الحصول على مراجع قاعدة البيانات
        const dbAnalytics = firebase.app("analytics").firestore();
        const dbUsers = firebase.app("users").firestore();
        const dbTasks = firebase.app("tasks").firestore();

        // DOM Elements
        const loadingIndicator = document.getElementById('loadingIndicator');
        const notification = document.getElementById('notification');
        const themeToggle = document.getElementById('toggleTheme');
        const themeIcon = document.getElementById('theme-icon');
        const themeText = document.getElementById('theme-text');

        // Chart instances
        let websiteChart, conversionChart, earningsChart, projectsChart, activityChart;

        // Data
        let analyticsData = {
            users: [],
            tasks: [],
            userActivity: [],
            taskStatus: {
                completed: 0,
                active: 0,
                overdue: 0,
                pending: 0
            },
            monthlyEarnings: [45000, 52000, 48000, 61000, 58000, 67000],
            projectStatus: [65, 45, 25, 15],
            weeklyActivity: [120, 85, 95, 110, 98, 134, 145]
        };

        // Theme management
        let currentTheme = 'dark';

        // Initialize the application
        document.addEventListener('DOMContentLoaded', function() {
            showLoading();
            initializeCharts();
            fetchData();
            setupEventListeners();
            loadThemeFromStorage();
        });