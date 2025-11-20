      // Theme Toggle - الميزة الثالثة: حفظ التفضيلات
        const themeToggle = document.getElementById('togglemod-id');
        const savedTheme = localStorage.getItem('theme');
        
        if(savedTheme === 'light') {
            document.body.classList.add('light-mode');
            themeToggle.querySelector('i').classList.replace('fa-sun', 'fa-moon');
        }

        themeToggle.onclick = function() {
            document.body.classList.toggle('light-mode');
            const icon = this.querySelector('i');
            
            if(document.body.classList.contains('light-mode')) {
                icon.classList.replace('fa-sun', 'fa-moon');
                localStorage.setItem('theme', 'light');
            } else {
                icon.classList.replace('fa-moon', 'fa-sun');
                localStorage.setItem('theme', 'dark');
            }
        };

        // Real-time Clock
        function updateTime() {
            const now = new Date();
            
            let hours = now.getHours();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            
            document.getElementById('current-time').textContent = `${hours}:${minutes}:${seconds} ${ampm}`;
            
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const dateString = now.toLocaleDateString('en-US', options);
            document.getElementById('current-date').textContent = dateString;
        }

        updateTime();
        setInterval(updateTime, 1000);

        // Welcome Message
        function showWelcome() {
            let alertDiv = document.createElement('div');
            alertDiv.style.cssText = `
                position: fixed;
                top: 30px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #ffd86b, #bfa23a);
                color: #1e2a78;
                padding: 15px 30px;
                border-radius: 10px;
                box-shadow: 0 5px 20px rgba(255, 216, 107, 0.4);
                z-index: 9999;
                opacity: 0;
                transition: opacity 0.3s;
                font-weight: 600;
            `;
            alertDiv.innerHTML = `<i class="fas fa-smile-beam"></i> مرحباً بك في لوحة التحكم!`;
            document.body.appendChild(alertDiv);

            setTimeout(() => alertDiv.style.opacity = '1', 10);
            setTimeout(() => {
                alertDiv.style.opacity = '0';
                setTimeout(() => alertDiv.remove(), 300);
            }, 2500);
        }

        showWelcome();
