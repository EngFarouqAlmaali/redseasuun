// وظيفة إخفاء إحصائيات التعديلات
function hideEditStats() {
    const editStats = document.getElementById('editStats');
    if (editStats) {
        // إضافة صنف للتأثير الانتقالي
        editStats.classList.add('fade-out');
        
        // إخفاء العنصر بعد اكتمال التأثير
        setTimeout(() => {
            editStats.style.display = 'none';
            editStats.classList.remove('fade-out');
            
            // إظهار قسم إضافة المستخدم
            const addUserSection = document.querySelector('.add-user-section');
            if (addUserSection) {
                addUserSection.classList.add('fade-in');
                addUserSection.style.display = 'block';
            }
        }, 300);
    }
}

// وظيفة تحديث واجهة إحصائيات التعديلات مع زر الإغلاق
function updateEditStatsWithCloseButton() {
    const editStats = document.getElementById('editStats');
    if (!editStats) return;

    // إضافة زر الإغلاق
    const closeButton = `
        <button class="close-stats-btn" onclick="hideEditStats()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // إضافة الزر في بداية القسم
    editStats.insertAdjacentHTML('afterbegin', closeButton);
}

// تصدير الوظائف
window.hideEditStats = hideEditStats;
window.updateEditStatsWithCloseButton = updateEditStatsWithCloseButton;

// إضافة الأنماط المطلوبة
const styles = `
    .fade-out {
        opacity: 0 !important;
        transform: translateY(-20px) !important;
        transition: opacity 0.3s ease, transform 0.3s ease !important;
    }
    
    .fade-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
        transition: opacity 0.3s ease, transform 0.3s ease !important;
    }
    
    .close-stats-btn {
        position: absolute;
        top: 10px;
        left: 10px;
        background: var(--danger-gradient);
        color: white;
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.3s ease;
        z-index: 100;
    }
    
    .close-stats-btn:hover {
        transform: scale(1.1);
    }
`;

// إضافة الأنماط للصفحة
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// إضافة مستمع الأحداث عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    updateEditStatsWithCloseButton();
});