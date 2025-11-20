

        // Load theme from localStorage
        function loadThemeFromStorage() {
            const savedTheme = localStorage.getItem('dashboardTheme') || 'dark';
            if (savedTheme === 'light') {
                document.body.classList.add('light-theme');
                currentTheme = 'light';
                themeIcon.className = 'fas fa-sun';
                themeText.textContent = 'الوضع الليلي';
            }
        }

        // Setup event listeners
        function setupEventListeners() {
            document.getElementById('refreshData').addEventListener('click', fetchData);
            document.getElementById('exportData').addEventListener('click', exportData);
            themeToggle.addEventListener('click', toggleTheme);
        }

        // Show loading indicator
        function showLoading() {
            loadingIndicator.classList.add('show');
        }

        // Hide loading indicator
        function hideLoading() {
            loadingIndicator.classList.remove('show');
        }

        // Show notification
        function showNotification(message, type = 'info') {
            notification.textContent = message;
            notification.className = `notification ${type} show`;
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }

        // Toggle theme
        function toggleTheme() {
            if (currentTheme === 'dark') {
                document.body.classList.add('light-theme');
                currentTheme = 'light';
                themeIcon.className = 'fas fa-sun';
                themeText.textContent = 'الوضع الليلي';
                localStorage.setItem('dashboardTheme', 'light');
                showNotification('تم تفعيل الوضع النهاري', 'success');
            } else {
                document.body.classList.remove('light-theme');
                currentTheme = 'dark';
                themeIcon.className = 'fas fa-moon';
                themeText.textContent = 'الوضع النهاري';
                localStorage.setItem('dashboardTheme', 'dark');
                showNotification('تم تفعيل الوضع الليلي', 'success');
            }
            
            // تحديث المخططات بعد تغيير الثيم
            setTimeout(() => {
                updateChartsTheme();
            }, 300);
        }

        // Initialize charts
        function initializeCharts() {
            // Website Summary Chart
            const websiteCtx = document.getElementById('websiteChart').getContext('2d');
            websiteChart = new Chart(websiteCtx, {
                type: 'line',
                data: {
                    labels: ['1 مارس', '7 مارس', '14 مارس', '21 مارس', '27 مارس'],
                    datasets: [{
                        label: 'الزيارات',
                        data: [4500, 5200, 4800, 6100, 5800],
                        borderColor: '#00d4aa',
                        backgroundColor: 'rgba(0, 212, 170, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#00d4aa',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                            },
                            ticks: {
                                color: currentTheme === 'dark' ? '#a8b2d1' : '#6b7688'
                            }
                        },
                        x: {
                            grid: {
                                color: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                            },
                            ticks: {
                                color: currentTheme === 'dark' ? '#a8b2d1' : '#6b7688'
                            }
                        }
                    }
                }
            });

            // Conversion Chart (Doughnut)
            const conversionCtx = document.getElementById('conversionChart').getContext('2d');
            conversionChart = new Chart(conversionCtx, {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: [35, 65],
                        backgroundColor: ['#00d4aa', 'rgba(0, 212, 170, 0.2)'],
                        borderWidth: 0,
                        cutout: '80%'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });

            // Earnings Chart
            const earningsCtx = document.getElementById('earningsChart').getContext('2d');
            earningsChart = new Chart(earningsCtx, {
                type: 'bar',
                data: {
                    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
                    datasets: [{
                        label: 'الأرباح',
                        data: analyticsData.monthlyEarnings,
                        backgroundColor: 'rgba(0, 212, 170, 0.8)',
                        borderRadius: 8,
                        borderSkipped: false,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                            },
                            ticks: {
                                color: currentTheme === 'dark' ? '#a8b2d1' : '#6b7688'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                color: currentTheme === 'dark' ? '#a8b2d1' : '#6b7688'
                            }
                        }
                    }
                }
            });

            // Projects Chart
            const projectsCtx = document.getElementById('projectsChart').getContext('2d');
            projectsChart = new Chart(projectsCtx, {
                type: 'doughnut',
                data: {
                    labels: ['مكتملة', 'قيد التنفيذ', 'متأخرة', 'ملغية'],
                    datasets: [{
                        data: analyticsData.projectStatus,
                        backgroundColor: ['#00d4aa', '#74b9ff', '#fd79a8', '#ddd'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                font: {
                                    family: 'Tajawal'
                                },
                                color: currentTheme === 'dark' ? '#a8b2d1' : '#6b7688'
                            }
                        }
                    }
                }
            });

            // Activity Chart
            const activityCtx = document.getElementById('activityChart').getContext('2d');
            activityChart = new Chart(activityCtx, {
                type: 'line',
                data: {
                    labels: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
                    datasets: [{
                        label: 'النشاط اليومي',
                        data: analyticsData.weeklyActivity,
                        borderColor: '#74b9ff',
                        backgroundColor: 'rgba(116, 185, 255, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#74b9ff',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                            },
                            ticks: {
                                color: currentTheme === 'dark' ? '#a8b2d1' : '#6b7688'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                color: currentTheme === 'dark' ? '#a8b2d1' : '#6b7688'
                            }
                        }
                    }
                }
            });
        }

        // Update charts theme
        function updateChartsTheme() {
            const charts = [websiteChart, earningsChart, projectsChart, activityChart];
            const gridColor = currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
            const textColor = currentTheme === 'dark' ? '#a8b2d1' : '#6b7688';

            charts.forEach(chart => {
                if (chart && chart.options.scales) {
                    if (chart.options.scales.y) {
                        chart.options.scales.y.grid.color = gridColor;
                        chart.options.scales.y.ticks.color = textColor;
                    }
                    if (chart.options.scales.x) {
                        chart.options.scales.x.grid.color = gridColor;
                        chart.options.scales.x.ticks.color = textColor;
                    }
                }
                if (chart && chart.options.plugins && chart.options.plugins.legend && chart.options.plugins.legend.labels) {
                    chart.options.plugins.legend.labels.color = textColor;
                }
                if (chart) {
                    chart.update();
                }
            });
        }

        // Fetch data from Firebase
        async function fetchData() {
            showLoading();
            try {
                // جلب بيانات المستخدمين من قاعدة بيانات المستخدمين
                const usersSnapshot = await dbUsers.collection("users").get();
                analyticsData.users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                // جلب بيانات المهام من قاعدة بيانات المهام
                const tasksSnapshot = await dbTasks.collection("tasks").get();
                analyticsData.tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                // حساب الإحصائيات
                calculateStatistics();
                
                // تحديث واجهة المستخدم
                updateUI();
                
                showNotification('تم تحديث البيانات بنجاح', 'success');
            } catch (error) {
                console.error("Error fetching data: ", error);
                showNotification('حدث خطأ أثناء تحميل البيانات', 'error');
                
                // استخدام البيانات الوهمية في حالة الخطأ
                generateMockData();
                updateUI();
            }
            hideLoading();
        }

        // Generate mock data for demonstration
        function generateMockData() {
            analyticsData.users = Array.from({length: 2100}, (_, i) => ({
                id: `user_${i}`,
                fullName: `مستخدم ${i + 1}`,
                lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                isActive: Math.random() > 0.3
            }));

            analyticsData.tasks = Array.from({length: 758}, (_, i) => ({
                id: `task_${i}`,
                title: `مهمة ${i + 1}`,
                completed: Math.random() > 0.4,
                status: ['active', 'overdue', 'pending'][Math.floor(Math.random() * 3)],
                priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)]
            }));
        }

        // Calculate statistics from data
        function calculateStatistics() {
            // إعادة تعيين العدادات
            analyticsData.taskStatus = { completed: 0, active: 0, overdue: 0, pending: 0 };
            
            // حساب إحصائيات المهام
            analyticsData.tasks.forEach(task => {
                if (task.completed) analyticsData.taskStatus.completed++;
                else if (task.status === 'active') analyticsData.taskStatus.active++;
                else if (task.status === 'overdue') analyticsData.taskStatus.overdue++;
                else analyticsData.taskStatus.pending++;
            });
        }

        // Update UI with current data
        function updateUI() {
            // تحديث الإحصائيات الرئيسية
            document.getElementById('totalUsers').textContent = analyticsData.users.length.toLocaleString('ar-EG');
            document.getElementById('completedTasks').textContent = analyticsData.taskStatus.completed.toLocaleString('ar-EG');
            document.getElementById('completionRate').textContent = (analyticsData.tasks.length > 0 ? 
                (analyticsData.taskStatus.completed / analyticsData.tasks.length * 10).toFixed(2) : '0.00');
            document.getElementById('activeUsers').textContent = Math.floor(analyticsData.users.length * 0.7).toLocaleString('ar-EG') + 'K';
        }

        // Export data as CSV
        function exportData() {
            showNotification('جاري تحضير البيانات للتصدير', 'info');
            
            // محاكاة عملية التصدير
            setTimeout(() => {
                const csvContent = "data:text/csv;charset=utf-8," 
                    + "النوع,العدد,النسبة\n"
                    + `إجمالي المستخدمين,${analyticsData.users.length},100%\n`
                    + `المهام المكتملة,${analyticsData.taskStatus.completed},${Math.round((analyticsData.taskStatus.completed / analyticsData.tasks.length) * 100)}%\n`
                    + `المهام النشطة,${analyticsData.taskStatus.active},${Math.round((analyticsData.taskStatus.active / analyticsData.tasks.length) * 100)}%\n`
                    + `المهام المتأخرة,${analyticsData.taskStatus.overdue},${Math.round((analyticsData.taskStatus.overdue / analyticsData.tasks.length) * 100)}%`;
                
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "analytics_report.csv");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                showNotification('تم تصدير البيانات بنجاح', 'success');
            }, 1500);
        }

        // Sidebar navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // Initialize with mock data if needed
        setTimeout(() => {
            if (analyticsData.users.length === 0) {
                generateMockData();
                calculateStatistics();
                updateUI();
            }
        }, 2000);