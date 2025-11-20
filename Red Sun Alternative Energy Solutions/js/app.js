import { UserManager } from './user_manager.js';
import { SecureDatabase } from './security.js';

class App {
    constructor() {
        this.userManager = new UserManager();
        this.currentUser = null;
        this.init();
    }

    async init() {
        await this.checkAuth();
        this.bindEvents();
        this.loadUsers();
    }

    // ربط الأحداث
    bindEvents() {
        // حدث إضافة مستخدم
        document.getElementById('addUserBtn').addEventListener('click', () => {
            this.addUser();
        });

        // حدث البحث
        document.getElementById('searchInput').addEventListener('input', () => {
            this.filterUsers();
        });

        // حدث التصفية
        document.getElementById('statusFilter').addEventListener('change', () => {
            this.filterUsers();
        });
    }

    // إضافة مستخدم
    async addUser() {
        const userData = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
            idNumber: document.getElementById('firstName').value,
            address: document.getElementById('address').value,
            coordX: document.getElementById('coordX').value,
            coordY: document.getElementById('coordY').value,
            systemSize: document.getElementById('systemSize').value,
            systemPrice: document.getElementById('systemPrice').value,
            phoneNumber: document.getElementById('phoneNumber').value
        };

        try {
            await this.userManager.addUser(userData);
            this.showToast('تم إضافة المستخدم بنجاح', 'success');
            this.clearForm();
            this.loadUsers();
        } catch (error) {
            this.showToast(`خطأ: ${error.message}`, 'error');
        }
    }

    // تحميل المستخدمين وعرضهم
    async loadUsers() {
        try {
            const users = await this.userManager.getAllUsers();
            this.renderUsers(users);
        } catch (error) {
            this.showToast(`خطأ في تحميل البيانات: ${error.message}`, 'error');
        }
    }

    // عرض المستخدمين في الجدول
    renderUsers(users) {
        const container = document.getElementById('usersContainer');
        container.innerHTML = '';

        if (users.length === 0) {
            container.innerHTML = '<div class="no-users">لا يوجد مستخدمين</div>';
            return;
        }

        users.forEach(user => {
            const userCard = this.createUserCard(user);
            container.appendChild(userCard);
        });
    }

    // إنشاء بطاقة مستخدم
    createUserCard(user) {
        const card = document.createElement('div');
        card.className = 'user-card';
        
        const completionStatus = this.getCompletionStatus(user);
        
        card.innerHTML = `
            <div class="user-header">
                <h3>${user.username}</h3>
                <span class="status ${completionStatus.class}">${completionStatus.text}</span>
            </div>
            <div class="user-details">
                <p><strong>رقم الهوية:</strong> ${user.idNumber}</p>
                <p><strong>العنوان:</strong> ${user.address}</p>
                <p><strong>حجم النظام:</strong> ${user.systemSize} كيلوواط</p>
                <p><strong>السعر:</strong> ${user.systemPrice} $</p>
                <p><strong>الهاتف:</strong> ${user.phoneNumber}</p>
            </div>
            <div class="user-actions">
                <button class="btn-edit" onclick="app.editUser('${user.id}')">تعديل</button>
                <button class="btn-delete" onclick="app.deleteUser('${user.id}')">حذف</button>
            </div>
        `;
        
        return card;
    }

    // تصفية المستخدمين
    async filterUsers() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter').value;
        
        try {
            const users = await this.userManager.searchUsers(searchTerm, { status: statusFilter });
            this.renderUsers(users);
        } catch (error) {
            this.showToast(`خطأ في التصفية: ${error.message}`, 'error');
        }
    }

    // تعديل مستخدم
    async editUser(userId) {
        try {
            const user = await this.userManager.getUser(userId);
            this.openEditModal(user);
        } catch (error) {
            this.showToast(`خطأ: ${error.message}`, 'error');
        }
    }

    // فتح نافذة التعديل
    openEditModal(user) {
        // تعبئة النموذج ببيانات المستخدم
        document.getElementById('editUsername').value = user.username;
        document.getElementById('editPassword').value = ''; // لا نعرض كلمة المرور
        document.getElementById('editFirstName').value = user.idNumber;
        document.getElementById('editAddress').value = user.address;
        document.getElementById('editCoordX').value = user.coordX;
        document.getElementById('editCoordY').value = user.coordY;
        document.getElementById('editSystemSize').value = user.systemSize;
        document.getElementById('editSystemPrice').value = user.systemPrice;
        document.getElementById('editPhoneNumber').value = user.phoneNumber;

        // تخزين معرف المستخدم الحالي
        this.currentEditUserId = user.id;

        // عرض النافذة
        document.getElementById('editModal').style.display = 'block';
    }

    // حفظ التعديلات
    async saveUserChanges() {
        const userData = {
            username: document.getElementById('editUsername').value,
            idNumber: document.getElementById('editFirstName').value,
            address: document.getElementById('editAddress').value,
            coordX: document.getElementById('editCoordX').value,
            coordY: document.getElementById('editCoordY').value,
            systemSize: document.getElementById('editSystemSize').value,
            systemPrice: document.getElementById('editSystemPrice').value,
            phoneNumber: document.getElementById('editPhoneNumber').value
        };

        // إذا كانت كلمة المرور غير فارغة، قم بتحديثها
        const password = document.getElementById('editPassword').value;
        if (password) {
            userData.password = password;
        }

        try {
            await this.userManager.updateUser(this.currentEditUserId, userData);
            this.showToast('تم تحديث المستخدم بنجاح', 'success');
            this.closeEditModal();
            this.loadUsers();
        } catch (error) {
            this.showToast(`خطأ: ${error.message}`, 'error');
        }
    }

    // حذف مستخدم
    async deleteUser(userId) {
        if (confirm('هل أنت متأكد من أنك تريد حذف هذا المستخدم؟')) {
            try {
                await this.userManager.deleteUser(userId);
                this.showToast('تم حذف المستخدم بنجاح', 'success');
                this.loadUsers();
            } catch (error) {
                this.showToast(`خطأ: ${error.message}`, 'error');
            }
        }
    }

    // إظهار التنبيهات
    showToast(message, type = 'info') {
        // تنفيذ وظيفة إظهار التنبيهات
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast show ${type}`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // الحصول على حالة إكمال الوثائق
    getCompletionStatus(user) {
        const completed = user.documents.filter(d => d).length;
        const total = user.documents.length;
        const percentage = (completed / total) * 100;
        
        if (percentage === 100) {
            return { class: 'complete', text: 'مكتمل' };
        } else if (percentage > 0) {
            return { class: 'partial', text: `قيد الإنجاز (${completed}/${total})` };
        } else {
            return { class: 'incomplete', text: 'غير مكتمل' };
        }
    }

    // مسح النموذج
    clearForm() {
        document.getElementById('userForm').reset();
    }

    // إغلاق نافذة التعديل
    closeEditModal() {
        document.getElementById('editModal').style.display = 'none';
        this.currentEditUserId = null;
    }
}

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
console.log("███████╗    ████████╗");
console.log("██╔════╝    ╚══██╔══╝");
console.log("█████╗         ██║");
console.log("██╔══╝         ██║");
console.log("██║            ██║");
console.log("╚═╝            ╚═╝");