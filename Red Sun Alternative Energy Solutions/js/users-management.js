
// صوت الإشعارات
function playNotificationSound() {
    try {
        // إنشاء صوت إشعار جميل باستخدام Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // إنشاء تردد جميل للإشعار
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // تشكيل الصوت
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // تحديد الترددات
        oscillator1.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator1.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
        
        oscillator2.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator2.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
        
        // تشكيل الصوت ليكون لطيف
        oscillator1.type = 'sine';
        oscillator2.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        
        // تشغيل الصوت
        oscillator1.start(audioContext.currentTime);
        oscillator2.start(audioContext.currentTime + 0.05);
        
        oscillator1.stop(audioContext.currentTime + 0.4);
        oscillator2.stop(audioContext.currentTime + 0.45);
        
    } catch (error) {
        console.log('لا يمكن تشغيل صوت الإشعار:', error);
    }
}

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 نظام إدارة الوثائق - الإصدار 4.1 ( )');
    
    loadTheme();
    setupEventListeners();
    setupTabs();
    loadUsers();
    loadNotifications();
    loadAppointments();
    loadTasks();
    updateDashboard();
    checkConnectionStatus();
    
    // طلب إذن الإشعارات الصوتية
    if (window.AudioContext || window.webkitAudioContext) {
        document.addEventListener('click', function() {
            playNotificationSound();
        }, { once: true });
    }

    // تحميل سجل التعديلات
    const savedHistory = localStorage.getItem('editHistory');
    if (savedHistory) {
        editHistory = JSON.parse(savedHistory);
    }
    
    // إعداد الميزات الجديدة
    setupNewFeatures();
});

// =============================================
// وظائف Firestore - المستخدمين
// =============================================

async function loadUsers(search = '', status = 'all') {
    try {
        showLoading(true);
        let query = db.collection('users').orderBy('createdAt', 'desc');
        
        const snapshot = await query.get();
        users = [];
        
        snapshot.forEach(doc => {
            const userData = doc.data();
            userData.id = doc.id;
            
            // تطبيق البحث والتصفية محليًا
            const matchesSearch = !search || 
                userData.fullName?.toLowerCase().includes(search.toLowerCase()) ||
                userData.nationalId?.toLowerCase().includes(search.toLowerCase()) ||
                userData.phoneNumber?.toLowerCase().includes(search.toLowerCase());
            
            const matchesStatus = status === 'all' || 
                (status === 'complete' && isProjectComplete(userData)) ||
                (status === 'incomplete' && !isProjectComplete(userData));
            
            if (matchesSearch && matchesStatus) {
                users.push(userData);
            }
        });
        
        displayUsers();
        updateDashboard();
        console.log(`تم تحميل ${users.length} مستخدم من Firestore`);
        
    } catch (error) {
        console.error('فشل في تحميل المستخدمين:', error);
        showAlert('فشل في تحميل البيانات من الخادم', 'error');
        users = [];
        displayUsers();
    } finally {
        showLoading(false);
    }
}

async function addUser() {
    const formData = getFormData();
    
    if (!validateFormData(formData, true)) return;
    
    try {
        showLoading(true);
        
        // إنشاء مصفوفة الوثائق الفارغة
        const documents = Array(AppConfig.DOCUMENT_NAMES.length).fill(false);
        
        // إنشاء keywords للبحث
        const keywords = [
            formData.username.toLowerCase(),
            formData.nationalId.toLowerCase(),
            formData.phoneNumber.toLowerCase(),
            formData.address.toLowerCase()
        ];
        
        const userData = {
            fullName: formData.username,
            nationalId: formData.nationalId,
            address: formData.address,
            coordX: formData.coordX || null,
            coordY: formData.coordY || null,
            systemSize: parseFloat(formData.systemSize),
            systemPrice: parseFloat(formData.systemPrice),
            phoneNumber: formData.phoneNumber,
            password: formData.password,
            paymentMethod: formData.paymentMethod,
            paymentDetails: formData.paymentDetails,
commissionNotes: formData.commissionNotes,
	            commissionTransactionNumber: formData.commissionTransactionNumber || null, // الحقل الجديد
	            electricityTransaction: formData.electricityTransaction || null, // الحقل الجديد
	            companyNotes: formData.companyNotes,
            documents: documents,
            keywords: keywords,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        const docRef = await db.collection('users').add(userData);
        
        // إضافة سجل في التاريخ
        await addHistoryLog(docRef.id, formData.username, 'add', 'تم إضافة مستخدم جديد');
        
        // إرسال إشعار
        await addNotification('مستخدم جديد', `تم إضافة المستخدم ${formData.username} بنجاح`);
        
        clearForm();
        showAlert('تم إضافة المستخدم بنجاح!', 'success');
        loadUsers();
        
    } catch (error) {
        console.error('فشل في إضافة المستخدم:', error);
        showAlert('فشل في إضافة المستخدم: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// دالة تعديل المستخدم المعدلة
function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) {
        showAlert('لم يتم العثور على المستخدم', 'error');
        return;
    }
    
    currentEditUser = userId;
    
    // تعيين قيم الحقول في نموذج التعديل
    const fields = {
        'editUsername': user.fullName || '',
        'editPassword': '',
        'editNationalId': user.nationalId || '',
        'editAddress': user.address || '',
        'editCoordX': user.coordX || '',
        'editCoordY': user.coordY || '',
        'editSystemSize': user.systemSize || '',
        'editSystemPrice': user.systemPrice || '',
        'editPhoneNumber': user.phoneNumber || '',
        'editPaymentMethod': user.paymentMethod || 'cash',
        'editPaymentDetails': user.paymentDetails || '',
'editCommissionNotes': user.commissionNotes || '',
	        'editCommissionTransactionNumber': user.commissionTransactionNumber || '', // الحقل الجديد
	        'editElectricityTransaction': user.electricityTransaction || '', // الحقل الجديد
	        'editCompanyNotes': user.companyNotes || ''
    };
    
    // ملء الحقول
    Object.entries(fields).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
        }
    });
    
    // إظهار قسم التعديل وإخفاء قسم الإضافة
    document.getElementById('editSection').style.display = 'block';
    document.querySelector('.add-user-section').style.display = 'none';
    
    // التمرير إلى قسم التعديل
    document.getElementById('editSection').scrollIntoView({ behavior: 'smooth' });
    
    // إظهار إحصائيات التعديلات
    document.getElementById('editStats').style.display = 'block';
    updateEditStats();
}

