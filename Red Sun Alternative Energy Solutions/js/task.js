// متغيرات التطبيق الأساسية
let currentFilter = 'all';
let currentPriority = 'medium';
let tasks = [];
let editingTaskId = null;

// إعداد Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC-J-ij1-K0sswYVhTq_dH6rawEYCJelvQ",
    authDomain: "task-db-97136.firebaseapp.com",
    projectId: "task-db-97136",
    storageBucket: "task-db-97136.firebasestorage.app",
    messagingSenderId: "31225933725",
    appId: "1:31225933725:web:17fb6f90d2cf0a3f0f0974",
    measurementId: "G-EDQ9XD9RN7"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadUserPreferences();
    loadTasks();
    showNotification('info', 'مرحباً بك في نظام إدارة المهام', 3000);
});

function setupEventListeners() {
    const titleInput = document.getElementById('task-title');
    if (titleInput) {
        titleInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') addTask();
        });
    }
}

function loadUserPreferences() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) document.body.classList.add('dark-mode');
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    showNotification('info', isDark ? 'تم تفعيل الوضع الليلي' : 'تم تعطيل الوضع الليلي');
}

function setPriority(priority) {
    currentPriority = priority;
    document.querySelectorAll('.priority-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`.priority-btn.priority-${priority}`);
    if (activeBtn) activeBtn.classList.add('active');
}

// إصلاح دالة التصفية - المشكلة الرئيسية كانت هنا
function setFilter(filter) {
    currentFilter = filter;
    
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        const btnText = btn.textContent.trim();
        if (
            (filter === 'all' && btnText.includes('جميع')) ||
            (filter === 'completed' && btnText.includes('المكتملة')) ||
            (filter === 'active' && btnText.includes('قيد التنفيذ')) ||
            (filter === 'high' && btnText.includes('عالية الأولوية')) ||
            (filter === 'medium' && btnText.includes('متوسطة الأولوية')) ||
            (filter === 'low' && btnText.includes('منخفضة الأولوية'))
        ) {
            btn.classList.add('active');
        }
    });
    
    renderTasks();
}

function searchTasks(query) {
    if (!query.trim()) {
        renderTasks();
        return;
    }
    
    const filtered = tasks.filter(task => 
        task.title.toLowerCase().includes(query.toLowerCase()) || 
        (task.description && task.description.toLowerCase().includes(query.toLowerCase()))
    );
    
    renderTasks(filtered);
}

function addTask() {
    const title = document.getElementById('task-title').value.trim();
    const description = document.getElementById('task-description').value.trim();
    const dueDate = document.getElementById('task-due-date').value;
    
    if (!title) {
        showNotification('error', 'يرجى إدخال عنوان للمهمة');
        return;
    }
    
    const newTask = {
        title,
        description,
        priority: currentPriority,
        dueDate,
        completed: false,
        createdAt: new Date(),
        id: Date.now().toString()
    };
    
    db.collection('tasks').add(newTask)
        .then(() => {
            showNotification('success', 'تم إضافة المهمة بنجاح');
            resetForm();
            loadTasks();
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('error', 'حدث خطأ أثناء إضافة المهمة');
        });
}

function loadTasks() {
    showLoading(true);
    
    db.collection('tasks').orderBy('createdAt', 'desc').get()
        .then(snapshot => {
            tasks = [];
            snapshot.forEach(doc => {
                const task = doc.data();
                task.id = doc.id;
                tasks.push(task);
            });
            renderTasks();
            updateStats();
            showLoading(false);
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('error', 'حدث خطأ أثناء تحميل المهام');
            showLoading(false);
        });
}

function showLoading(show) {
    const tasksList = document.getElementById('tasks-list');
    if (show) {
        tasksList.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>جاري تحميل المهام...</p>
            </div>
        `;
    }
}

// دالة التصفية المحسّنة
function filterTasks(tasksData) {
    switch(currentFilter) {
        case 'completed':
            return tasksData.filter(t => t.completed);
        case 'active':
            return tasksData.filter(t => !t.completed);
        case 'high':
            return tasksData.filter(t => t.priority === 'high' && !t.completed);
        case 'medium':
            return tasksData.filter(t => t.priority === 'medium' && !t.completed);
        case 'low':
            return tasksData.filter(t => t.priority === 'low' && !t.completed);
        default:
            return tasksData;
    }
}

function renderTasks(customTasks = null) {
    const tasksList = document.getElementById('tasks-list');
    let tasksData = customTasks || filterTasks(tasks);
    
    if (tasksData.length === 0) {
        tasksList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <h3>لا توجد مهام لعرضها</h3>
                <p>جرب تغيير عامل التصفية أو أضف مهمة جديدة</p>
            </div>
        `;
        return;
    }
    
    const fragment = document.createDocumentFragment();
    tasksData.forEach(task => {
        fragment.appendChild(createTaskElement(task));
    });
    
    tasksList.innerHTML = '';
    tasksList.appendChild(fragment);
}

