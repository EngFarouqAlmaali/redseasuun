(function() {
    'use strict';

    console.log('🔧 تحميل الإصلاحات السريعة...');

    // الانتظار حتى تحميل الصفحة بالكامل
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initQuickFixes);
    } else {
        initQuickFixes();
    }

    function initQuickFixes() {
        console.log('🚀 بدء الإصلاحات السريعة...');
        
        // 1. إصلاح عرض الحقول الجديدة
        fixTransactionFields();
        
        // 2. نظام التحقق البسيط
        setupSimpleValidation();
        
        console.log('✅ تم التحميل بنجاح');
    }

    // 1. إصلاح عرض الحقول الجديدة في البطاقات
    function fixTransactionFields() {
        const originalDisplayUsers = window.displayUsers;
        
        window.displayUsers = function(usersToDisplay = users) {
            const container = document.getElementById('usersContainer');
            if (!container) return;

            container.innerHTML = '';

            if (usersToDisplay.length === 0) {
                container.innerHTML = `
                    <div class="no-users-message">
                        <i class="fas fa-users"></i>
                        <p>لم يتم العثور على مستخدمين.</p>
                    </div>
                `;
                return;
            }

            usersToDisplay.forEach((user, index) => {
                const userStatus = isProjectComplete(user) ? 'complete' : 'incomplete';
                const stats = getCompletionStats(user);
                
                // HTML للحقول الجديدة
                let transactionFieldsHTML = '';
                if (user.commissionTransactionNumber) {
                    transactionFieldsHTML += `<p><i class="fas fa-hashtag"></i> رقم معاملة المفوضية: ${user.commissionTransactionNumber}</p>`;
                }
                if (user.electricityTransaction) {
                    transactionFieldsHTML += `<p><i class="fas fa-bolt"></i> معاملة الكهرباء: ${user.electricityTransaction}</p>`;
                }
                
                const userCard = document.createElement('div');
                userCard.className = 'user-card';
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
                                <span id="password-text-${user.id}">${user.password || 'غير محددة'}</span>
                                <button onclick="toggleUserPasswordVisibility('${user.id}')">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </p>
                            ${user.paymentMethod ? `<p><i class="fas fa-credit-card"></i> طريقة الدفع: ${user.paymentMethod}</p>` : ''}
                            ${user.paymentDetails ? `<p><i class="fas fa-info-circle"></i> تفاصيل الدفع: ${user.paymentDetails}</p>` : ''}
                            ${user.commissionNotes ? `<p><i class="fas fa-sticky-note"></i> ملاحظات المفوضية: ${user.commissionNotes}</p>` : ''}
                            ${user.companyNotes ? `<p><i class="fas fa-sticky-note"></i> ملاحظات الشركة: ${user.companyNotes}</p>` : ''}
                            ${transactionFieldsHTML}
                        </div>
                        <div class="user-actions">
                            <div class="user-status status-${userStatus}">
                                ${userStatus === 'complete' ? '✅ مكتمل' : '⏳ قيد الإنجاز'}
                            </div>
                            <button class="edit-btn" onclick="editUser('${user.id}')">
                                <i class="fas fa-edit"></i> تعديل
                            </button>
                            <button class="delete-btn" onclick="deleteUser('${user.id}')">
                                <i class="fas fa-trash"></i> حذف
                            </button>
                        </div>
                    </div>
                    
                    <div class="documents-section">
                        <h4><i class="fas fa-file-alt"></i> الوثائق المطلوبة:</h4>
                        <div class="documents-grid">
                            ${window.AppConfig.DOCUMENT_NAMES.map((name, index) => `
                                <div class="document-item ${user.documents && user.documents[index] ? 'completed' : 'incomplete'}" 
                                    onclick="toggleDocument('${user.id}', ${index})">
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
        };
    }

    // 2. نظام التحقق البسيط
    function setupSimpleValidation() {
        const originalAddUser = window.addUser;
        
        window.addUser = async function() {
            const formData = getFormData();
            
            // التحقق البسيط من الأخطاء
            const errors = validateUserData(formData, true);
            
            if (errors.length > 0) {
                showValidationErrors(errors);
                return;
            }
            
            // إذا لا توجد أخطاء، استدعاء الدالة الأصلية
            return originalAddUser.call(this);
        };
    }

    function validateUserData(formData, isNewUser = false) {
        const errors = [];

        // الحقول المطلوبة
        if (!formData.username) errors.push('اسم المستخدم مطلوب');
        if (!formData.nationalId) errors.push('رقم الهوية مطلوب');
        if (!formData.address) errors.push('العنوان مطلوب');
        if (!formData.systemSize) errors.push('حجم النظام مطلوب');
        if (!formData.systemPrice) errors.push('سعر النظام مطلوب');
        if (!formData.phoneNumber) errors.push('رقم الهاتف مطلوب');

        // كلمة المرور للمستخدمين الجدد
        if (isNewUser) {
            if (!formData.password) {
                errors.push('كلمة المرور مطلوبة');
            } else if (formData.password.length < 6) {
                errors.push('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            }
        }

        // رقم الهوية (14 رقم)
        if (formData.nationalId && formData.nationalId.length !== 14) {
            errors.push('رقم الهوية يجب أن يتكون من 14 رقمًا');
        }

        // رقم الهاتف
        if (formData.phoneNumber) {
            const cleanPhone = formData.phoneNumber.replace(/[\s-]/g, '');
            if (!window.AppConfig.PHONE_PATTERN.test(cleanPhone)) {
                errors.push('رقم الهاتف يجب أن يكون بتنسيق أردني صحيح (يبدأ بـ 07 ويتبعه 8 أرقام)');
            }
        }

        // حجم النظام (رقم موجب)
        if (formData.systemSize && (isNaN(formData.systemSize) || parseFloat(formData.systemSize) <= 0)) {
            errors.push('حجم النظام يجب أن يكون رقمًا موجبًا');
        }

        // سعر النظام (رقم موجب)
        if (formData.systemPrice && (isNaN(formData.systemPrice) || parseFloat(formData.systemPrice) < 0)) {
            errors.push('سعر النظام يجب أن يكون رقمًا موجبًا');
        }

        return errors;
    }

    function showValidationErrors(errors) {
        let errorMessage = 'يوجد الأخطاء التالية:\n\n';
        errors.forEach((error, index) => {
            errorMessage += `${index + 1}. ${error}\n`;
        });
        
        alert(errorMessage);
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
            companyNotes: getValue('companyNotes'),
            commissionTransactionNumber: getValue('commissionTransactionNumber'),
            electricityTransaction: getValue('electricityTransaction')
        };
    }

    function getValue(elementId) {
        const element = document.getElementById(elementId);
        return element ? element.value.trim() : '';
    }

    // تعريف الدوال في النطاق العام
    window.quickExport = function() {
        alert('ميزة التصدير السريع - سيتم تنفيذها لاحقاً');
    };

    window.initAdvancedNotifications = function() {
        console.log('الإشعارات المتقدمة جاهزة');
    };

})();