// دالة إلغاء التعديل
function cancelEdit() {
    document.getElementById('editSection').style.display = 'none';
    document.querySelector('.add-user-section').style.display = 'block';
    document.getElementById('editStats').style.display = 'none';
    currentEditUser = null;
    
    // التمرير إلى الأعلى
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// دالة حفظ التغييرات المعدلة
async function saveChanges() {
    if (!currentEditUser) {
        showAlert('لم يتم تحديد مستخدم للتعديل', 'error');
        return;
    }
    
    try {
        showLoading(true);
        
        // جمع البيانات من النموذج
        const formData = {
            fullName: getValue('editUsername'),
            nationalId: getValue('editNationalId'),
            address: getValue('editAddress'),
            coordX: parseFloat(getValue('editCoordX')) || null,
            coordY: parseFloat(getValue('editCoordY')) || null,
            systemSize: parseFloat(getValue('editSystemSize')) || 0,
            systemPrice: parseFloat(getValue('editSystemPrice')) || 0,
            phoneNumber: getValue('editPhoneNumber'),
            paymentMethod: getValue('editPaymentMethod'),
            paymentDetails: getValue('editPaymentDetails'),
commissionNotes: getValue('editCommissionNotes'),
	            commissionTransactionNumber: getValue('editCommissionTransactionNumber') || null, // الحقل الجديد
	            electricityTransaction: getValue('editElectricityTransaction') || null, // الحقل الجديد
	            companyNotes: getValue('editCompanyNotes'),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // إذا تم إدخال كلمة مرور جديدة، أضفها
        const newPassword = getValue('editPassword');
        if (newPassword) {
            if (newPassword.length < 6) {
                showAlert('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
                return;
            }
            formData.password = newPassword;
        }

        // التحقق من صحة البيانات
        if (!formData.fullName || !formData.nationalId || !formData.address || 
            !formData.systemSize || !formData.systemPrice || !formData.phoneNumber) {
            showAlert('يرجى ملء جميع الحقول الأساسية', 'error');
            return;
        }

        // تحديث keywords للبحث
        formData.keywords = [
            formData.fullName.toLowerCase(),
            formData.nationalId.toLowerCase(),
            formData.phoneNumber.toLowerCase(),
            formData.address.toLowerCase()
        ];

        // تحديث البيانات في Firestore
        await db.collection('users').doc(currentEditUser).update(formData);
        
        // إضافة سجل في التاريخ
        await addHistoryLog(currentEditUser, formData.fullName, 'update', 'تم تحديث بيانات المستخدم');
        
        // إضافة إلى سجل التعديلات
        addToEditHistory(currentEditUser, formData.fullName);
        
        // تحديث إحصائيات التعديلات
        updateEditStats();
        
        // إرسال إشعار
        await addNotification('تعديل بيانات', `تم تحديث بيانات المستخدم ${formData.fullName} بنجاح`);

        showAlert('تم تحديث بيانات المستخدم بنجاح!', 'success');
        
        // إعادة تحميل البيانات
        await loadUsers();
        
        // إخفاء قسم التعديل وإظهار قسم الإضافة
        document.getElementById('editSection').style.display = 'none';
        document.querySelector('.add-user-section').style.display = 'block';

    } catch (error) {
        console.error('فشل في تحديث المستخدم:', error);
        showAlert('فشل في تحديث المستخدم: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// دالة إضافة إلى سجل التعديلات
function addToEditHistory(userId, userName) {
    const editRecord = {
        userId: userId,
        userName: userName,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString('ar-EG'),
        time: new Date().toLocaleTimeString('ar-EG')
    };
    
    editHistory.unshift(editRecord);
    
    // حفظ في localStorage
    localStorage.setItem('editHistory', JSON.stringify(editHistory));
    
    // تحديث الواجهة
    updateRecentEdits();
}

// دالة تحديث إحصائيات التعديلات
function updateEditStats() {
    // تحميل سجل التعديلات من localStorage
    const savedHistory = localStorage.getItem('editHistory');
    if (savedHistory) {
        editHistory = JSON.parse(savedHistory);
    }
    
    const now = new Date();
    const today = now.toLocaleDateString('ar-EG');
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // حساب الإحصائيات
    const todayEdits = editHistory.filter(edit => edit.date === today).length;
    const weekEdits = editHistory.filter(edit => new Date(edit.timestamp) >= weekAgo).length;
    const monthEdits = editHistory.filter(edit => new Date(edit.timestamp) >= monthAgo).length;
    const lastEdit = editHistory.length > 0 ? 
        `${editHistory[0].userName} - ${editHistory[0].time}` : 
        'لا توجد تعديلات';
    
    // تحديث الواجهة
    document.getElementById('todayEdits').textContent = todayEdits;
    document.getElementById('weekEdits').textContent = weekEdits;
    document.getElementById('monthEdits').textContent = monthEdits;
    document.getElementById('lastEdit').textContent = lastEdit;
    
    // تحديث قائمة آخر التعديلات
    updateRecentEdits();
}

// دالة تحديث قائمة آخر التعديلات
function updateRecentEdits() {
    const container = document.getElementById('recentEditedUsers');
    if (!container) return;
    
    const recentEdits = editHistory.slice(0, 5); // آخر 5 تعديلات
    
    if (recentEdits.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">لا توجد تعديلات حديثة</p>';
        return;
    }
    
    container.innerHTML = recentEdits.map(edit => `
        <div class="recent-edit-item">
            <span class="edit-user-name">${edit.userName}</span>
            <span class="edit-time">${edit.time} - ${edit.date}</span>
        </div>
    `).join('');
}

async function deleteUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) {
        showAlert('لم يتم العثور على المستخدم', 'error');
        return;
    }

    if (confirm(`هل أنت متأكد من أنك تريد حذف المستخدم "${user.fullName}"؟\nسيتم حذف جميع بياناته نهائياً.`)) {
        try {
            showLoading(true);
            
            await db.collection('users').doc(userId).delete();
            
            // إضافة سجل في التاريخ
            await addHistoryLog(userId, user.fullName, 'delete', 'تم حذف المستخدم');
            
            showAlert('تم حذف المستخدم بنجاح', 'success');
            loadUsers();
            
        } catch (error) {
            console.error('فشل في حذف المستخدم:', error);
            showAlert('فشل في حذف المستخدم: ' + error.message, 'error');
        } finally {
            showLoading(false);
        }
    }
}

async function toggleDocument(userId, docIndex) {
    try {
        const user = users.find(u => u.id === userId);
        if (!user) return;
        
        const newDocuments = [...user.documents];
        newDocuments[docIndex] = !newDocuments[docIndex];
        
        await db.collection('users').doc(userId).update({
            documents: newDocuments,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // تحديث البيانات محلياً
        user.documents = newDocuments;
        
        // إضافة سجل في التاريخ
        const docName = AppConfig.DOCUMENT_NAMES[docIndex];
        const status = newDocuments[docIndex] ? 'مكتملة' : 'غير مكتملة';
        await addHistoryLog(userId, user.fullName, 'update', `تم تحديث الوثيقة "${docName}" إلى ${status}`);
        
        // إرسال إشعار
        if (newDocuments[docIndex]) {
            await addNotification('وثيقة مكتملة', `تم إكمال الوثيقة "${docName}" للمستخدم ${user.fullName}`);
        }
        
        displayUsers();
        updateDashboard();
        
        const docStatus = newDocuments[docIndex] ? 'مكتملة' : 'غير مكتملة';
        showAlert(`تم تحديث حالة الوثيقة إلى: ${docStatus}`, 'success');
        
    } catch (error) {
        console.error('فشل في تحديث الوثيقة:', error);
        showAlert('فشل في تحديث الوثيقة: ' + error.message, 'error');
    }
}

// =============================================
// وظائف المواعيد
// =============================================

async function loadAppointments() {
    try {
        const snapshot = await db.collection('appointments')
            .orderBy('date', 'asc')
            .get();
        
        appointments = [];
        snapshot.forEach(doc => {
            const appointmentData = doc.data();
            appointmentData.id = doc.id;
            appointments.push(appointmentData);
        });
        
        displayAppointments();
        
    } catch (error) {
        console.error('فشل في تحميل المواعيد:', error);
    }
}

async function addAppointment() {
    const title = getValue('eventTitle');
    const date = getValue('eventDate');
    const time = getValue('eventTime');
    const userId = getValue('eventUser');
    
    if (!title || !date || !time) {
        showAlert('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    try {
        showLoading(true);
        
        const appointmentData = {
            title: title,
            date: date,
            time: time,
            userId: userId || null,
            status: 'scheduled',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('appointments').add(appointmentData);
        
        // إرسال إشعار
        await addNotification('موعد جديد', `تم إنشاء موعد: ${title} في ${date} الساعة ${time}`);
        
        // مسح النموذج
        document.getElementById('eventTitle').value = '';
        document.getElementById('eventDate').value = '';
        document.getElementById('eventTime').value = '';
        document.getElementById('eventUser').value = '';
        
        showAlert('تم إضافة الموعد بنجاح!', 'success');
        loadAppointments();
        
    } catch (error) {
        console.error('فشل في إضافة الموعد:', error);
        showAlert('فشل في إضافة الموعد: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

function displayAppointments() {
    const container = document.getElementById('appointmentsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (appointments.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;">لا توجد مواعيد مجدولة</div>';
        return;
    }
    
    appointments.forEach(appointment => {
        const appointmentDiv = document.createElement('div');
        appointmentDiv.className = 'appointment-item';
        appointmentDiv.style.cssText = `
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        `;
        
        const userName = appointment.userId ? 
            (users.find(u => u.id === appointment.userId)?.fullName || 'مستخدم محذوف') : 
            'غير محدد';
        
        appointmentDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <h4 style="margin: 0 0 10px 0; color: #2c3e50;">${appointment.title}</h4>
                    <p style="margin: 5px 0; color: #666;">📅 التاريخ: ${appointment.date}</p>
                    <p style="margin: 5px 0; color: #666;">🕐 الوقت: ${appointment.time}</p>
                    <p style="margin: 5px 0; color: #666;">👤 المستخدم: ${userName}</p>
                </div>
                <div>
                    <button onclick="deleteAppointment('${appointment.id}')" 
                            style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                        حذف
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(appointmentDiv);
    });
}

async function deleteAppointment(appointmentId) {
    if (confirm('هل تريد حذف هذا الموعد؟')) {
        try {
            await db.collection('appointments').doc(appointmentId).delete();
            showAlert('تم حذف الموعد بنجاح', 'success');
            loadAppointments();
        } catch (error) {
            console.error('فشل في حذف الموعد:', error);
            showAlert('فشل في حذف الموعد', 'error');
        }
    }
}

// =============================================
// وظائف المهام
// =============================================

async function loadTasks() {
    try {
        const snapshot = await db.collection('tasks')
            .orderBy('createdAt', 'desc')
            .get();
        
        tasks = [];
        snapshot.forEach(doc => {
            const taskData = doc.data();
            taskData.id = doc.id;
            tasks.push(taskData);
        });
        
        displayTasks();
        
    } catch (error) {
        console.error('فشل في تحميل المهام:', error);
    }
}

async function addTask() {
    const title = getValue('taskTitle');
    const description = getValue('taskDescription');
    const priority = getValue('taskPriority');
    const dueDate = getValue('taskDueDate');
    const assignedTo = getValue('taskAssignedTo');
    
    if (!title) {
        showAlert('يرجى إدخال عنوان المهمة', 'error');
        return;
    }
    
    try {
        showLoading(true);
        
        const taskData = {
            title: title,
            description: description,
            priority: priority,
            dueDate: dueDate,
            assignedTo: assignedTo,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('tasks').add(taskData);
        
        // إرسال إشعار
        await addNotification('مهمة جديدة', `تم إنشاء مهمة: ${title}`);
        
        // مسح النموذج
        document.getElementById('taskTitle').value = '';
        document.getElementById('taskDescription').value = '';
        document.getElementById('taskPriority').value = 'medium';
        document.getElementById('taskDueDate').value = '';
        document.getElementById('taskAssignedTo').value = '';
        
        showAlert('تم إضافة المهمة بنجاح!', 'success');
        loadTasks();
        
    } catch (error) {
        console.error('فشل في إضافة المهمة:', error);
        showAlert('فشل في إضافة المهمة: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

function displayTasks() {
    const container = document.getElementById('tasksList');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (tasks.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;">لا توجد مهام</div>';
        return;
    }
    
    tasks.forEach(task => {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task-item';
        
        const priorityColors = {
            high: '#e74c3c',
            medium: '#f39c12',
            low: '#27ae60'
        };
        
        const priorityTexts = {
            high: 'عالية',
            medium: 'متوسطة',
            low: 'منخفضة'
        };
        
        const statusTexts = {
            pending: 'قيد الانتظار',
            in_progress: 'قيد التنفيذ',
            completed: 'مكتملة'
        };
        
        taskDiv.style.cssText = `
            background: white;
            border: 1px solid #ddd;
            border-left: 4px solid ${priorityColors[task.priority] || '#3498db'};
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        `;
        
        taskDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 10px 0; color: #2c3e50;">${task.title}</h4>
                    ${task.description ? `<p style="margin: 5px 0; color: #555;">${task.description}</p>` : ''}
                    <div style="margin: 10px 0;">
                        <span style="display: inline-block; background: ${priorityColors[task.priority] || '#3498db'}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-left: 5px;">
                            أولوية: ${priorityTexts[task.priority] || 'متوسطة'}
                        </span>
                        <span style="display: inline-block; background: #95a5a6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-left: 5px;">
                            الحالة: ${statusTexts[task.status] || 'قيد الانتظار'}
                        </span>
                    </div>
                    ${task.dueDate ? `<p style="margin: 5px 0; color: #666; font-size: 14px;">📅 تاريخ الاستحقاق: ${task.dueDate}</p>` : ''}
                    ${task.assignedTo ? `<p style="margin: 5px 0; color: #666; font-size: 14px;">👤 المكلف: ${task.assignedTo}</p>` : ''}
                </div>
                <div style="display: flex; gap: 5px;">
                    <select onchange="updateTaskStatus('${task.id}', this.value)" style="padding: 5px; border: 1px solid #ddd; border-radius: 4px;">
                        <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>قيد الانتظار</option>
                        <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>قيد التنفيذ</option>
                        <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>مكتملة</option>
                    </select>
                    <button onclick="deleteTask('${task.id}')" 
                            style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                        حذف
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(taskDiv);
    });
}

async function updateTaskStatus(taskId, newStatus) {
    try {
        await db.collection('tasks').doc(taskId).update({
            status: newStatus,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showAlert('تم تحديث حالة المهمة بنجاح', 'success');
        loadTasks();
        
    } catch (error) {
        console.error('فشل في تحديث المهمة:', error);
        showAlert('فشل في تحديث المهمة', 'error');
    }
}

async function deleteTask(taskId) {
    if (confirm('هل تريد حذف هذه المهمة؟')) {
        try {
            await db.collection('tasks').doc(taskId).delete();
            showAlert('تم حذف المهمة بنجاح', 'success');
            loadTasks();
        } catch (error) {
            console.error('فشل في حذف المهمة:', error);
            showAlert('فشل في حذف المهمة', 'error');
        }
    }
}

// =============================================
// وظائف التقارير
// =============================================

function generateReport() {
    const reportType = getValue('reportType');
    const dateFrom = getValue('dateFrom');
    const dateTo = getValue('dateTo');
    
    if (!reportType) {
        showAlert('يرجى اختيار نوع التقرير', 'error');
        return;
    }
    
    let reportData = [];
    let reportTitle = '';
    
    switch (reportType) {
        case 'users':
            reportData = users.map(user => {
                const stats = getCompletionStats(user);
                return {
                    'الاسم': user.fullName,
                    'رقم الهوية': user.nationalId,
                    'الهاتف': user.phoneNumber,
                    'العنوان': user.address,
                    'حجم النظام (كيلوواط)': user.systemSize,
                    'السعر (دينار)': user.systemPrice,
                    'رقم معاملة المفوضية': user.commissionTransactionNumber || 'لا يوجد',
                    'معاملة الكهرباء': user.electricityTransaction || 'لا يوجد',
                    'نسبة الإكمال': `${stats.percentage}%`,
                    'الوثائق المكتملة': `${stats.completed}/${stats.total}`,
                    'الحالة': isProjectComplete(user) ? 'مكتمل' : 'قيد الإنجاز'
                };
            });
            reportTitle = 'تقرير المستخدمين';
            break;
            
        case 'projects':
            const completedProjects = users.filter(user => isProjectComplete(user)).length;
            const inProgressProjects = users.length - completedProjects;
            
            reportData = [
                { 'المؤشر': 'إجمالي المشاريع', 'القيمة': users.length },
                { 'المؤشر': 'المشاريع المكتملة', 'القيمة': completedProjects },
                { 'المؤشر': 'المشاريع قيد الإنجاز', 'القيمة': inProgressProjects },
                { 'المؤشر': 'نسبة الإنجاز', 'القيمة': `${Math.round((completedProjects / users.length) * 100)}%` }
            ];
            reportTitle = 'تقرير المشاريع';
            break;
            
        case 'energy':
            const totalEnergy = users.reduce((sum, user) => sum + (parseFloat(user.systemSize) || 0), 0);
            const avgEnergy = users.length > 0 ? totalEnergy / users.length : 0;
            
            reportData = [
                { 'المؤشر': 'إجمالي الطاقة المنتجة', 'القيمة': `${totalEnergy.toFixed(2)} كيلوواط` },
                { 'المؤشر': 'متوسط الطاقة للنظام', 'القيمة': `${avgEnergy.toFixed(2)} كيلوواط` },
                { 'المؤشر': 'عدد أنظمة الطاقة', 'القيمة': users.length }
            ];
            reportTitle = 'تقرير الطاقة المنتجة';
            break;
            
        case 'financial':
            const totalRevenue = users.reduce((sum, user) => sum + (parseFloat(user.systemPrice) || 0), 0);
            const avgSystemPrice = users.length > 0 ? totalRevenue / users.length : 0;
            
            reportData = [
                { 'المؤشر': 'إجمالي الإيرادات', 'القيمة': `${totalRevenue.toLocaleString()} دينار` },
                { 'المؤشر': 'متوسط سعر النظام', 'القيمة': `${avgSystemPrice.toLocaleString()} دينار` },
                { 'المؤشر': 'أعلى سعر نظام', 'القيمة': `${Math.max(...users.map(u => parseFloat(u.systemPrice) || 0)).toLocaleString()} دينار` },
                { 'المؤشر': 'أقل سعر نظام', 'القيمة': `${Math.min(...users.map(u => parseFloat(u.systemPrice) || 0)).toLocaleString()} دينار` }
            ];
            reportTitle = 'التقرير المالي';
            break;
            
        default:
            showAlert('نوع تقرير غير صحيح', 'error');
            return;
    }
    
    displayReport(reportData, reportTitle);
}

function displayReport(data, title) {
    const container = document.getElementById('reportResult');
    if (!container) return;
    
    if (data.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;">لا توجد بيانات للتقرير</div>';
        return;
    }
    
    let tableHTML = `
        <div style="margin-bottom: 20px;">
            <h3>${title}</h3>
            <p>تم إنشاؤه في: ${new Date().toLocaleString('ar-EG')}</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; background: white;">
            <thead>
                <tr style="background: #3498db; color: white;">
    `;
    
    // إضافة رؤوس الجدول
    const headers = Object.keys(data[0]);
    headers.forEach(header => {
        tableHTML += `<th style="padding: 12px; text-align: right; border: 1px solid #ddd;">${header}</th>`;
    });
    
    tableHTML += `
                </tr>
            </thead>
            <tbody>
    `;
    
    // إضافة بيانات الجدول
    data.forEach((row, index) => {
        tableHTML += `<tr style="background: ${index % 2 === 0 ? '#f9f9f9' : 'white'};">`;
        headers.forEach(header => {
            tableHTML += `<td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${row[header] || ''}</td>`;
        });
        tableHTML += '</tr>';
    });
    
    tableHTML += `
            </tbody>
        </table>
        <div style="margin-top: 20px; display: flex; gap: 10px;">
            <button onclick="exportToExcel()" class="btn btn-success">
                <i class="fas fa-file-excel"></i> تصدير إلى Excel
            </button>
            <button onclick="exportToPDF()" class="btn btn-danger">
                <i class="fas fa-file-pdf"></i> تصدير إلى PDF
            </button>
            <button onclick="printReport()" class="btn btn-info">
                <i class="fas fa-print"></i> طباعة
            </button>
        </div>
    `;
    
    container.innerHTML = tableHTML;
}

// =============================================
// وظائف التصدير
// =============================================

function exportToExcel() {
    const table = document.querySelector('#reportResult table');
    if (!table) {
        showAlert('لا توجد بيانات للتصدير', 'error');
        return;
    }
    
    try {
        let csvContent = '\uFEFF'; // BOM for UTF-8
        const rows = table.querySelectorAll('tr');
        
        rows.forEach(row => {
            const cols = row.querySelectorAll('th, td');
            const rowData = Array.from(cols).map(col => {
                return '"' + col.textContent.replace(/"/g, '""') + '"';
            });
            csvContent += rowData.join(',') + '\n';
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `تقرير_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showAlert('تم تصدير التقرير إلى Excel بنجاح', 'success');
        
    } catch (error) {
        console.error('فشل في التصدير:', error);
        showAlert('فشل في تصدير التقرير', 'error');
    }
}

function exportToPDF() {
    try {
        const printContent = document.getElementById('reportResult').innerHTML;
        const originalContent = document.body.innerHTML;
        
        const printWindow = window.open('', '', 'width=800,height=600');
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
            <head>
                <meta charset="UTF-8">
                <title>تقرير</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; direction: rtl; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { padding: 10px; border: 1px solid #ddd; text-align: right; }
                    th { background: #3498db; color: white; }
                    h3 { color: #2c3e50; margin-bottom: 10px; }
                    button { display: none; }
                    @media print {
                        button { display: none !important; }
                    }
                </style>
            </head>
            <body>
                ${printContent}
                <script>
                    window.onload = function() {
                        window.print();
                        window.close();
                    }
                </script>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        
        showAlert('جاري فتح نافذة الطباعة...', 'success');
        
    } catch (error) {
        console.error('فشل في إنشاء PDF:', error);
        showAlert('فشل في إنشاء PDF', 'error');
    }
}

function printReport() {
    const printContent = document.getElementById('reportResult').innerHTML;
    const printWindow = window.open('', '', 'width=800,height=600');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>طباعة التقرير</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; direction: rtl; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 8px; border: 1px solid #ddd; text-align: right; font-size: 12px; }
                th { background: #f0f0f0; }
                button { display: none; }
            </style>
        </head>
        <body>
            ${printContent}
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(() => window.close(), 1000);
                }
            </script>
        </body>
        </html>
    `);
    
    printWindow.document.close();
}

// =============================================
// وظائف الإشعارات مع الصوت
// =============================================

async function loadNotifications() {
    try {
        const snapshot = await db.collection('notifications')
            .orderBy('time', 'desc')
            .limit(50)
            .get();
        
        const previousCount = notifications.length;
        notifications = [];
        
        snapshot.forEach(doc => {
            const notificationData = doc.data();
            notificationData.id = doc.id;
            notifications.push(notificationData);
        });
        
        // تشغيل الصوت إذا كان هناك إشعارات جديدة
        if (notifications.length > previousCount && previousCount > 0) {
            playNotificationSound();
        }
        
        displayNotifications();
        updateNotificationBell();
        
    } catch (error) {
        console.error('فشل في تحميل الإشعارات:', error);
    }
}

async function addNotification(title, body) {
    try {
        await db.collection('notifications').add({
            title: title,
            body: body,
            read: false,
            time: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // تشغيل صوت الإشعار
        playNotificationSound();
        
        loadNotifications();
        
    } catch (error) {
        console.error('فشل في إضافة الإشعار:', error);
    }
}

async function markAllAsRead() {
    try {
        const batch = db.batch();
        
        notifications.forEach(notification => {
            if (!notification.read) {
                const notificationRef = db.collection('notifications').doc(notification.id);
                batch.update(notificationRef, { read: true });
            }
        });
        
        await batch.commit();
        loadNotifications();
        
    } catch (error) {
        console.error('فشل في تحديث الإشعارات:', error);
    }
}

function displayNotifications() {
    const notificationList = document.getElementById('notificationList');
    if (!notificationList) return;
    
    notificationList.innerHTML = '';
    
    if (notifications.length === 0) {
        notificationList.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">لا توجد إشعارات</div>';
        return;
    }
    
    notifications.forEach(notification => {
        const notificationItem = document.createElement('div');
        notificationItem.className = `notification-item ${!notification.read ? 'unread' : ''}`;
        
        const timeString = notification.time ? 
            new Date(notification.time.seconds * 1000).toLocaleString('ar-EG') : 
            'الآن';
            
        notificationItem.innerHTML = `
            <div style="font-weight: ${!notification.read ? 'bold' : 'normal'}">
                <div style="margin-bottom: 5px;">${notification.title}</div>
                <div style="font-size: 0.9em; color: #666;">${notification.body}</div>
                <div style="font-size: 0.8em; color: #999; margin-top: 5px;">${timeString}</div>
            </div>
        `;
        
        notificationList.appendChild(notificationItem);
    });
}

function updateNotificationBell() {
    const unreadCount = notifications.filter(n => !n.read).length;
    const notificationCount = document.getElementById('notificationCount');
    const notificationBell = document.getElementById('notificationBell');
    
    if (notificationCount) {
        notificationCount.textContent = unreadCount;
        notificationCount.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
    
    if (notificationBell) {
        notificationBell.onclick = toggleNotificationPanel;
    }
}

function toggleNotificationPanel() {
    const panel = document.getElementById('notificationPanel');
    if (panel) {
        panel.style.display = panel.style.display === 'none' || !panel.style.display ? 'block' : 'none';
    }
}

// =============================================
// اختبار قاعدة البيانات
// =============================================

async function testDatabaseConnection() {
    try {
        showLoading(true);
        
        // اختبار الكتابة
        const testData = {
            message: 'اختبار الاتصال',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        const docRef = await db.collection('connection_test').add(testData);
        
        // اختبار القراءة
        const doc = await db.collection('connection_test').doc(docRef.id).get();
        
        if (doc.exists) {
            // حذف البيانات التجريبية
            await db.collection('connection_test').doc(docRef.id).delete();
            
            showAlert('✅ الاتصال بقاعدة البيانات يعمل بشكل ممتاز!', 'success');
            
            // إضافة إحصائيات الاتصال
            const connectionInfo = `
                📊 معلومات الاتصال:
                • معرف المشروع: ${firebaseConfig.projectId}
                • حالة الاتصال: متصل ✅
                • سرعة الاستجابة: سريعة
                • آخر اختبار: ${new Date().toLocaleString('ar-EG')}
            `;
            
            console.log(connectionInfo);
            
        } else {
            throw new Error('فشل في قراءة البيانات التجريبية');
        }
        
    } catch (error) {
        console.error('خطأ في اختبار قاعدة البيانات:', error);
        showAlert('❌ فشل في الاتصال بقاعدة البيانات: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// =============================================
// وظائف التاريخ
// =============================================

async function addHistoryLog(userId, userName, action, details) {
    try {
        await db.collection('history').add({
            userId: userId,
            userName: userName,
            action: action,
            details: details,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('فشل في إضافة سجل التاريخ:', error);
    }
}

// =============================================
// وظائف إضافة البيانات التجريبية
// =============================================

async function addDummyUsers() {
    const dummyUsers = [
        {fullName:"المهندس فاروق المعالي",nationalId:"12345678901234",address:"العقبة – التاسعه اهالي",coordX:35.8737,coordY:31.9632,systemSize:5.5,systemPrice:4200,phoneNumber:"0791234567",password:"123456",documents:[true,true,false,true,false,false,true,false,true,true,false,false,true,false,false]},
        {fullName:"ليلى خالد",nationalId:"98765432109876",address:"الزرقاء – الوسط الجديد",coordX:36.0833,coordY:32.05,systemSize:3,systemPrice:2500,phoneNumber:"0789876543",password:"654321",documents:[true,true,true,true,true,false,true,false,true,true,true,false,true,false,false]},
        {fullName:"يوسف علي",nationalId:"11223344556677",address:"إربد – حي النزهة",coordX:35.85,coordY:32.55,systemSize:7.2,systemPrice:5500,phoneNumber:"0771122334",password:"abc123",documents:[true,true,true,true,true,true,true,true,true,true,true,true,true,true,true]},
        {fullName:"نور حسن",nationalId:"22334455667788",address:"الكرك – المدينة القديمة",coordX:35.7,coordY:31.18,systemSize:4,systemPrice:3100,phoneNumber:"0792233445",password:"noor2024",documents:[false,false,false,false,false,false,true,false,true,false,false,false,false,false,false]},
        {fullName:"أحمد سعيد",nationalId:"33445566778899",address:"معان – الشمالي",coordX:35.7333,coordY:30.2,systemSize:6,systemPrice:4700,phoneNumber:"0783344556",password:"ahmed123",documents:[true,true,true,true,false,false,true,false,true,true,false,false,true,false,false]}
    ];
    
    try {
        showLoading(true);
        const batch = db.batch();
        
        dummyUsers.forEach(user => {
            // إنشاء keywords للبحث
            const keywords = [
                user.fullName.toLowerCase(),
                user.nationalId.toLowerCase(),
                user.phoneNumber.toLowerCase(),
                user.address.toLowerCase()
            ];
            
            const userData = {
                ...user,
                keywords: keywords,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            const userRef = db.collection('users').doc();
            batch.set(userRef, userData);
        });
        
        await batch.commit();
        showAlert(`تم إضافة ${dummyUsers.length} مستخدم تجريبي بنجاح!`, 'success');
        loadUsers();
        
    } catch (error) {
        console.error('فشل في إضافة المستخدمين التجريبيين:', error);
        showAlert('فشل في إضافة المستخدمين التجريبيين: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function addDummyNotifications() {
    const dummyNotifications = [
        {title: "مشروع جديد", body: "تم استلام طلب تركيب نظام 6 كيلو وات للمهندس فاروق", read: false, time: firebase.firestore.FieldValue.serverTimestamp()},
        {title: "وثيقة مكتملة", body: "العميل يوسف علي أتمّ جميع الوثائق المطلوبة.", read: false, time: firebase.firestore.FieldValue.serverTimestamp()},
        {title: "موعد غداً", body: "لديك زيارة ميدانية الساعة 10 صباحاً لعنوان العقبة.", read: false, time: firebase.firestore.FieldValue.serverTimestamp()},
        {title: "تأخير في الترخيص", body: "تأخر صدور الترخيص من الجهة المنظمة لمدة 3 أيام.", read: true, time: firebase.firestore.FieldValue.serverTimestamp()},
        {title: "دفعة مالية", body: "تم استلام دفعة جديدة بقيمة 1,500 دينار من العميل رامي.", read: false, time: firebase.firestore.FieldValue.serverTimestamp()}
    ];
    
    try {
        showLoading(true);
        const batch = db.batch();
        
        dummyNotifications.forEach(notification => {
            const notificationRef = db.collection('notifications').doc();
            batch.set(notificationRef, notification);
        });
        
        await batch.commit();
        showAlert(`تم إضافة ${dummyNotifications.length} إشعار تجريبي بنجاح!`, 'success');
        loadNotifications();
        
    } catch (error) {
        console.error('فشل في إضافة الإشعارات التجريبية:', error);
        showAlert('فشل في إضافة الإشعارات التجريبية: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// =============================================
// وظائف مساعدة
// =============================================

function getValue(elementId) {
    const element = document.getElementById(elementId);
    return element ? element.value.trim() : '';
}

function getFormData() {
    return {
        username: getValue('username'),
        password: getValue('password'),
        nationalId: getValue('firstName'),
        address: getValue('address'),
        coordX: getValue('coordX'),
        coordY: getValue('coordY'),
        systemSize: getValue('systemSize'),
        systemPrice: getValue('systemPrice'),
        phoneNumber: getValue('phoneNumber'),
        paymentMethod: getValue('paymentMethod'),
        paymentDetails: getValue('paymentDetails'),
        commissionNotes: getValue('commissionNotes'),
        companyNotes: getValue('companyNotes')
    };
}

function validateFormData(formData, isNewUser = false) {
    const requiredFields = ['username', 'nationalId', 'address', 'systemSize', 'systemPrice', 'phoneNumber'];
    
    // التحقق من الحقول المطلوبة
    for (const field of requiredFields) {
        if (!formData[field] && formData[field] !== 0) {
            showAlert('يرجى ملء جميع الحقول الأساسية', 'error');
            return false;
        }
    }
    
    // التحقق من كلمة المرور للمستخدمين الجدد فقط
    if (isNewUser && (!formData.password || formData.password.length < 6)) {
        showAlert('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
        return false;
    }
    
    // التحقق من تنسيق رقم الهاتف
    const cleanPhone = formData.phoneNumber.replace(/[\s-]/g, '');
    if (!AppConfig.PHONE_PATTERN.test(cleanPhone)) {
        showAlert('رقم الهاتف يجب أن يكون بتنسيق أردني صحيح', 'error');
        return false;
    }
    
    return true;
}

function clearForm() {
    const formFields = ['username', 'password', 'firstName', 'address', 'coordX', 'coordY', 'systemSize', 'systemPrice', 'phoneNumber', 'paymentMethod', 'paymentDetails', 'commissionNotes', 'companyNotes'];
    formFields.forEach(field => {
        const element = document.getElementById(field);
        if (element) element.value = '';
    });
}

function isProjectComplete(user) {
    if (!user.documents || !Array.isArray(user.documents)) return false;
    return user.documents.every(doc => doc === true);
}

function getCompletionStats(user) {
    if (!user.documents || !Array.isArray(user.documents)) {
        return { completed: 0, total: AppConfig.DOCUMENT_NAMES.length, percentage: 0 };
    }
    
    const completed = user.documents.filter(Boolean).length;
    const total = AppConfig.DOCUMENT_NAMES.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    return { 
        completed, 
        total, 
        percentage: Math.round(percentage) 
    };
}

async function filterUsers() {
    const searchTerm = getValue('searchInput').toLowerCase();
    const statusFilterValue = getValue('statusFilter') || 'all';
    
    await loadUsers(searchTerm, statusFilterValue);
}

// =============================================
// وظائف العرض والواجهة
// =============================================

function displayUsers(usersToDisplay = users) {
    const container = document.getElementById('usersContainer');
    if (!container) {
        console.error('لم يتم العثور على حاوية المستخدمين');
        return;
    }

    container.innerHTML = '';

    if (usersToDisplay.length === 0) {
        container.innerHTML = `
            <div class="no-users-message fade-in">
                <i class="fas fa-users" style="font-size: 48px; color: #ccc; margin-bottom: 16px;"></i>
                <p>لم يتم العثور على مستخدمين.</p>
                <button class="btn btn-primary" onclick="addDummyUsers()" style="margin-top: 20px;">
                    <i class="fas fa-plus"></i> إضافة مستخدمين تجريبيين
                </button>
            </div>
        `;
        return;
    }

    usersToDisplay.forEach((user, index) => {
        const userStatus = isProjectComplete(user) ? 'complete' : 'incomplete';
        const stats = getCompletionStats(user);
        
        const userCard = document.createElement('div');
        userCard.className = 'user-card fade-in';
        userCard.style.animationDelay = `${index * 0.05}s`;
        
        userCard.innerHTML = `
            <div class="user-header">
                <div class="user-info">
                    <h3><i class="fas fa-user"></i> ${user.fullName || 'غير محدد'}</h3>
                    <p><i class="fas fa-id-card"></i> رقم الهوية: ${user.nationalId || 'غير محدد'}</p>
                    <p><i class="fas fa-map-marker-alt"></i> العنوان: ${user.address || 'غير محدد'}</p>
                    ${user.coordX && user.coordY ? `<p><i class="fas fa-globe"></i> الإحداثيات: (X: ${user.coordX}, Y: ${user.coordY})</p>` : ''}
                    <p><i class="fas fa-solar-panel"></i> حجم النظام: ${user.systemSize || '0'} كيلوواط</p>
                    <p><i class="fas fa-dollar-sign"></i> السعر: ${user.systemPrice ? parseFloat(user.systemPrice).toLocaleString() : '0'}</p>
                    <p><i class="fas fa-phone"></i> الهاتف: ${user.phoneNumber || 'غير محدد'}</p>
                    <p><i class="fas fa-key"></i> كلمة المرور: 
                        <span id="password-text-${user.id}" class="password-text">${user.password || 'غير محددة'}</span>
                        <button onclick="toggleUserPasswordVisibility('${user.id}')" class="password-toggle-btn" title="إظهار/إخفاء">
                            <i class="fas fa-eye"></i>
                        </button>
                    </p>
                    ${user.paymentMethod ? `<p><i class="fas fa-credit-card"></i> طريقة الدفع: ${user.paymentMethod}</p>` : ''}
                    ${user.paymentDetails ? `<p><i class="fas fa-info-circle"></i> تفاصيل الدفع: ${user.paymentDetails}</p>` : ''}
                    ${user.commissionNotes ? `<p><i class="fas fa-sticky-note"></i> ملاحظات المفوضية: ${user.commissionNotes}</p>` : ''}
                    ${user.companyNotes ? `<p><i class="fas fa-sticky-note"></i> ملاحظات الشركة: ${user.companyNotes}</p>` : ''}
                </div>
                <div class="user-actions">
                    <div class="user-status status-${userStatus}">
                        ${userStatus === 'complete' ? '✅ مكتمل' : '⏳ قيد الإنجاز'}
                    </div>
                    <button class="edit-btn" onclick="editUser('${user.id}')" title="تعديل المستخدم">
                        <i class="fas fa-edit"></i> تعديل
                    </button>
                    <button class="delete-btn" onclick="deleteUser('${user.id}')" title="حذف المستخدم">
                        <i class="fas fa-trash"></i> حذف
                    </button>
                </div>
            </div>
            
            <div class="documents-section">
                <h4><i class="fas fa-file-alt"></i> الوثائق المطلوبة:</h4>
                <div class="documents-grid">
                    ${AppConfig.DOCUMENT_NAMES.map((name, index) => `
                        <div class="document-item ${user.documents && user.documents[index] ? 'completed' : 'incomplete'}" 
                             onclick="toggleDocument('${user.id}', ${index})"
                             title="انقر لتغيير حالة الوثيقة">
                            <div class="document-number">${index + 1}</div>
                            <div class="document-name">${name}</div>
                            <div class="document-status">
                                ${user.documents && user.documents[index] ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-clock"></i>'}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="progress-section">
                <div class="progress-info">
                    <span><i class="fas fa-chart-pie"></i> التقدم: <strong>${stats.completed}/${stats.total}</strong></span>
                    <span class="progress-percentage">${stats.percentage}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress" style="width: ${stats.percentage}%"></div>
                </div>
            </div>
        `;
        
        container.appendChild(userCard);
    });
}

function updateDashboard() {
    if (users.length === 0) return;
    
    const totalUsers = users.length;
    const completedProjects = users.filter(user => isProjectComplete(user)).length;
    const inProgress = totalUsers - completedProjects;
    const totalEnergy = users.reduce((sum, user) => sum + (parseFloat(user.systemSize) || 0), 0);
    const totalRevenue = users.reduce((sum, user) => sum + (parseFloat(user.systemPrice) || 0), 0);
    const completionRate = totalUsers > 0 ? Math.round((completedProjects / totalUsers) * 100) : 0;
    
    // تحديث الإحصائيات في الداشبورد
    const elements = {
        'totalUsers': totalUsers,
        'completedProjects': completedProjects,
        'inProgress': inProgress,
        'totalEnergy': `${totalEnergy.toFixed(1)} كيلوواط`,
        'totalRevenue': `${totalRevenue.toLocaleString()} د.أ`,
        'completionRate': `${completionRate}%`
    };
    
    for (const [id, value] of Object.entries(elements)) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
}

function showAlert(message, type = 'success') {
    // إنشاء عنصر التنبيه
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'error' : ''}`;
    toast.textContent = message;
    
    // إضافة الأنماط
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#e74c3c' : '#27ae60'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        max-width: 350px;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(toast);
    
    // إظهار التنبيه
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // إخفاء التنبيه بعد 3 ثوان
    setTimeout(() => {
        toast.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function showLoading(show) {
    isLoading = show;
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
        loadingEl.style.display = show ? 'flex' : 'none';
    }
    
    // تعطيل/تفعيل الأزرار أثناء التحميل
    const buttons = document.querySelectorAll('button:not(.loading-excluded)');
    buttons.forEach(btn => {
        btn.disabled = show;
    });
}

// =============================================
// وظائف المظهر
// =============================================

function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');
    
    body.classList.toggle('dark-theme');
    
    if (body.classList.contains('dark-theme')) {
        if (themeIcon) themeIcon.className = 'fas fa-moon';
        if (themeText) themeText.textContent = 'الوضع الليلي';
        localStorage.setItem('theme', 'dark');
    } else {
        if (themeIcon) themeIcon.className = 'fas fa-sun';
        if (themeText) themeText.textContent = 'الوضع النهاري';
        localStorage.setItem('theme', 'light');
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        const themeIcon = document.getElementById('theme-icon');
        const themeText = document.getElementById('theme-text');
        if (themeIcon) themeIcon.className = 'fas fa-moon';
        if (themeText) themeText.textContent = 'الوضع الليلي';
    }
}

function togglePasswordVisibility() {
    const passwordField = document.getElementById('password');
    const toggleButton = document.getElementById('togglePassword');
    
    if (passwordField && toggleButton) {
        if (passwordField.type === 'password') {
            passwordField.type = 'text';
            toggleButton.innerHTML = '<i class="fa fa-eye"></i>';
        } else {
            passwordField.type = 'password';
            toggleButton.innerHTML = '<i class="fa fa-eye-slash"></i>';
        }
    }
}

// =============================================
// وظائف التبويبات
// =============================================

function setupTabs() {
    const tabs = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // إزالة الفئة النشطة من جميع التبويبات
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));
            
            // إضافة الفئة النشطة للتبويب المحدد
            this.classList.add('active');
            const targetContent = document.getElementById(targetTab + 'Tab');
            if (targetContent) {
                targetContent.classList.add('active');
            }
            
            // تحميل البيانات حسب التبويب
            switch(targetTab) {
                case 'calendar':
                    loadAppointments();
                    break;
                case 'tasks':
                    loadTasks();
                    break;
                case 'reports':
                    // تحضير قائمة المستخدمين في التقارير
                    const userSelect = document.getElementById('eventUser');
                    if (userSelect) {
                        userSelect.innerHTML = '<option value="">اختر المستخدم (اختياري)</option>';
                        users.forEach(user => {
                            userSelect.innerHTML += `<option value="${user.id}">${user.fullName}</option>`;
                        });
                    }
                    break;
                case 'analytics':
                    updateAnalytics();
                    break;
            }
        });
    });
}

function updateAnalytics() {
    if (users.length === 0) return;
    
    const completedProjects = users.filter(user => isProjectComplete(user)).length;
    const totalRevenue = users.reduce((sum, user) => sum + (parseFloat(user.systemPrice) || 0), 0);
    const completionRate = users.length > 0 ? Math.round((completedProjects / users.length) * 100) : 0;
    
    // تحديث الإحصائيات في لوحة التحليلات
    const completionRateEl = document.getElementById('completionRate');
    const totalRevenueEl = document.getElementById('totalRevenue');
    const avgCompletionEl = document.getElementById('avgCompletion');
    const topLocationEl = document.getElementById('topLocation');
    
    if (completionRateEl) completionRateEl.textContent = `${completionRate}%`;
    if (totalRevenueEl) totalRevenueEl.textContent = `${totalRevenue.toLocaleString()} د.أ`;
    if (avgCompletionEl) avgCompletionEl.textContent = '7'; // قيمة افتراضية
    if (topLocationEl) topLocationEl.textContent = 'العقبة'; // قيمة افتراضية
}

// =============================================
// فحص الاتصال
// =============================================

async function checkConnectionStatus() {
    try {
        // محاولة قراءة بسيطة من Firestore للتأكد من الاتصال
        await db.collection('connection_test').limit(1).get();
        
        const statusEl = document.getElementById('connectionStatus');
        if (statusEl) {
            statusEl.className = 'connection-status connected';
            statusEl.innerHTML = '<i class="fas fa-circle"></i> متصل بـ Firestore';
            statusEl.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px;
                background: #27ae60;
                color: white;
                padding: 8px 15px;
                border-radius: 20px;
                font-size: 12px;
                z-index: 1000;
            `;
        }
    } catch (error) {
        const statusEl = document.getElementById('connectionStatus');
        if (statusEl) {
            statusEl.className = 'connection-status disconnected';
            statusEl.innerHTML = '<i class="fas fa-exclamation-circle"></i> غير متصل';
            statusEl.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px; 
                background: #e74c3c;
                color: white;
                padding: 8px 15px;
                border-radius: 20px;
                font-size: 12px;
                z-index: 1000;
            `;
        }
        console.error('خطأ في الاتصال:', error);
    }
}

// =============================================
// وظائف جديدة مضافة للإصلاحات
// =============================================

function toggleUserPasswordVisibility(userId) {
    const passwordText = document.getElementById(`password-text-${userId}`);
    const eyeIcon = passwordText.nextElementSibling.querySelector('i');
    
    if (passwordText.classList.contains('visible')) {
        passwordText.classList.remove('visible');
        eyeIcon.className = 'fas fa-eye';
    } else {
        passwordText.classList.add('visible');
        eyeIcon.className = 'fas fa-eye-slash';
    }
}

// =============================================
// 18 ميزة جديدة
// =============================================

function setupNewFeatures() {
    // 1. نسخ معلومات المستخدم بنقرة واحدة
    addCopyFeature();
    
    // 2. البحث المتقدم
    setupAdvancedSearch();
    
    // 3. التصفية حسب الموقع
    setupLocationFilter();
    
    // 4. التصدير السريع
    setupQuickExport();
    
    // 5. الإشعارات الذكية
    setupSmartNotifications();
    
    // 6. النسخ الاحتياطي التلقائي
    setupAutoBackup();
    
    // 7. الوضع المدمج للطابعة
    setupPrintMode();
    
    // 8. إمكانية السحب والإفلات للوثائق
    setupDragAndDrop();
    
    // 9. إضافة توقيع رقمي
    setupDigitalSignature();
    
    // 10. دعم الباركود
    setupBarcodeSupport();
    
    // 11. إحصاءات الاستخدام
    setupUsageStatistics();
    
    // 12. إمكانية المشاركة
    setupSharing();
    
    // 13. الوضع غير المتصل
    setupOfflineMode();
    
    // 14. دعم متعدد اللغات
    setupMultiLanguage();
    
    // 15. إمكانية التخصيص
    setupCustomization();
    
    // 16. تقارير أداء النظام
    setupPerformanceReports();
    
    // 17. دعم الجهات المتعددة
    setupMultiVendorSupport();
    
    // 18. تكامل مع أنظمة خارجية
    setupExternalIntegrations();
}

// 1. نسخ معلومات المستخدم بنقرة واحدة
function addCopyFeature() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('copy-user-info')) {
            const userId = e.target.dataset.userId;
            const user = users.find(u => u.id === userId);
            if (user) {
                const userInfo = `الاسم: ${user.fullName}\nالهوية: ${user.nationalId}\nالهاتف: ${user.phoneNumber}\nالعنوان: ${user.address}`;
                navigator.clipboard.writeText(userInfo).then(() => {
                    showAlert('تم نسخ معلومات المستخدم', 'success');
                });
            }
        }
    });
}

// 2. البحث المتقدم
function setupAdvancedSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            if (searchTerm.length > 2) {
                // تنفيذ بحث متقدم
                advancedSearch(searchTerm);
            }
        });
    }
}

// 3. التصفية حسب الموقع
function setupLocationFilter() {
    // إضافة خيارات تصفية حسب الموقع
    const filterContainer = document.querySelector('.search-filter');
    if (filterContainer) {
        const locationFilter = document.createElement('div');
        locationFilter.className = 'filter-select';
        locationFilter.innerHTML = `
            <select id="locationFilter">
                <option value="all">جميع المواقع</option>
                <option value="amman">عمان</option>
                <option value="irbid">إربد</option>
                <option value="zarqa">الزرقاء</option>
                <option value="aqaba">العقبة</option>
                <option value="other">أخرى</option>
            </select>
        `;
        filterContainer.appendChild(locationFilter);
        
        document.getElementById('locationFilter').addEventListener('change', filterUsers);
    }
}

// 4. التصدير السريع
function setupQuickExport() {
    // إضافة زر تصدير سريع
    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn btn-success';
    exportBtn.innerHTML = '<i class="fas fa-file-export"></i> تصدير سريع';
    exportBtn.onclick = quickExport;
    document.querySelector('.search-filter').appendChild(exportBtn);
}

// 5. الإشعارات الذكية
function setupSmartNotifications() {
    // مراقبة التغييرات وإرسال إشعارات ذكية
    setInterval(() => {
        checkForSystemNotifications();
    }, 300000); // كل 5 دقائق
}

// 6. النسخ الاحتياطي التلقائي
function setupAutoBackup() {
    // نسخ احتياطي تلقائي كل ساعة
    setInterval(() => {
        createAutoBackup();
    }, 3600000); // كل ساعة
}

// 7. الوضع المدمج للطابعة
function setupPrintMode() {
    // إضافة زر للطباعة المباشرة
    const printBtn = document.createElement('button');
    printBtn.className = 'btn btn-info';
    printBtn.innerHTML = '<i class="fas fa-print"></i> طباعة مباشرة';
    printBtn.onclick = enablePrintMode;
    document.querySelector('.theme-controls').appendChild(printBtn);
}

// 8. إمكانية السحب والإفلات للوثائق
function setupDragAndDrop() {
    // تمكين سحب وإفلات الملفات
    const dropZone = document.createElement('div');
    dropZone.id = 'dropZone';
    dropZone.style.cssText = 'position: fixed; bottom: 20px; right: 20px; width: 100px; height: 100px; background: rgba(59, 130, 246, 0.1); border: 2px dashed var(--border-color); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 1000;';
    dropZone.innerHTML = '<i class="fas fa-cloud-upload-alt" style="font-size: 2rem; color: var(--text-accent);"></i>';
    document.body.appendChild(dropZone);
}

// 9. إضافة توقيع رقمي
function setupDigitalSignature() {
    // إضافة دعم التوقيع الرقمي
    const signaturePad = document.createElement('div');
    signaturePad.id = 'signaturePad';
    signaturePad.style.cssText = 'display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 400px; height: 200px; background: white; border: 2px solid var(--border-color); z-index: 2000;';
    signaturePad.innerHTML = `
        <div style="padding: 15px;">
            <h3>أضف توقيعك</h3>
            <canvas id="signatureCanvas" width="380" height="150" style="border: 1px solid #ddd;"></canvas>
            <div style="margin-top: 10px; display: flex; justify-content: space-between;">
                <button onclick="clearSignature()" class="btn btn-secondary">مسح</button>
                <button onclick="saveSignature()" class="btn btn-primary">حفظ</button>
                <button onclick="hideSignaturePad()" class="btn btn-cancel">إلغاء</button>
            </div>
        </div>
    `;
    document.body.appendChild(signaturePad);
}

// 10. دعم الباركود
function setupBarcodeSupport() {
    // إضافة ماسح الباركود
    const barcodeScanner = document.createElement('div');
    barcodeScanner.id = 'barcodeScanner';
    barcodeScanner.style.cssText = 'display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 300px; height: 300px; background: black; z-index: 2000;';
    barcodeScanner.innerHTML = `
        <video id="barcodeVideo" width="300" height="300" style="object-fit: cover;"></video>
        <div style="position: absolute; top: 10px; right: 10px;">
            <button onclick="stopBarcodeScan()" class="btn btn-danger">إغلاق</button>
        </div>
    `;
    document.body.appendChild(barcodeScanner);
}

// 11. إحصاءات الاستخدام
function setupUsageStatistics() {
    // تتبع إحصاءات استخدام النظام
    const usageStats = {
        loginTime: new Date(),
        actions: [],
        pagesVisited: []
    };
    
    // حفظ الإحصاءات عند مغادرة الصفحة
    window.addEventListener('beforeunload', () => {
        localStorage.setItem('usageStats', JSON.stringify(usageStats));
    });
}

// 12. إمكانية المشاركة
function setupSharing() {
    // إضافة أزرار المشاركة
    const shareBtn = document.createElement('button');
    shareBtn.className = 'btn btn-info';
    shareBtn.innerHTML = '<i class="fas fa-share-alt"></i> مشاركة';
    shareBtn.onclick = shareData;
    document.querySelector('.theme-controls').appendChild(shareBtn);
}

// 13. الوضع غير المتصل
function setupOfflineMode() {
    // اكتشاف حالة الاتصال
    window.addEventListener('online', () => {
        showAlert('تم استعادة الاتصال بالإنترنت', 'success');
        syncOfflineData();
    });
    
    window.addEventListener('offline', () => {
        showAlert('أنت الآن في وضع عدم الاتصال، سيتم حفظ البيانات محليًا', 'warning');
    });
}

// 14. دعم متعدد اللغات
function setupMultiLanguage() {
    // إضافة محدد اللغة
    const langSelector = document.createElement('select');
    langSelector.id = 'languageSelector';
    langSelector.innerHTML = `
        <option value="ar">العربية</option>
        <option value="en">English</option>
    `;
    langSelector.onchange = changeLanguage;
    document.querySelector('.language-selector').appendChild(langSelector);
}

// 15. إمكانية التخصيص
function setupCustomization() {
    // إضافة إعدادات التخصيص
    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'btn btn-secondary';
    settingsBtn.innerHTML = '<i class="fas fa-cog"></i> إعدادات';
    settingsBtn.onclick = showSettings;
    document.querySelector('.theme-controls').appendChild(settingsBtn);
}

// 16. تقارير أداء النظام
function setupPerformanceReports() {
    // إنشاء تقارير الأداء
    setInterval(() => {
        generatePerformanceReport();
    }, 1800000); // كل 30 دقيقة
}

// 17. دعم الجهات المتعددة
function setupMultiVendorSupport() {
    // إضافة دعم متعدد البائعين
    const vendorSelect = document.createElement('select');
    vendorSelect.id = 'vendorSelect';
    vendorSelect.innerHTML = `
        <option value="all">جميع البائعين</option>
        <option value="vendor1">البائع 1</option>
        <option value="vendor2">البائع 2</option>
    `;
    vendorSelect.onchange = filterByVendor;
    document.querySelector('.search-filter').appendChild(vendorSelect);
}

// 18. تكامل مع أنظمة خارجية
function setupExternalIntegrations() {
    // إضافة تكامل مع أنظمة خارجية
    const integrationsBtn = document.createElement('button');
    integrationsBtn.className = 'btn btn-warning';
    integrationsBtn.innerHTML = '<i class="fas fa-plug"></i> تكاملات';
    integrationsBtn.onclick = showIntegrations;
    document.querySelector('.theme-controls').appendChild(integrationsBtn);
}

// =============================================
// إعداد الأحداث
// =============================================

function setupEventListeners() {
    // إغلاق النافذة المنبثقة عند النقر خارجها
    window.onclick = function(event) {
        const notificationPanel = document.getElementById('notificationPanel');
        
        // إغلاق لوحة الإشعارات عند النقر خارجها
        if (notificationPanel && !notificationPanel.contains(event.target) && 
            !document.getElementById('notificationBell')?.contains(event.target)) {
            notificationPanel.style.display = 'none';
        }
    };

    // إغلاق النافذة بالضغط على Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const notificationPanel = document.getElementById('notificationPanel');
            if (notificationPanel) {
                notificationPanel.style.display = 'none';
            }
        }
    });

    // حدث تبديل إظهار كلمة المرور
    const passwordToggle = document.getElementById('togglePassword');
    if (passwordToggle) {
        passwordToggle.addEventListener('click', togglePasswordVisibility);
    }

    // حدث إضافة مستخدم
    const addUserButton = document.getElementById('addUserBtn');
    if (addUserButton) {
        addUserButton.addEventListener('click', addUser);
    }

    // الضغط على Enter في حقول النموذج
    const formFields = document.querySelectorAll('#username, #password, #firstName, #address, #coordX, #coordY, #systemSize, #systemPrice, #phoneNumber');
    if (formFields.length > 0) {
        formFields.forEach(field => {
            field.addEventListener('keypress', function(event) {
                if (event.key === 'Enter') {
                    addUser();
                }
            });
        });
    }

    // حدث البحث والتصفية
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(filterUsers, 300);
        });
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterUsers);
    }

    // إضافة أزرار البيانات التجريبية في الفوتر
    setTimeout(() => {
        const footer = document.querySelector('footer');
        if (footer) {
            const buttonsContainer = footer.querySelector('div:last-child') || footer;
            
            const dummyUsersBtn = document.createElement('button');
            dummyUsersBtn.className = 'btn btn-info loading-excluded';
            dummyUsersBtn.innerHTML = '<i class="fas fa-users"></i> إضافة مستخدمين تجريبيين';
            dummyUsersBtn.onclick = addDummyUsers;
            dummyUsersBtn.style.marginRight = '10px';
            
            const dummyNotificationsBtn = document.createElement('button');
            dummyNotificationsBtn.className = 'btn btn-warning loading-excluded';
            dummyNotificationsBtn.innerHTML = '<i class="fas fa-bell"></i> إضافة إشعارات تجريبية';
            dummyNotificationsBtn.onclick = addDummyNotifications;
            dummyNotificationsBtn.style.marginRight = '10px';
            
            const testDbBtn = document.createElement('button');
            testDbBtn.className = 'btn btn-success loading-excluded';
            testDbBtn.innerHTML = '<i class="fas fa-database"></i> اختبار قاعدة البيانات';
            testDbBtn.onclick = testDatabaseConnection;
            testDbBtn.style.marginRight = '10px';
            
            buttonsContainer.appendChild(dummyUsersBtn);
            buttonsContainer.appendChild(dummyNotificationsBtn);
            buttonsContainer.appendChild(testDbBtn);
        }
    }, 1000);

    // إعداد أحداث المواعيد
    const addAppointmentBtn = document.getElementById('addAppointmentBtn');
    if (addAppointmentBtn) {
        addAppointmentBtn.addEventListener('click', addAppointment);
    }

    // إعداد أحداث المهام
    const addTaskBtn = document.getElementById('addTaskBtn');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', addTask);
    }

    // إعداد أحداث التقارير
    const generateReportBtn = document.getElementById('generateReportBtn');
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', generateReport);
    }
}

// دالة مسح جميع الإشعارات
async function deleteAllNotifications() {
    if (confirm('هل أنت متأكد من أنك تريد حذف جميع الإشعارات؟ هذا الإجراء لا يمكن التراجع عنه.')) {
        try {
            showLoading(true);
            
            // الحصول على جميع الإشعارات
            const snapshot = await db.collection('notifications').get();
            
            if (snapshot.empty) {
                showAlert('لا توجد إشعارات لحذفها', 'info');
                return;
            }
            
            // حذف جميع الإشعارات باستخدام batch
            const batch = db.batch();
            snapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            await batch.commit();
            
            // إعادة تحميل الإشعارات
            notifications = [];
            displayNotifications();
            updateNotificationBell();
            
            showAlert('تم حذف جميع الإشعارات بنجاح', 'success');
            
        } catch (error) {
            console.error('فشل في حذف الإشعارات:', error);
            showAlert('فشل في حذف الإشعارات: ' + error.message, 'error');
        } finally {
            showLoading(false);
        }
    }
}

// تعريف الوظائف في النطاق العام
window.addUser = addUser;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.toggleDocument = toggleDocument;
window.cancelEdit = cancelEdit;
window.saveChanges = saveChanges;
window.toggleTheme = toggleTheme;
window.filterUsers = filterUsers;
window.addDummyUsers = addDummyUsers;
window.addDummyNotifications = addDummyNotifications;
window.markAllAsRead = markAllAsRead;
window.toggleNotificationPanel = toggleNotificationPanel;
window.testDatabaseConnection = testDatabaseConnection;
window.addAppointment = addAppointment;
window.deleteAppointment = deleteAppointment;
window.addTask = addTask;
window.updateTaskStatus = updateTaskStatus;
window.deleteTask = deleteTask;
window.generateReport = generateReport;
window.exportToExcel = exportToExcel;
window.exportToPDF = exportToPDF;
window.printReport = printReport;
window.toggleUserPasswordVisibility = toggleUserPasswordVisibility;
window.deleteAllNotifications = deleteAllNotifications;

// معالجة الأخطاء العامة
window.addEventListener('error', function(event) {
    console.error('خطأ في التطبيق:', event.error);
    showAlert('حدث خطأ غير متوقع في التطبيق', 'error');
});
window.addEventListener('unhandledrejection', function(event) {
    console.error('خطأ في Promise:', event.reason);
    showAlert('حدث خطأ في الاتصال بقاعدة البيانات', 'error');
});
window.AppConfig = AppConfig;
console.log('✅ تم تحميل النظام بنجاح - الإصدار 4.1 المحدث');
console.log('🔋 الوثائق المتاحة:', AppConfig.DOCUMENT_NAMES.length);
console.log('🔥 Firestore Config:', firebaseConfig.projectId);
