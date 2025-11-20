
            // Translation System
        class TranslationManager {
            constructor() {
                this.currentLanguage = localStorage.getItem('language') || 'ar';
                this.translations = {
                    ar: {
                        language: 'اللغة',
                        documents: 'الوثائق',
                        dashboard: 'لوحة التحكم',
                        services: 'خدماتنا',
                        solarPanels: 'تركيب الأنظمة الشمسية',
                        storage: 'أنظمة تخزين الطاقة',
                        maintenance: 'الصيانة والدعم الفني',
                        copyright: '© 2025 شركة شمس البحر الأحمر لحلول الطاقة البديلة. جميع الحقوق محفوظة.'
                    },
                    en: {
                        language: 'Language',
                        documents: 'Documents',
                        dashboard: 'Dashboard',
                        services: 'Our Services',
                        solarPanels: 'Solar Systems Installation',
                        storage: 'Energy Storage Systems',
                        maintenance: 'Maintenance & Technical Support',
                        copyright: '© 2025 Red Sea Sun Alternative Energy Solutions. All rights reserved.'
                    },
                    fr: {
                        language: 'Langue',
                        documents: 'Documents',
                        dashboard: 'Tableau de bord',
                        services: 'Nos Services',
                        solarPanels: 'Installation de Systèmes Solaires',
                        storage: 'Systèmes de Stockage d\'Énergie',
                        maintenance: 'Maintenance et Support Technique',
                        copyright: '© 2025 Red Sea Sun Solutions d\'Énergie Alternative. Tous droits réservés.'
                    }
                };
                this.init();
            }

            init() {
                this.applyLanguage(this.currentLanguage);
                this.setupLanguageSelector();
            }

            setupLanguageSelector() {
                const languageOptions = document.querySelectorAll('.language-option');
                languageOptions.forEach(option => {
                    option.addEventListener('click', () => {
                        const lang = option.getAttribute('data-lang');
                        this.changeLanguage(lang);
                    });
                });
            }

            changeLanguage(lang) {
                this.currentLanguage = lang;
                this.applyLanguage(lang);
                localStorage.setItem('language', lang);
                
                // Update document direction and language
                if (lang === 'ar') {
                    document.documentElement.setAttribute('dir', 'rtl');
                    document.documentElement.setAttribute('lang', 'ar');
                } else {
                    document.documentElement.setAttribute('dir', 'ltr');
                    document.documentElement.setAttribute('lang', lang);
                }

                // Update language dropdown flag
                this.updateLanguageDropdown(lang);
            }

            applyLanguage(lang) {
                const translations = this.translations[lang];
                
                // Update all elements with data-translate attribute
                document.querySelectorAll('[data-translate]').forEach(element => {
                    const key = element.getAttribute('data-translate');
                    if (translations[key]) {
                        element.textContent = translations[key];
                    }
                });

                // Update footer
                const copyright = document.querySelector('.footer-bottom p');
                if (copyright) copyright.textContent = translations.copyright;
            }

            updateLanguageDropdown(lang) {
                const flagClasses = {
                    ar: 'flag-ar',
                    en: 'flag-en',
                    fr: 'flag-fr'
                };

                const dropdownFlag = document.querySelector('.language-dropdown .language-flag');
                if (dropdownFlag) {
                    dropdownFlag.className = `language-flag ${flagClasses[lang]}`;
                }
            }
        }

        // Theme Toggle System
        class ThemeManager {
            constructor() {
                this.theme = localStorage.getItem('theme') || 'light';
                this.init();
            }

            init() {
                this.applyTheme(this.theme);
                this.setupToggleButton();
            }

            setupToggleButton() {
                const toggleButton = document.getElementById('theme-toggle');
                if (toggleButton) {
                    toggleButton.addEventListener('click', () => {
                        this.toggleTheme();
                    });
                }
            }

            toggleTheme() {
                this.theme = this.theme === 'light' ? 'dark' : 'light';
                this.applyTheme(this.theme);
                localStorage.setItem('theme', this.theme);
            }

            applyTheme(theme) {
                document.documentElement.setAttribute('data-theme', theme);
            }
        }

        // Smooth Scrolling and Header Hide/Show
        class ScrollManager {
            constructor() {
                this.lastScroll = 0;
                this.header = document.querySelector('header');
                this.init();
            }

            init() {
                window.addEventListener('scroll', () => {
                    this.handleScroll();
                });
                
                // Smooth scrolling for anchor links
                document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                    anchor.addEventListener('click', function (e) {
                        e.preventDefault();
                        const target = document.querySelector(this.getAttribute('href'));
                        if (target) {
                            target.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start'
                            });
                        }
                    });
                });
            }

            handleScroll() {
                const currentScroll = window.pageYOffset;

                if (currentScroll > this.lastScroll && currentScroll > 100) {
                    this.header.style.transform = 'translateY(-100%)';
                } else {
                    this.header.style.transform = 'translateY(0)';
                }

                this.lastScroll = currentScroll;
            }
        }

        // Loading Screen Manager
        class LoadingManager {
            constructor() {
                this.loadingScreen = document.getElementById('loadingScreen');
                this.loadingProgress = document.getElementById('loadingProgress');
                this.init();
            }

            init() {
                // Simulate loading progress
                let progress = 0;
                const interval = setInterval(() => {
                    progress += Math.random() * 15;
                    if (progress >= 100) {
                        progress = 100;
                        clearInterval(interval);
                        setTimeout(() => {
                            this.hideLoadingScreen();
                        }, 500);
                    }
                    this.loadingProgress.style.width = `${progress}%`;
                }, 200);
            }

            hideLoadingScreen() {
                this.loadingScreen.classList.add('hidden');
                setTimeout(() => {
                    this.loadingScreen.style.display = 'none';
                }, 500);
            }
        }

        // Initialize systems when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            new LoadingManager();
            new ThemeManager();
            new ScrollManager();
            new TranslationManager();
        });