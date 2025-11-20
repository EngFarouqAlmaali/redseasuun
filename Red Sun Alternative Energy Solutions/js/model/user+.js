// ====================================================
// نظام الإصلاحات المتقدم - الإصدار الذهبي
// Advanced Fixes System - Golden Edition
// ====================================================

(function() {
    'use strict';

    console.log('🌟 تحميل نظام الإصلاحات المتقدم - الإصدار الذهبي');

    // الانتظار حتى تحميل الصفحة بالكامل
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAdvancedFixes);
    } else {
        initAdvancedFixes();
    }

    function initAdvancedFixes() {
        console.log('🛠️ بدء تهيئة نظام الإصلاحات المتقدم...');
        
        // 1. إصلاح عرض الحقول الجديدة في البطاقات
        fixTransactionFieldsDisplay();
        
        // 2. نظام التحقق من الأخطاء المتطور
        initAdvancedValidationSystem();
        
        // 3. تحسين واجهة الإشعارات
        enhanceNotificationsSystem();
        
        // 4. إضافة مؤشرات بصرية متقدمة
        addAdvancedVisualIndicators();
        
        console.log('✅ تم تحميل نظام الإصلاحات المتقدم بنجاح');
    }

    // =============================================
    // 1. إصلاح عرض الحقول الجديدة في البطاقات
    // =============================================

    function fixTransactionFieldsDisplay() {
        console.log('🔧 إصلاح عرض حقول المعاملات...');
        
        // حفظ الدالة الأصلية
        const originalDisplayUsers = window.displayUsers;
        
        // استبدال الدالة بالإصدار المعدل
        window.displayUsers = function(usersToDisplay = users) {
            const container = document.getElementById('usersContainer');
            if (!container) {
                console.error('❌ لم يتم العثور على حاوية المستخدمين');
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
                userCard.className = 'user-card fade-in premium-card';
                userCard.style.animationDelay = `${index * 0.05}s`;
                
                // HTML للحقول الجديدة - تصميم فاخر
                let transactionFieldsHTML = '';
                if (user.commissionTransactionNumber) {
                    transactionFieldsHTML += `
                        <div class="transaction-field premium-field">
                            <i class="fas fa-hashtag"></i>
                            <span class="field-label">رقم معاملة المفوضية:</span>
                            <span class="field-value">${user.commissionTransactionNumber}</span>
                            <button onclick="copyToClipboard('${user.commissionTransactionNumber}')" class="copy-btn" title="نسخ الرقم">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    `;
                }
                if (user.electricityTransaction) {
                    transactionFieldsHTML += `
                        <div class="transaction-field premium-field">
                            <i class="fas fa-bolt"></i>
                            <span class="field-label">معاملة الكهرباء:</span>
                            <span class="field-value">${user.electricityTransaction}</span>
                            <button onclick="copyToClipboard('${user.electricityTransaction}')" class="copy-btn" title="نسخ الرقم">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    `;
                }

                userCard.innerHTML = `
                    <div class="user-header premium-header">
                        <div class="user-badge ${userStatus}">
                            <i class="fas ${userStatus === 'complete' ? 'fa-crown' : 'fa-clock'}"></i>
                            ${userStatus === 'complete' ? 'مشروع مكتمل' : 'قيد الإنجاز'}
                        </div>
                        <div class="user-info">
                            <h3 class="user-name">
                                <i class="fas fa-user"></i> 
                                ${user.fullName || 'غير محدد'}
                            </h3>
                            <div class="user-details-grid">
                                <div class="detail-item">
                                    <i class="fas fa-id-card"></i>
                                    <span class="detail-label">رقم الهوية:</span>
                                    <span class="detail-value">${user.nationalId || 'غير محدد'}</span>
                                </div>
                                <div class="detail-item">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <span class="detail-label">العنوان:</span>
                                    <span class="detail-value">${user.address || 'غير محدد'}</span>
                                </div>
                                ${user.coordX && user.coordY ? `
                                <div class="detail-item">
                                    <i class="fas fa-globe"></i>
                                    <span class="detail-label">الإحداثيات:</span>
                                    <span class="detail-value">(X: ${user.coordX}, Y: ${user.coordY})</span>
                                </div>
                                ` : ''}
                                <div class="detail-item">
                                    <i class="fas fa-solar-panel"></i>
                                    <span class="detail-label">حجم النظام:</span>
                                    <span class="detail-value">${user.systemSize || '0'} كيلوواط</span>
                                </div>
                                <div class="detail-item">
                                    <i class="fas fa-dollar-sign"></i>
                                    <span class="detail-label">السعر:</span>
                                    <span class="detail-value">${user.systemPrice ? parseFloat(user.systemPrice).toLocaleString() : '0'} د.أ</span>
                                </div>
                                <div class="detail-item">
                                    <i class="fas fa-phone"></i>
                                    <span class="detail-label">الهاتف:</span>
                                    <span class="detail-value">${user.phoneNumber || 'غير محدد'}</span>
                                </div>
                                <div class="detail-item password-item">
                                    <i class="fas fa-key"></i>
                                    <span class="detail-label">كلمة المرور:</span>
                                    <span id="password-text-${user.id}" class="detail-value password-text">${user.password || 'غير محددة'}</span>
                                    <button onclick="toggleUserPasswordVisibility('${user.id}')" class="password-toggle-btn premium-btn" title="إظهار/إخفاء">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                                ${user.paymentMethod ? `
                                <div class="detail-item">
                                    <i class="fas fa-credit-card"></i>
                                    <span class="detail-label">طريقة الدفع:</span>
                                    <span class="detail-value">${user.paymentMethod}</span>
                                </div>
                                ` : ''}
                                ${user.paymentDetails ? `
                                <div class="detail-item">
                                    <i class="fas fa-info-circle"></i>
                                    <span class="detail-label">تفاصيل الدفع:</span>
                                    <span class="detail-value">${user.paymentDetails}</span>
                                </div>
                                ` : ''}
                                ${user.commissionNotes ? `
                                <div class="detail-item">
                                    <i class="fas fa-sticky-note"></i>
                                    <span class="detail-label">ملاحظات المفوضية:</span>
                                    <span class="detail-value">${user.commissionNotes}</span>
                                </div>
                                ` : ''}
                                ${user.companyNotes ? `
                                <div class="detail-item">
                                    <i class="fas fa-sticky-note"></i>
                                    <span class="detail-label">ملاحظات الشركة:</span>
                                    <span class="detail-value">${user.companyNotes}</span>
                                </div>
                                ` : ''}
                                ${transactionFieldsHTML}
                            </div>
                        </div>
                        <div class="user-actions premium-actions">
                            <button class="edit-btn premium-edit-btn" onclick="editUser('${user.id}')" title="تعديل المستخدم">
                                <i class="fas fa-edit"></i> 
                                <span>تعديل</span>
                            </button>
                            <button class="delete-btn premium-delete-btn" onclick="deleteUser('${user.id}')" title="حذف المستخدم">
                                <i class="fas fa-trash"></i> 
                                <span>حذف</span>
                            </button>
                            <button class="copy-btn premium-copy-btn" onclick="copyUserInfo('${user.id}')" title="نسخ معلومات المستخدم">
                                <i class="fas fa-copy"></i> 
                                <span>نسخ</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="documents-section premium-documents">
                        <h4 class="section-title">
                            <i class="fas fa-file-alt"></i> 
                            الوثائق المطلوبة
                            <span class="documents-count">(${stats.completed}/${stats.total})</span>
                        </h4>
                        <div class="documents-grid premium-grid">
                            ${window.AppConfig.DOCUMENT_NAMES.map((name, index) => `
                                <div class="document-item premium-doc ${user.documents && user.documents[index] ? 'completed' : 'incomplete'}" 
                                     onclick="toggleDocument('${user.id}', ${index})"
                                     title="انقر لتغيير حالة الوثيقة: ${name}">
                                    <div class="document-number">${index + 1}</div>
                                    <div class="document-name">${name}</div>
                                    <div class="document-status">
                                        ${user.documents && user.documents[index] ? 
                                            '<i class="fas fa-check-circle success-icon"></i>' : 
                                            '<i class="fas fa-clock warning-icon"></i>'}
                                    </div>
                                    <div class="document-progress">
                                        <div class="progress-fill" style="width: ${user.documents && user.documents[index] ? '100%' : '0%'}"></div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="progress-section premium-progress">
                        <div class="progress-info">
                            <div class="progress-stats">
                                <span class="progress-text">
                                    <i class="fas fa-chart-pie"></i> 
                                    التقدم العام:
                                </span>
                                <span class="progress-numbers">
                                    <strong>${stats.completed}/${stats.total}</strong>
                                    <span class="progress-percentage">${stats.percentage}%</span>
                                </span>
                            </div>
                            <div class="progress-time">
                                <i class="fas fa-calendar"></i>
                                ${user.updatedAt ? new Date(user.updatedAt.seconds * 1000).toLocaleDateString('ar-EG') : 'غير محدد'}
                            </div>
                        </div>
                        <div class="progress-bar premium-bar">
                            <div class="progress-fill" style="width: ${stats.percentage}%"></div>
                            <div class="progress-steps">
                                ${Array.from({length: 5}, (_, i) => 
                                    `<div class="progress-step ${stats.percentage >= (i + 1) * 20 ? 'active' : ''}"></div>`
                                ).join('')}
                            </div>
                        </div>
                    </div>
                `;
                
                container.appendChild(userCard);
            });
        };

        console.log('✅ تم إصلاح عرض حقول المعاملات بنجاح');
    }

    // =============================================
    // 2. نظام التحقق من الأخطاء المتطور
    // =============================================

    function initAdvancedValidationSystem() {
        console.log('🛡️ تهيئة نظام التحقق المتقدم...');
        
        // استبدال دالة addUser الأصلية
        overrideAddUserWithValidation();
        
        // إضافة التحقق في الوقت الحقيقي
        addRealTimeValidation();
        
        // إضافة مؤشرات التحقق البصرية
        addValidationIndicators();
    }

    function overrideAddUserWithValidation() {
        const originalAddUser = window.addUser;
        
        window.addUser = async function() {
            const formData = getFormData();
            
            // التحقق المتقدم من البيانات
            const validationResult = await advancedFormValidation(formData, true);
            
            if (!validationResult.isValid) {
                showAdvancedValidationErrors(validationResult.errors);
                return;
            }
            
            // إذا كانت البيانات صحيحة، المتابعة للإضافة
            try {
                showLoading(true);
                
                const documents = Array(window.AppConfig.DOCUMENT_NAMES.length).fill(false);
                
                const keywords = [
                    formData.username.toLowerCase(),
                    formData.nationalId.toLowerCase(),
                    formData.phoneNumber.toLowerCase(),
                    formData.address.toLowerCase()
                ];
                
                // إضافة الحقول الجديدة إلى keywords
                if (formData.commissionTransactionNumber) {
                    keywords.push(formData.commissionTransactionNumber.toLowerCase());
                }
                if (formData.electricityTransaction) {
                    keywords.push(formData.electricityTransaction.toLowerCase());
                }
                
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
                    companyNotes: formData.companyNotes,
                    commissionTransactionNumber: formData.commissionTransactionNumber || null,
                    electricityTransaction: formData.electricityTransaction || null,
                    documents: documents,
                    keywords: keywords,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                };
                
                const docRef = await db.collection('users').add(userData);
                
                await addHistoryLog(docRef.id, formData.username, 'add', 'تم إضافة مستخدم جديد');
                await addNotification('مستخدم جديد', `تم إضافة المستخدم ${formData.username} بنجاح`);
                
                clearForm();
                showAdvancedAlert('تم إضافة المستخدم بنجاح!', 'success', 'fas fa-check-circle');
                loadUsers();
                
            } catch (error) {
                console.error('فشل في إضافة المستخدم:', error);
                showAdvancedAlert('فشل في إضافة المستخدم: ' + error.message, 'error', 'fas fa-exclamation-triangle');
            } finally {
                showLoading(false);
            }
        };
    }

    async function advancedFormValidation(formData, isNewUser = false) {
        const errors = [];
        const warnings = [];

        // التحقق من الحقول المطلوبة
        const requiredFields = [
            { field: 'username', name: 'اسم المستخدم' },
            { field: 'nationalId', name: 'رقم الهوية' },
            { field: 'address', name: 'العنوان' },
            { field: 'systemSize', name: 'حجم النظام' },
            { field: 'systemPrice', name: 'سعر النظام' },
            { field: 'phoneNumber', name: 'رقم الهاتف' }
        ];

        for (const { field, name } of requiredFields) {
            if (!formData[field] && formData[field] !== 0) {
                errors.push({
                    field: field,
                    message: `${name} حقل مطلوب`,
                    type: 'required',
                    icon: 'fas fa-exclamation-circle'
                });
            }
        }

        // التحقق من كلمة المرور للمستخدمين الجدد
        if (isNewUser) {
            if (!formData.password) {
                errors.push({
                    field: 'password',
                    message: 'كلمة المرور مطلوبة',
                    type: 'password_required',
                    icon: 'fas fa-key'
                });
            } else if (formData.password.length < 6) {
                errors.push({
                    field: 'password',
                    message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
                    type: 'password_length',
                    icon: 'fas fa-key'
                });
            } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(formData.password)) {
                warnings.push({
                    field: 'password',
                    message: 'يفضل أن تحتوي كلمة المرور على أحرف وأرقام',
                    type: 'password_strength',
                    icon: 'fas fa-shield-alt'
                });
            }
        }

        // التحقق من رقم الهوية
        if (formData.nationalId) {
            const nationalIdRegex = /^[0-9]{14}$/;
            if (!nationalIdRegex.test(formData.nationalId)) {
                errors.push({
                    field: 'nationalId',
                    message: 'رقم الهوية يجب أن يتكون من 14 رقمًا',
                    type: 'national_id_format',
                    icon: 'fas fa-id-card'
                });
            }
        }

        // التحقق من رقم الهاتف
        if (formData.phoneNumber) {
            const cleanPhone = formData.phoneNumber.replace(/[\s-]/g, '');
            if (!window.AppConfig.PHONE_PATTERN.test(cleanPhone)) {
                errors.push({
                    field: 'phoneNumber',
                    message: 'رقم الهاتف يجب أن يكون بتنسيق أردني صحيح (يبدأ بـ 07 ويتبعه 8 أرقام)',
                    type: 'phone_format',
                    icon: 'fas fa-phone'
                });
            }
        }

        // التحقق من حجم النظام
        if (formData.systemSize) {
            const systemSize = parseFloat(formData.systemSize);
            if (isNaN(systemSize) || systemSize <= 0) {
                errors.push({
                    field: 'systemSize',
                    message: 'حجم النظام يجب أن يكون رقمًا موجبًا',
                    type: 'system_size_invalid',
                    icon: 'fas fa-solar-panel'
                });
            } else if (systemSize > 1000) {
                warnings.push({
                    field: 'systemSize',
                    message: 'حجم النظام كبير جدًا، الرجاء التأكد من القيمة',
                    type: 'system_size_large',
                    icon: 'fas fa-solar-panel'
                });
            }
        }

        // التحقق من سعر النظام
        if (formData.systemPrice) {
            const systemPrice = parseFloat(formData.systemPrice);
            if (isNaN(systemPrice) || systemPrice < 0) {
                errors.push({
                    field: 'systemPrice',
                    message: 'سعر النظام يجب أن يكون رقمًا موجبًا',
                    type: 'system_price_invalid',
                    icon: 'fas fa-dollar-sign'
                });
            }
        }

        // التحقق من الإحداثيات
        if (formData.coordX && formData.coordY) {
            const coordX = parseFloat(formData.coordX);
            const coordY = parseFloat(formData.coordY);
            
            if (isNaN(coordX) || isNaN(coordY)) {
                errors.push({
                    field: 'coordX',
                    message: 'الإحداثيات يجب أن تكون أرقامًا صحيحة',
                    type: 'coordinates_invalid',
                    icon: 'fas fa-globe'
                });
            }
        }

        // التحقق من التكرار (رقم الهوية والهاتف)
        if (isNewUser) {
            try {
                // التحقق من رقم الهوية المكرر
                const nationalIdSnapshot = await db.collection('users')
                    .where('nationalId', '==', formData.nationalId)
                    .limit(1)
                    .get();
                
                if (!nationalIdSnapshot.empty) {
                    errors.push({
                        field: 'nationalId',
                        message: 'رقم الهوية مسجل مسبقًا في النظام',
                        type: 'national_id_duplicate',
                        icon: 'fas fa-ban'
                    });
                }

                // التحقق من رقم الهاتف المكرر
                const phoneSnapshot = await db.collection('users')
                    .where('phoneNumber', '==', formData.phoneNumber)
                    .limit(1)
                    .get();
                
                if (!phoneSnapshot.empty) {
                    errors.push({
                        field: 'phoneNumber',
                        message: 'رقم الهاتف مسجل مسبقًا في النظام',
                        type: 'phone_duplicate',
                        icon: 'fas fa-ban'
                    });
                }
            } catch (error) {
                console.warn('تعذر التحقق من التكرار:', error);
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            warnings: warnings,
            hasWarnings: warnings.length > 0
        };
    }

    function showAdvancedValidationErrors(validationErrors) {
        const errorContainer = document.getElementById('validationErrors') || createValidationContainer();
        
        errorContainer.innerHTML = `
            <div class="validation-header error-header">
                <i class="fas fa-exclamation-triangle"></i>
                <h4>يوجد أخطاء في البيانات المدخلة</h4>
                <button onclick="closeValidationPanel()" class="close-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="validation-list">
                ${validationErrors.map(error => `
                    <div class="validation-item error-item" data-field="${error.field}">
                        <div class="validation-icon">
                            <i class="${error.icon}"></i>
                        </div>
                        <div class="validation-content">
                            <div class="validation-message">${error.message}</div>
                            <div class="validation-field">الحقل: ${getFieldArabicName(error.field)}</div>
                        </div>
                        <button onclick="focusOnField('${error.field}')" class="validation-action-btn">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
        
        errorContainer.style.display = 'block';
        
        // إضافة تأثير الاهتزاز للحقول التي بها أخطاء
        validationErrors.forEach(error => {
            const fieldElement = document.getElementById(error.field);
            if (fieldElement) {
                fieldElement.classList.add('field-error');
                fieldElement.focus();
            }
        });
        
        // تشغيل صوت التنبيه
        playErrorSound();
    }

    function createValidationContainer() {
        const container = document.createElement('div');
        container.id = 'validationErrors';
        container.className = 'validation-container';
        container.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border: 2px solid #e74c3c;
            border-radius: 15px;
            padding: 20px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            z-index: 10000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            display: none;
        `;
        document.body.appendChild(container);
        return container;
    }

    function getFieldArabicName(fieldId) {
        const fieldNames = {
            'username': 'اسم المستخدم',
            'password': 'كلمة المرور',
            'nationalId': 'رقم الهوية',
            'address': 'العنوان',
            'coordX': 'الإحداثي X',
            'coordY': 'الإحداثي Y',
            'systemSize': 'حجم النظام',
            'systemPrice': 'سعر النظام',
            'phoneNumber': 'رقم الهاتف',
            'paymentMethod': 'طريقة الدفع',
            'paymentDetails': 'تفاصيل الدفع',
            'commissionNotes': 'ملاحظات المفوضية',
            'companyNotes': 'ملاحظات الشركة',
            'commissionTransactionNumber': 'رقم معاملة المفوضية',
            'electricityTransaction': 'معاملة الكهرباء'
        };
        
        return fieldNames[fieldId] || fieldId;
    }

    // =============================================
    // 3. تحسين واجهة الإشعارات
    // =============================================

    function enhanceNotificationsSystem() {
        // استبدال دالة showAlert الأصلية
        overrideShowAlertFunction();
        
        // إضافة نظام الإشعارات المتقدم
        initAdvancedNotifications();
    }

    function overrideShowAlertFunction() {
        const originalShowAlert = window.showAlert;
        
        window.showAlert = function(message, type = 'success', icon = null) {
            showAdvancedAlert(message, type, icon);
        };
    }

    function showAdvancedAlert(message, type = 'success', icon = null) {
        // تحديد الأيقونة المناسبة حسب النوع
        if (!icon) {
            switch (type) {
                case 'success':
                    icon = 'fas fa-check-circle';
                    break;
                case 'error':
                    icon = 'fas fa-exclamation-triangle';
                    break;
                case 'warning':
                    icon = 'fas fa-exclamation-circle';
                    break;
                case 'info':
                    icon = 'fas fa-info-circle';
                    break;
                default:
                    icon = 'fas fa-bell';
            }
        }
        
        // تحديد اللون المناسب
        let backgroundColor, textColor, borderColor;
        switch (type) {
            case 'success':
                backgroundColor = '#27ae60';
                textColor = '#ffffff';
                borderColor = '#219653';
                break;
            case 'error':
                backgroundColor = '#e74c3c';
                textColor = '#ffffff';
                borderColor = '#c0392b';
                break;
            case 'warning':
                backgroundColor = '#f39c12';
                textColor = '#ffffff';
                borderColor = '#e67e22';
                break;
            case 'info':
                backgroundColor = '#3498db';
                textColor = '#ffffff';
                borderColor = '#2980b9';
                break;
            default:
                backgroundColor = '#34495e';
                textColor = '#ffffff';
                borderColor = '#2c3e50';
        }
        
        // إنشاء عنصر التنبيه المتقدم
        const toast = document.createElement('div');
        toast.className = `advanced-toast ${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${backgroundColor};
            color: ${textColor};
            padding: 20px 25px;
            border-radius: 12px;
            z-index: 10000;
            transform: translateX(400px);
            transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            max-width: 400px;
            min-width: 300px;
            word-wrap: break-word;
            border-left: 4px solid ${borderColor};
            display: flex;
            align-items: center;
            gap: 15px;
        `;
        
        toast.innerHTML = `
            <div class="toast-icon" style="font-size: 24px;">
                <i class="${icon}"></i>
            </div>
            <div class="toast-content" style="flex: 1;">
                <div class="toast-message" style="font-weight: 500; margin-bottom: 5px;">${message}</div>
                <div class="toast-time" style="font-size: 12px; opacity: 0.9;">
                    ${new Date().toLocaleTimeString('ar-EG')}
                </div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()" 
                    style="background: none; border: none; color: inherit; cursor: pointer; font-size: 16px;">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(toast);
        
        // إظهار التنبيم مع تأثير متطور
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // تشغيل الصوت المناسب
        playNotificationSound(type);
        
        // إخفاء التنبيه بعد 5 ثوانٍ
        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 400);
        }, 5000);
    }

    function playNotificationSound(type = 'success') {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            if (type === 'error') {
                // صوت خطأ - نغمة منخفضة
                playErrorSound(audioContext);
            } else {
                // صوت نجاح - نغمة عالية
                playSuccessSound(audioContext);
            }
        } catch (error) {
            console.log('لا يمكن تشغيل صوت الإشعار:', error);
        }
    }

    function playSuccessSound(audioContext) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2);
        
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }

    function playErrorSound(audioContext) {
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator1.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator1.frequency.setValueAtTime(300, audioContext.currentTime + 0.1);
        
        oscillator2.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator2.frequency.setValueAtTime(200, audioContext.currentTime + 0.1);
        
        oscillator1.type = 'sawtooth';
        oscillator2.type = 'sawtooth';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator1.start(audioContext.currentTime);
        oscillator2.start(audioContext.currentTime);
        
        oscillator1.stop(audioContext.currentTime + 0.3);
        oscillator2.stop(audioContext.currentTime + 0.3);
    }

    // =============================================
    // 4. إضافة مؤشرات بصرية متقدمة
    // =============================================

    function addAdvancedVisualIndicators() {
        addCSSStyles();
        addGlobalFunctions();
    }

    function addCSSStyles() {
        const styles = `
            /* أنماط البطاقات المميزة */
            .premium-card {
                background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
                border: 1px solid #e0e6ed;
                border-radius: 15px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                transition: all 0.3s ease;
                overflow: hidden;
            }
            
            .premium-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 30px rgba(0,0,0,0.12);
            }
            
            .premium-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                position: relative;
            }
            
            .user-badge {
                position: absolute;
                top: 15px;
                left: 15px;
                padding: 5px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
            }
            
            .user-badge.complete {
                background: rgba(39, 174, 96, 0.9);
            }
            
            .user-badge.incomplete {
                background: rgba(243, 156, 18, 0.9);
            }
            
            .user-details-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 15px;
                margin-top: 15px;
            }
            
            .detail-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 8px 12px;
                background: rgba(255,255,255,0.1);
                border-radius: 8px;
            }
            
            .transaction-field {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px 15px;
                background: rgba(255,255,255,0.15);
                border-radius: 10px;
                border: 1px solid rgba(255,255,255,0.2);
            }
            
            .premium-actions {
                display: flex;
                gap: 8px;
                margin-top: 15px;
            }
            
            .premium-edit-btn, .premium-delete-btn, .premium-copy-btn {
                padding: 8px 15px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 5px;
                font-size: 12px;
            }
            
            .premium-edit-btn {
                background: #3498db;
                color: white;
            }
            
            .premium-delete-btn {
                background: #e74c3c;
                color: white;
            }
            
            .premium-copy-btn {
                background: #95a5a6;
                color: white;
            }
            
            /* أنماط التحقق من الصحة */
            .field-error {
                border-color: #e74c3c !important;
                background-color: #fdf2f2 !important;
                animation: shake 0.5s ease-in-out;
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
            
            .validation-container {
                backdrop-filter: blur(10px);
                background: rgba(255,255,255,0.95) !important;
            }
            
            .error-header {
                background: linear-gradient(135deg, #e74c3c, #c0392b);
                color: white;
                padding: 15px;
                border-radius: 10px 10px 0 0;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .error-item {
                background: #fdf2f2;
                border: 1px solid #f5b7b1;
                border-radius: 8px;
                padding: 12px;
                margin: 8px 0;
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .validation-icon {
                font-size: 18px;
                color: #e74c3c;
            }
            
            /* أنماط الإشعارات المتقدمة */
            .advanced-toast {
                backdrop-filter: blur(10px);
                background: rgba(39, 174, 96, 0.95) !important;
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    function addGlobalFunctions() {
        // دالة نسخ معلومات المستخدم
        window.copyUserInfo = function(userId) {
            const user = users.find(u => u.id === userId);
            if (user) {
                const userInfo = `
👤 الاسم: ${user.fullName}
🆔 رقم الهوية: ${user.nationalId}
📞 الهاتف: ${user.phoneNumber}
📍 العنوان: ${user.address}
⚡ حجم النظام: ${user.systemSize} كيلوواط
💰 السعر: ${user.systemPrice ? parseFloat(user.systemPrice).toLocaleString() : '0'} د.أ
🔑 كلمة المرور: ${user.password}
${user.commissionTransactionNumber ? `🔢 معاملة المفوضية: ${user.commissionTransactionNumber}` : ''}
${user.electricityTransaction ? `⚡ معاملة الكهرباء: ${user.electricityTransaction}` : ''}
                `.trim();
                
                navigator.clipboard.writeText(userInfo).then(() => {
                    showAdvancedAlert('تم نسخ معلومات المستخدم إلى الحافظة', 'success', 'fas fa-copy');
                }).catch(() => {
                    showAdvancedAlert('فشل في نسخ المعلومات', 'error', 'fas fa-exclamation-triangle');
                });
            }
        };
        
        // دالة نسخ النص
        window.copyToClipboard = function(text) {
            navigator.clipboard.writeText(text).then(() => {
                showAdvancedAlert('تم نسخ النص: ' + text, 'success', 'fas fa-copy');
            });
        };
        
        
        window.focusOnField = function(fieldId) {
            const fieldElement = document.getElementById(fieldId);
            if (fieldElement) {
                fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                fieldElement.focus();
            }
            closeValidationPanel();
        };
        
        // دالة إغلاق لوحة التحقق
        window.closeValidationPanel = function() {
            const panel = document.getElementById('validationErrors');
            if (panel) {
                panel.style.display = 'none';
            }
            
            // إزالة تأثير الخطأ من جميع الحقول
            document.querySelectorAll('.field-error').forEach(element => {
                element.classList.remove('field-error');
            });
        };
        
        // دالة التحقق في الوقت الحقيقي
        window.realTimeValidation = async function(fieldId) {
            const fieldElement = document.getElementById(fieldId);
            if (!fieldElement) return;
            
            const value = fieldElement.value.trim();
            if (!value) return;
            
            // إضافة تحقق فوري للحقول المهمة
            if (fieldId === 'nationalId' && value.length !== 14) {
                fieldElement.classList.add('field-error');
            } else if (fieldId === 'phoneNumber') {
                const cleanPhone = value.replace(/[\s-]/g, '');
                if (!window.AppConfig.PHONE_PATTERN.test(cleanPhone)) {
                    fieldElement.classList.add('field-error');
                } else {
                    fieldElement.classList.remove('field-error');
                }
            } else if (fieldId === 'password' && value.length < 6) {
                fieldElement.classList.add('field-error');
            } else {
                fieldElement.classList.remove('field-error');
            }
        };
    }

    function addRealTimeValidation() {
        // إضافة مستمعات الأحداث للحقول المهمة
        const importantFields = ['nationalId', 'phoneNumber', 'password', 'systemSize', 'systemPrice'];
        
        importantFields.forEach(fieldId => {
            const fieldElement = document.getElementById(fieldId);
            if (fieldElement) {
                fieldElement.addEventListener('blur', () => window.realTimeValidation(fieldId));
                fieldElement.addEventListener('input', () => {
                    if (fieldElement.classList.contains('field-error')) {
                        fieldElement.classList.remove('field-error');
                    }
                });
            }
        });
    }

    function addValidationIndicators() {
        // إضافة مؤشرات بصرية بجوار الحقول
        const fieldsToValidate = ['username', 'nationalId', 'phoneNumber', 'password'];
        
        fieldsToValidate.forEach(fieldId => {
            const fieldElement = document.getElementById(fieldId);
            if (fieldElement && !fieldElement.parentNode.querySelector('.validation-indicator')) {
                const indicator = document.createElement('div');
                indicator.className = 'validation-indicator';
                indicator.innerHTML = '<i class="fas fa-check" style="color: #27ae60;"></i>';
                indicator.style.cssText = `
                    position: absolute;
                    right: 10px;
                    top: 50%;
                    transform: translateY(-50%);
                    display: none;
                `;
                
                fieldElement.parentNode.style.position = 'relative';
                fieldElement.parentNode.appendChild(indicator);
                
                fieldElement.addEventListener('input', function() {
                    if (this.value.trim().length > 0) {
                        indicator.style.display = 'block';
                    } else {
                        indicator.style.display = 'none';
                    }
                });
            }
        });
    }

    // =============================================
    // وظائف مساعدة متقدمة
    // =============================================

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
            companyNotes: getValue('companyNotes'),
            commissionTransactionNumber: getValue('commissionTransactionNumber'),
            electricityTransaction: getValue('electricityTransaction')
        };
    }

    function getValue(elementId) {
        const element = document.getElementById(elementId);
        return element ? element.value.trim() : '';
    }
})();
function init (){

    console.log('🎯 نظام الإصلاحات المتقدم جاهز للعمل');
    console.log('📋 الميزات المضمنة:');
    console.log('   ✅ عرض حقول المعاملات في البطاقات');
    console.log('   ✅ نظام تحقق متقدم من الأخطاء');
    console.log('   ✅ إشعارات فاخرة مع أصوات');
    console.log('   ✅ مؤشرات بصرية متطورة');
    console.log('   ✅ تحقق في الوقت الحقيقي');
    console.log('   ✅ نسخ المعلومات بنقرة واحدة');
}
init();