// دالة إنشاء نسخة احتياطية شاملة لجميع البيانات (بدون History)
async function createFullBackup() {
    try {
        showLoading(true);
        
        console.log('🚀 بدء إنشاء النسخة الاحتياطية الشاملة...');
        
        // جمع جميع البيانات من قاعدة البيانات (بدون History)
        const [
            usersSnapshot, 
            appointmentsSnapshot, 
            tasksSnapshot, 
            notificationsSnapshot
        ] = await Promise.all([
            db.collection('users').orderBy('createdAt', 'desc').get(),
            db.collection('appointments').orderBy('createdAt', 'desc').get(),
            db.collection('tasks').orderBy('createdAt', 'desc').get(),
            db.collection('notifications').orderBy('time', 'desc').limit(100).get()
        ]);

        // تحويل البيانات إلى مصفوفات
        const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const appointments = appointmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const notifications = notificationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        console.log(`📊 تم جمع البيانات: ${users.length} مستخدم، ${appointments.length} موعد، ${tasks.length} مهمة، ${notifications.length} إشعار`);

        // عرض خيارات التحميل للمستخدم
        showBackupOptions(users, appointments, tasks, notifications);
        
    } catch (error) {
        console.error('❌ فشل في إنشاء النسخة الاحتياطية:', error);
        showAlert('❌ فشل في إنشاء النسخة الاحتياطية: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// دالة عرض خيارات النسخ الاحتياطي
function showBackupOptions(users, appointments, tasks, notifications) {
    const optionsHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.3);
                z-index: 10000; max-width: 500px; width: 90%;">
            <h3 style="text-align: center; margin-bottom: 20px; color: #2c3e50;">
                <i class="fas fa-download"></i> اختيار نوع النسخة الاحتياطية
            </h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px;">
                <button onclick="downloadHTMLBackupFull(${JSON.stringify(users).replace(/"/g, '&quot;')}, ${JSON.stringify(appointments).replace(/"/g, '&quot;')}, ${JSON.stringify(tasks).replace(/"/g, '&quot;')}, ${JSON.stringify(notifications).replace(/"/g, '&quot;')})" 
                        class="btn btn-primary" style="padding: 15px; text-align: center;">
                    <i class="fas fa-file-code"></i>
                    <div style="margin-top: 8px;">HTML نسخة ويب</div>
                </button>
                
                <button onclick="downloadPDFBackupFull(${JSON.stringify(users).replace(/"/g, '&quot;')}, ${JSON.stringify(appointments).replace(/"/g, '&quot;')}, ${JSON.stringify(tasks).replace(/"/g, '&quot;')}, ${JSON.stringify(notifications).replace(/"/g, '&quot;')})" 
                        class="btn btn-danger" style="padding: 15px; text-align: center;">
                    <i class="fas fa-file-pdf"></i>
                    <div style="margin-top: 8px;">PDF نسخة</div>
                </button>
            </div>
            
            <div style="text-align: center;">
                <button onclick="closeBackupOptions()" 
                        class="btn btn-secondary">
                    <i class="fas fa-times"></i> إلغاء
                </button>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; font-size: 14px;">
                <strong>📊 ملخص البيانات المجمعة:</strong><br>
                • ${users.length} مستخدم<br>
                • ${appointments.length} موعد<br>
                • ${tasks.length} مهمة<br>
                • ${notifications.length} إشعار<br>
                • <span style="color: #666;">❌ لا يشمل سجل النظام (History)</span>
            </div>
        </div>
    `;
    
    const overlay = document.createElement('div');
    overlay.id = 'backupOverlay';
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999;';
    overlay.innerHTML = optionsHTML;
    
    document.body.appendChild(overlay);
}

// دالة إغلاق نافذة الخيارات
function closeBackupOptions() {
    const overlay = document.getElementById('backupOverlay');
    if (overlay) {
        overlay.remove();
    }
}

// دالة تنزيل نسخة HTML كاملة
function downloadHTMLBackupFull(users, appointments, tasks, notifications) {
    try {
        const htmlContent = createBackupHTMLContent(users, appointments, tasks, notifications);
        downloadHTMLBackup(htmlContent);
        showAlert('✅ تم إنشاء النسخة الاحتياطية HTML بنجاح!', 'success');
        closeBackupOptions();
        
    } catch (error) {
        console.error('❌ فشل في إنشاء نسخة HTML:', error);
        showAlert('❌ فشل في إنشاء نسخة HTML: ' + error.message, 'error');
    }
}

// دالة تنزيل نسخة PDF كاملة
function downloadPDFBackupFull(users, appointments, tasks, notifications) {
    try {
        // استخدام نفس محتوى HTML لإنشاء PDF
        const htmlContent = createBackupHTMLContent(users, appointments, tasks, notifications);
        
        // إنشاء نافذة جديدة للطباعة (التي يمكن حفظها كPDF)
        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        setTimeout(() => {
            printWindow.print();
            showAlert('✅ جاري فتح نافذة الطباعة لحفظ PDF...', 'success');
        }, 1000);
        
        closeBackupOptions();
        
    } catch (error) {
        console.error('❌ فشل في إنشاء نسخة PDF:', error);
        showAlert('❌ فشل في إنشاء نسخة PDF: ' + error.message, 'error');
    }
}

// دالة إنشاء محتوى HTML للنسخة الاحتياطية (بدون History)
function createBackupHTMLContent(users, appointments, tasks, notifications) {
    const now = new Date();
    const dateString = now.toLocaleDateString('ar-EG');
    const timeString = now.toLocaleTimeString('ar-EG');
    
    let htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="UTF-8">
        <title>نسخة احتياطية شاملة - نظام إدارة الوثائق للطاقة الشمسية</title>
        <style>
            body {
                font-family: 'Arial', 'Segoe UI', Tahoma, sans-serif;
                margin: 0;
                padding: 20px;
                background: #f5f5f5;
                direction: rtl;
                line-height: 1.6;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #3498db;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .header h1 {
                color: #2c3e50;
                margin: 0;
                font-size: 28px;
            }
            .header .subtitle {
                color: #7f8c8d;
                font-size: 16px;
                margin-top: 10px;
            }
            .section {
                margin-bottom: 40px;
                page-break-inside: avoid;
            }
            .section-header {
                background: #3498db;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                margin-bottom: 20px;
                font-size: 20px;
                font-weight: bold;
            }
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            .stat-card {
                background: white;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                border-left: 4px solid #3498db;
            }
            .stat-number {
                font-size: 32px;
                font-weight: bold;
                color: #2c3e50;
                margin-bottom: 10px;
            }
            .stat-label {
                color: #7f8c8d;
                font-size: 14px;
            }
            .user-card {
                background: white;
                border: 1px solid #e1e1e1;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 20px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .user-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 15px;
                padding-bottom: 15px;
                border-bottom: 2px solid #ecf0f1;
            }
            .user-info h3 {
                margin: 0 0 10px 0;
                color: #2c3e50;
                font-size: 18px;
            }
            .user-info p {
                margin: 5px 0;
                color: #555;
            }
            .user-status {
                padding: 5px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
            }
            .status-complete {
                background: #27ae60;
                color: white;
            }
            .status-incomplete {
                background: #e67e22;
                color: white;
            }
            .documents-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 10px;
                margin: 15px 0;
            }
            .document-item {
                display: flex;
                align-items: center;
                padding: 10px;
                border-radius: 6px;
                border: 1px solid #ddd;
            }
            .document-item.completed {
                background: #d4edda;
                border-color: #c3e6cb;
            }
            .document-item.incomplete {
                background: #f8d7da;
                border-color: #f5c6cb;
            }
            .document-number {
                background: #3498db;
                color: white;
                width: 25px;
                height: 25px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
                margin-left: 10px;
            }
            .document-name {
                flex: 1;
                font-size: 14px;
            }
            .progress-section {
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid #ecf0f1;
            }
            .progress-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                font-size: 14px;
            }
            .progress-bar {
                background: #ecf0f1;
                border-radius: 10px;
                height: 10px;
                overflow: hidden;
            }
            .progress {
                background: #3498db;
                height: 100%;
                transition: width 0.3s ease;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin: 15px 0;
                background: white;
            }
            th {
                background: #3498db;
                color: white;
                padding: 12px;
                text-align: right;
                font-weight: bold;
            }
            td {
                padding: 10px 12px;
                border: 1px solid #ddd;
                text-align: right;
            }
            tr:nth-child(even) {
                background: #f8f9fa;
            }
            .no-data {
                text-align: center;
                color: #666;
                padding: 40px;
                font-size: 16px;
            }
            .note-box {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                color: #856404;
            }
            @media print {
                body {
                    background: white;
                    padding: 0;
                }
                .container {
                    box-shadow: none;
                    padding: 0;
                }
                .section {
                    page-break-inside: avoid;
                }
                .user-card {
                    page-break-inside: avoid;
                }
                .note-box {
                    background: #fff3cd !important;
                    -webkit-print-color-adjust: exact;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📊 نسخة احتياطية شاملة</h1>
                <div class="subtitle">نظام إدارة الوثائق للطاقة الشمسية - الإصدار 4.1</div>
                <div class="subtitle">تم إنشاؤه في: ${dateString} الساعة ${timeString}</div>
            </div>
            
            
    `;

    // قسم الإحصائيات العامة
    htmlContent += `
        <div class="section">
            <div class="section-header">📈 الإحصائيات العامة</div>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">${users.length}</div>
                    <div class="stat-label">إجمالي المستخدمين</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${appointments.length}</div>
                    <div class="stat-label">المواعيد</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${tasks.length}</div>
                    <div class="stat-label">المهام</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${notifications.length}</div>
                    <div class="stat-label">الإشعارات</div>
                </div>
            </div>
        </div>
    `;

    // قسم المستخدمين
    htmlContent += `
        <div class="section">
            <div class="section-header">👥 المستخدمين (${users.length})</div>
    `;
    
    if (users.length === 0) {
        htmlContent += `<div class="no-data">لا توجد بيانات للمستخدمين</div>`;
    } else {
        users.forEach((user, index) => {
            const stats = getCompletionStats(user);
            const isComplete = isProjectComplete(user);
            
            htmlContent += `
                <div class="user-card">
                    <div class="user-header">
                        <div class="user-info">
                            <h3>👤 المستخدم ${index + 1}: ${user.fullName || 'غير محدد'}</h3>
                            <p><strong>📋 رقم الهوية:</strong> ${user.nationalId || 'غير محدد'}</p>
                            <p><strong>📞 الهاتف:</strong> ${user.phoneNumber || 'غير محدد'}</p>
                            <p><strong>📍 العنوان:</strong> ${user.address || 'غير محدد'}</p>
                            ${user.coordX && user.coordY ? `<p><strong>🌐 الإحداثيات:</strong> X: ${user.coordX}, Y: ${user.coordY}</p>` : ''}
                            <p><strong>⚡ حجم النظام:</strong> ${user.systemSize || '0'} كيلوواط</p>
                            <p><strong>💰 السعر:</strong> ${user.systemPrice ? parseFloat(user.systemPrice).toLocaleString() : '0'} دينار</p>
                            ${user.paymentMethod ? `<p><strong>💳 طريقة الدفع:</strong> ${user.paymentMethod}</p>` : ''}
                            ${user.paymentDetails ? `<p><strong>📝 تفاصيل الدفع:</strong> ${user.paymentDetails}</p>` : ''}
                            ${user.commissionNotes ? `<p><strong>📋 ملاحظات المفوضية:</strong> ${user.commissionNotes}</p>` : ''}
                            ${user.companyNotes ? `<p><strong>🏢 ملاحظات الشركة:</strong> ${user.companyNotes}</p>` : ''}
                        </div>
                        <div class="user-status ${isComplete ? 'status-complete' : 'status-incomplete'}">
                            ${isComplete ? '✅ مكتمل' : '⏳ قيد الإنجاز'}
                        </div>
                    </div>
                    
                    <div class="progress-section">
                        <div class="progress-info">
                            <span><strong>📊 التقدم:</strong> ${stats.completed}/${stats.total}</span>
                            <span><strong>${stats.percentage}%</strong></span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress" style="width: ${stats.percentage}%"></div>
                        </div>
                    </div>
                    
                    <h4 style="margin: 20px 0 10px 0; color: #2c3e50;">📄 الوثائق المطلوبة:</h4>
                    <div class="documents-grid">
            `;
            
            AppConfig.DOCUMENT_NAMES.forEach((name, docIndex) => {
                const isCompleted = user.documents && user.documents[docIndex];
                htmlContent += `
                    <div class="document-item ${isCompleted ? 'completed' : 'incomplete'}">
                        <div class="document-number">${docIndex + 1}</div>
                        <div class="document-name">${name}</div>
                        <div style="margin-right: 10px;">
                            ${isCompleted ? '✅' : '❌'}
                        </div>
                    </div>
                `;
            });
            
            htmlContent += `
                    </div>
                </div>
            `;
        });
    }
    
    htmlContent += `</div>`;

    // قسم المواعيد
    htmlContent += `
        <div class="section">
            <div class="section-header">📅 المواعيد (${appointments.length})</div>
    `;
    
    if (appointments.length === 0) {
        htmlContent += `<div class="no-data">لا توجد مواعيد</div>`;
    } else {
        htmlContent += `
            <table>
                <thead>
                    <tr>
                        <th>العنوان</th>
                        <th>التاريخ</th>
                        <th>الوقت</th>
                        <th>المستخدم</th>
                        <th>الحالة</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        appointments.forEach(appointment => {
            const userName = appointment.userId ? 
                (users.find(u => u.id === appointment.userId)?.fullName || 'مستخدم محذوف') : 
                'غير محدد';
            
            htmlContent += `
                <tr>
                    <td>${appointment.title || 'غير محدد'}</td>
                    <td>${appointment.date || 'غير محدد'}</td>
                    <td>${appointment.time || 'غير محدد'}</td>
                    <td>${userName}</td>
                    <td>${appointment.status === 'completed' ? '✅ مكتمل' : '⏳ مجدول'}</td>
                </tr>
            `;
        });
        
        htmlContent += `
                </tbody>
            </table>
        `;
    }
    
    htmlContent += `</div>`;

    // قسم المهام
    htmlContent += `
        <div class="section">
            <div class="section-header">✅ المهام (${tasks.length})</div>
    `;
    
    if (tasks.length === 0) {
        htmlContent += `<div class="no-data">لا توجد مهام</div>`;
    } else {
        const priorityTexts = { high: 'عالية', medium: 'متوسطة', low: 'منخفضة' };
        const statusTexts = { pending: 'قيد الانتظار', in_progress: 'قيد التنفيذ', completed: 'مكتملة' };
        
        htmlContent += `
            <table>
                <thead>
                    <tr>
                        <th>العنوان</th>
                        <th>الوصف</th>
                        <th>الأولوية</th>
                        <th>تاريخ الاستحقاق</th>
                        <th>المكلف</th>
                        <th>الحالة</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        tasks.forEach(task => {
            htmlContent += `
                <tr>
                    <td>${task.title || 'غير محدد'}</td>
                    <td>${task.description || 'لا يوجد'}</td>
                    <td>${priorityTexts[task.priority] || 'متوسطة'}</td>
                    <td>${task.dueDate || 'غير محدد'}</td>
                    <td>${task.assignedTo || 'غير محدد'}</td>
                    <td>${statusTexts[task.status] || 'قيد الانتظار'}</td>
                </tr>
            `;
        });
        
        htmlContent += `
                </tbody>
            </table>
        `;
    }
    
    htmlContent += `</div>`;

    // قسم الإشعارات
    htmlContent += `
        <div class="section">
            <div class="section-header">🔔 الإشعارات (${notifications.length})</div>
    `;
    
    if (notifications.length === 0) {
        htmlContent += `<div class="no-data">لا توجد إشعارات</div>`;
    } else {
        htmlContent += `
            <table>
                <thead>
                    <tr>
                        <th>العنوان</th>
                        <th>المحتوى</th>
                        <th>الحالة</th>
                        <th>الوقت</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        notifications.forEach(notification => {
            const timeString = notification.time ? 
                new Date(notification.time.seconds * 1000).toLocaleString('ar-EG') : 
                'غير محدد';
                
            htmlContent += `
                <tr>
                    <td>${notification.title || 'غير محدد'}</td>
                    <td>${notification.body || 'لا يوجد'}</td>
                    <td>${notification.read ? '📭 مقروء' : '📬 غير مقروء'}</td>
                    <td>${timeString}</td>
                </tr>
            `;
        });
        
        htmlContent += `
                </tbody>
            </table>
        `;
    }
    
    htmlContent += `</div>`;

    // إغلاق HTML
    htmlContent += `
        </div>
        <script>
            // إضافة زر الطباعة
            document.addEventListener('DOMContentLoaded', function() {
                const printBtn = document.createElement('button');
                printBtn.innerHTML = '🖨️ طباعة التقرير';
                printBtn.style.cssText = 'position: fixed; bottom: 20px; left: 20px; background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 14px;';
                printBtn.onclick = function() { window.print(); };
                document.body.appendChild(printBtn);
            });
        </script>
    </body>
    </html>
    `;

    return htmlContent;
}
function downloadHTMLBackup(htmlContent) {
    const blob = new Blob([htmlContent], { type: 'text/html; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `نسخة_احتياطية_شاملة_${new Date().toISOString().split('T')[0]}.html`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    console.log('✅ تم إنشاء ملف HTML بنجاح');
}

// الدوال المساعدة
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

function isProjectComplete(user) {
    if (!user.documents || !Array.isArray(user.documents)) return false;
    return user.documents.every(doc => doc === true);
}
window.createFullBackup = createFullBackup;
window.downloadHTMLBackupFull = downloadHTMLBackupFull;
window.downloadPDFBackupFull = downloadPDFBackupFull;
window.closeBackupOptions = closeBackupOptions;

function init() {
    try {
        console.log("✅ نظام النسخ الاحتياطي جاهز للعمل (بدون History)");
        console.log("📊 الإصدار: 3.0 - النسخ الاحتياطي الشامل");
    } catch (error) {
        console.error("❌ حدث خطأ أثناء تشغيل النسخ الاحتياطي:", error);
    }
}
init();