function createTaskElement(task) {
    const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('ar-EG') : 'غير محدد';
    const taskEl = document.createElement('div');
    taskEl.className = `task-item ${task.completed ? 'completed' : ''}`;
    
    taskEl.innerHTML = `
        <div class="task-content">
            <div class="task-title">
                ${task.completed ? '<i class="fas fa-check-circle" style="color: #28a745;"></i>' : '<i class="fas fa-circle" style="color: #ffc107;"></i>'}
                ${escapeHtml(task.title)}
            </div>
            ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
            <div class="task-meta">
                <span class="task-priority priority-${task.priority}">${getPriorityText(task.priority)}</span>
                <span><i class="fas fa-calendar"></i> ${dueDate}</span>
            </div>
        </div>
        <div class="task-actions">
            <button class="action-btn complete-btn" onclick="toggleTaskCompletion('${task.id}', ${!task.completed})" title="${task.completed ? 'إعادة فتح' : 'إكمال'}">
                <i class="fas fa-${task.completed ? 'undo' : 'check'}"></i>
            </button>
            <button class="action-btn edit-btn" onclick="editTask('${task.id}')" title="تعديل">
                <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete-btn" onclick="deleteTask('${task.id}')" title="حذف">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    return taskEl;
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getPriorityText(priority) {
    const priorities = {
        'high': 'عالي الأولوية',
        'medium': 'متوسط الأولوية', 
        'low': 'منخفض الأولوية'
    };
    return priorities[priority] || priority;
}

function updateStats() {
    document.getElementById('total-tasks').textContent = tasks.length;
    document.getElementById('completed-tasks').textContent = tasks.filter(t => t.completed).length;
    document.getElementById('pending-tasks').textContent = tasks.filter(t => !t.completed).length;
    document.getElementById('high-priority-tasks').textContent = tasks.filter(t => t.priority === 'high').length;
}

function toggleTaskCompletion(taskId, completed) {
    db.collection('tasks').doc(taskId).update({
        completed: completed,
        completedAt: completed ? new Date() : null
    })
    .then(() => {
        showNotification('success', completed ? 'تم إكمال المهمة' : 'تم إعادة فتح المهمة');
        loadTasks();
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('error', 'حدث خطأ أثناء تحديث المهمة');
    });
}

function deleteTask(taskId) {
    if (confirm('هل أنت متأكد من أنك تريد حذف هذه المهمة؟')) {
        db.collection('tasks').doc(taskId).delete()
            .then(() => {
                showNotification('success', 'تم حذف المهمة بنجاح');
                loadTasks();
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('error', 'حدث خطأ أثناء حذف المهمة');
            });
    }
}

function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-description').value = task.description || '';
    document.getElementById('task-due-date').value = task.dueDate || '';
    setPriority(task.priority);
    
    editingTaskId = taskId;
    
    const addButton = document.querySelector('.btn-success');
    addButton.innerHTML = '<i class="fas fa-save"></i> تحديث المهمة';
    addButton.onclick = () => updateTask(taskId);
    
    document.getElementById('task-title').scrollIntoView({ behavior: 'smooth' });
    showNotification('info', 'يمكنك الآن تعديل المهمة');
}

function updateTask(taskId) {
    const title = document.getElementById('task-title').value.trim();
    const description = document.getElementById('task-description').value.trim();
    const dueDate = document.getElementById('task-due-date').value;
    
    if (!title) {
        showNotification('error', 'يرجى إدخال عنوان للمهمة');
        return;
    }
    
    db.collection('tasks').doc(taskId).update({
        title,
        description,
        priority: currentPriority,
        dueDate,
        updatedAt: new Date()
    })
    .then(() => {
        showNotification('success', 'تم تحديث المهمة بنجاح');
        resetForm();
        loadTasks();
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('error', 'حدث خطأ أثناء تحديث المهمة');
    });
}

function resetForm() {
    document.getElementById('task-title').value = '';
    document.getElementById('task-description').value = '';
    document.getElementById('task-due-date').value = '';
    
    const addButton = document.querySelector('.btn-success');
    addButton.innerHTML = '<i class="fas fa-plus"></i> إضافة المهمة';
    addButton.onclick = addTask;
    
    editingTaskId = null;
}

function addSampleTasks() {
    const samples = [
        {
            title: "إنهاء تقرير المشروع",
            description: "إكمال التقرير النهائي لمشروع التخرج",
            priority: "high",
            dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
            completed: false,
            createdAt: new Date()
        },
        {
            title: "شراء مستلزمات المكتب",
            description: "شراء أوراق وأقلام جديدة",
            priority: "medium",
            dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            completed: false,
            createdAt: new Date()
        },
        {
            title: "ممارسة الرياضة",
            description: "الذهاب إلى النادي الرياضي",
            priority: "low",
            dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
            completed: true,
            createdAt: new Date()
        }
    ];
    
    let added = 0;
    samples.forEach(task => {
        db.collection('tasks').add(task).then(() => {
            added++;
            if (added === samples.length) {
                showNotification('success', 'تم إضافة المهام التجريبية');
                loadTasks();
            }
        });
    });
}

function showNotification(type, message, duration = 5000) {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = { success: 'check-circle', error: 'exclamation-circle', warning: 'exclamation-triangle', info: 'info-circle' };
    const titles = { success: 'نجاح', error: 'خطأ', warning: 'تحذير', info: 'معلومة' };
    
    notification.innerHTML = `
        <i class="fas fa-${icons[type]}"></i>
        <div class="notification-content">
            <div class="notification-title">${titles[type]}</div>
            <div>${message}</div>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => notification.remove(), duration);
}

// تصدير الدوال للاستخدام العالمي
window.toggleDarkMode = toggleDarkMode;
window.setPriority = setPriority;
window.setFilter = setFilter;
window.searchTasks = searchTasks;
window.addTask = addTask;
window.toggleTaskCompletion = toggleTaskCompletion;
window.deleteTask = deleteTask;
window.editTask = editTask;
window.updateTask = updateTask;
window.addSampleTasks = addSampleTasks;
window.loadTasks = loadTasks;