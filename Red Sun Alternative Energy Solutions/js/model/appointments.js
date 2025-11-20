// =============================================
// إصلاح مشكلة إضافة المواعيد
// ملف منفصل للإصلاحات - appointments-fix.js
// =============================================

// 🔧 الإصلاح 1: دالة addAppointment المحدثة والصحيحة
async function addAppointment() {
    const title = getValue('eventTitle');
    const date = getValue('eventDate');
    const time = getValue('eventTime');
    const userId = getValue('eventUser');
    
    // التحقق من الحقول المطلوبة
    if (!title || !date || !time) {
        showAlert('⚠️ يرجى ملء جميع الحقول المطلوبة (العنوان، التاريخ، الوقت)', 'error');
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
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // إضافة الموعد إلى Firestore
        const docRef = await db.collection('appointments').add(appointmentData);
        
        console.log('✅ تم إضافة الموعد بنجاح:', docRef.id);
        
        // إرسال إشعار
        await addNotification('موعد جديد', `تم إنشاء موعد: ${title} في ${date} الساعة ${time}`);
        
        // مسح النموذج
        document.getElementById('eventTitle').value = '';
        document.getElementById('eventDate').value = '';
        document.getElementById('eventTime').value = '';
        document.getElementById('eventUser').value = '';
        
        // إعادة تحميل المواعيد
        await loadAppointments();
        
        showAlert('✅ تم إضافة الموعد بنجاح!', 'success');
        
    } catch (error) {
        console.error('❌ فشل في إضافة الموعد:', error);
        showAlert('❌ فشل في إضافة الموعد: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// 🔧 الإصلاح 2: دالة loadAppointments المحسنة
async function loadAppointments() {
    try {
        showLoading(true);
        
        const snapshot = await db.collection('appointments')
            .orderBy('date', 'asc')
            .orderBy('time', 'asc')
            .get();
        
        appointments = [];
        snapshot.forEach(doc => {
            const appointmentData = doc.data();
            appointmentData.id = doc.id;
            appointments.push(appointmentData);
        });
        
        console.log(`✅ تم تحميل ${appointments.length} موعد من Firestore`);
        
        displayAppointments();
        
    } catch (error) {
        console.error('❌ فشل في تحميل المواعيد:', error);
        showAlert('⚠️ فشل في تحميل المواعيد: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// 🔧 الإصلاح 3: دالة displayAppointments المحسنة
function displayAppointments() {
    const container = document.getElementById('appointmentsContainer');
    if (!container) {
        console.error('❌ لم يتم العثور على عنصر appointmentsContainer');
        return;
    }
    
    container.innerHTML = '';
    
    if (appointments.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 40px 20px; color: #666;">
                <i class="fas fa-calendar-times" style="font-size: 48px; color: #ddd; margin-bottom: 15px;"></i>
                <h3 style="color: #999; margin: 10px 0;">لا توجد مواعيد مجدولة</h3>
                <p style="color: #aaa;">ابدأ بإضافة موعد جديد من الأعلى</p>
            </div>
        `;
        return;
    }
    
    appointments.forEach((appointment, index) => {
        const appointmentDiv = document.createElement('div');
        appointmentDiv.className = 'appointment-item fade-in';
        appointmentDiv.style.animationDelay = `${index * 0.1}s`;
        appointmentDiv.style.cssText = `
            background: white;
            border: 1px solid #e0e0e0;
            border-right: 4px solid #3498db;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 15px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            transition: all 0.3s ease;
        `;
        
        // البحث عن اسم المستخدم
        let userName = 'غير محدد';
        if (appointment.userId) {
            const user = users.find(u => u.id === appointment.userId);
            if (user) {
                userName = user.fullName;
            } else {
                userName = 'مستخدم محذوف';
            }
        }
        
        // تنسيق التاريخ
        const formattedDate = formatDate(appointment.date);
        
        appointmentDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 18px;">
                        <i class="fas fa-calendar-check" style="color: #3498db; margin-left: 8px;"></i>
                        ${appointment.title}
                    </h4>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <p style="margin: 0; color: #555; display: flex; align-items: center;">
                            <i class="fas fa-calendar" style="width: 20px; color: #e74c3c; margin-left: 8px;"></i>
                            <strong>التاريخ:</strong>
                            <span style="margin-right: 8px;">${formattedDate}</span>
                        </p>
                        <p style="margin: 0; color: #555; display: flex; align-items: center;">
                            <i class="fas fa-clock" style="width: 20px; color: #f39c12; margin-left: 8px;"></i>
                            <strong>الوقت:</strong>
                            <span style="margin-right: 8px;">${appointment.time}</span>
                        </p>
                        <p style="margin: 0; color: #555; display: flex; align-items: center;">
                            <i class="fas fa-user" style="width: 20px; color: #27ae60; margin-left: 8px;"></i>
                            <strong>المستخدم:</strong>
                            <span style="margin-right: 8px;">${userName}</span>
                        </p>
                        <p style="margin: 0; color: #555; display: flex; align-items: center;">
                            <i class="fas fa-info-circle" style="width: 20px; color: #9b59b6; margin-left: 8px;"></i>
                            <strong>الحالة:</strong>
                            <span style="margin-right: 8px; background: #3498db; color: white; padding: 2px 10px; border-radius: 12px; font-size: 12px;">
                                ${getStatusText(appointment.status)}
                            </span>
                        </p>
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <button onclick="editAppointment('${appointment.id}')" 
                            class="btn-icon" 
                            style="background: #3498db; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; transition: all 0.3s;"
                            title="تعديل الموعد">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteAppointment('${appointment.id}')" 
                            class="btn-icon"
                            style="background: #e74c3c; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; transition: all 0.3s;"
                            title="حذف الموعد">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        // إضافة تأثيرات hover
        appointmentDiv.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            this.style.transform = 'translateY(-2px)';
        });
        
        appointmentDiv.addEventListener('mouseleave', function() {
            this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
            this.style.transform = 'translateY(0)';
        });
        
        container.appendChild(appointmentDiv);
    });
}

// 🔧 الإصلاح 4: دالة deleteAppointment المحسنة
async function deleteAppointment(appointmentId) {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) {
        showAlert('❌ لم يتم العثور على الموعد', 'error');
        return;
    }
    
    if (confirm(`⚠️ هل تريد حذف الموعد "${appointment.title}"؟\n\nالتاريخ: ${appointment.date}\nالوقت: ${appointment.time}`)) {
        try {
            showLoading(true);
            
            await db.collection('appointments').doc(appointmentId).delete();
            
            // إرسال إشعار
            await addNotification('حذف موعد', `تم حذف الموعد: ${appointment.title}`);
            
            showAlert('✅ تم حذف الموعد بنجاح', 'success');
            
            await loadAppointments();
            
        } catch (error) {
            console.error('❌ فشل في حذف الموعد:', error);
            showAlert('❌ فشل في حذف الموعد: ' + error.message, 'error');
        } finally {
            showLoading(false);
        }
    }
}

// 🔧 الإصلاح 5: دالة editAppointment الجديدة
async function editAppointment(appointmentId) {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) {
        showAlert('❌ لم يتم العثور على الموعد', 'error');
        return;
    }
    
    // ملء الحقول ببيانات الموعد
    document.getElementById('eventTitle').value = appointment.title;
    document.getElementById('eventDate').value = appointment.date;
    document.getElementById('eventTime').value = appointment.time;
    document.getElementById('eventUser').value = appointment.userId || '';
    
    // تغيير زر الإضافة إلى زر التحديث
    const addBtn = document.getElementById('addAppointmentBtn');
    if (addBtn) {
        addBtn.innerHTML = '<i class="fas fa-save"></i> تحديث الموعد';
        addBtn.onclick = async function() {
            await updateAppointment(appointmentId);
        };
    }
    
    // التمرير إلى النموذج
    document.getElementById('calendarTab').scrollIntoView({ behavior: 'smooth' });
}

// 🔧 الإصلاح 6: دالة updateAppointment الجديدة
async function updateAppointment(appointmentId) {
    const title = getValue('eventTitle');
    const date = getValue('eventDate');
    const time = getValue('eventTime');
    const userId = getValue('eventUser');
    
    if (!title || !date || !time) {
        showAlert('⚠️ يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    try {
        showLoading(true);
        
        const updateData = {
            title: title,
            date: date,
            time: time,
            userId: userId || null,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('appointments').doc(appointmentId).update(updateData);
        
        // إرسال إشعار
        await addNotification('تحديث موعد', `تم تحديث الموعد: ${title}`);
        
        // مسح النموذج
        document.getElementById('eventTitle').value = '';
        document.getElementById('eventDate').value = '';
        document.getElementById('eventTime').value = '';
        document.getElementById('eventUser').value = '';
        
        // إعادة زر الإضافة
        const addBtn = document.getElementById('addAppointmentBtn');
        if (addBtn) {
            addBtn.innerHTML = '<i class="fas fa-plus"></i> إضافة موعد';
            addBtn.onclick = addAppointment;
        }
        
        showAlert('✅ تم تحديث الموعد بنجاح!', 'success');
        
        await loadAppointments();
        
    } catch (error) {
        console.error('❌ فشل في تحديث الموعد:', error);
        showAlert('❌ فشل في تحديث الموعد: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// 🔧 دوال مساعدة

function formatDate(dateString) {
    if (!dateString) return 'غير محدد';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-EG', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

function getStatusText(status) {
    const statusMap = {
        'scheduled': 'مجدول',
        'completed': 'مكتمل',
        'cancelled': 'ملغى',
        'pending': 'قيد الانتظار'
    };
    return statusMap[status] || 'مجدول';
}

// 🔧 الإصلاح 7: تحديث قائمة المستخدمين في المواعيد
function updateAppointmentUsersList() {
    const eventUserSelect = document.getElementById('eventUser');
    const taskAssignedToSelect = document.getElementById('taskAssignedTo');
    
    if (eventUserSelect) {
        eventUserSelect.innerHTML = '<option value="">اختر المستخدم (اختياري)</option>';
        users.forEach(user => {
            eventUserSelect.innerHTML += `<option value="${user.id}">${user.fullName}</option>`;
        });
    }
    
    if (taskAssignedToSelect) {
        taskAssignedToSelect.innerHTML = '<option value="">اختر مستخدم (اختياري)</option>';
        users.forEach(user => {
            taskAssignedToSelect.innerHTML += `<option value="${user.id}">${user.fullName}</option>`;
        });
    }
}

// 🔧 الإصلاح 8: إضافة عنصر appointmentsContainer إذا لم يكن موجوداً
function ensureAppointmentsContainer() {
    const calendarTab = document.getElementById('calendarTab');
    if (!calendarTab) return;
    
    let container = document.getElementById('appointmentsContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'appointmentsContainer';
        container.style.cssText = 'margin-top: 30px;';
        
        const addSection = calendarTab.querySelector('.add-user-section');
        if (addSection) {
            addSection.appendChild(container);
        }
    }
}

// 🔧 تعريف الوظائف في النطاق العام
window.addAppointment = addAppointment;
window.loadAppointments = loadAppointments;
window.displayAppointments = displayAppointments;
window.deleteAppointment = deleteAppointment;
window.editAppointment = editAppointment;
window.updateAppointment = updateAppointment;
window.updateAppointmentUsersList = updateAppointmentUsersList;

// 🔧 التهيئة التلقائية عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 تم تحميل إصلاحات المواعيد');
    
    // التأكد من وجود عنصر appointmentsContainer
    ensureAppointmentsContainer();
    
    // تحديث قائمة المستخدمين
    if (users && users.length > 0) {
        updateAppointmentUsersList();
    }
    
    // إعداد زر إضافة الموعد
    const addAppointmentBtn = document.getElementById('addAppointmentBtn');
    if (!addAppointmentBtn) {
        // إنشاء الزر إذا لم يكن موجوداً
        const formGrid = document.querySelector('#calendarTab .form-grid');
        if (formGrid) {
            const btnContainer = document.createElement('div');
            btnContainer.className = 'form-group full-width';
            btnContainer.innerHTML = `
                <button type="button" id="addAppointmentBtn" class="btn btn-primary">
                    <i class="fas fa-plus"></i> إضافة موعد
                </button>
            `;
            formGrid.appendChild(btnContainer);
            
            document.getElementById('addAppointmentBtn').addEventListener('click', addAppointment);
        }
    } else {
        addAppointmentBtn.addEventListener('click', addAppointment);
    }
});

console.log('✅ تم تحميل ملف إصلاحات المواعيد بنجاح');