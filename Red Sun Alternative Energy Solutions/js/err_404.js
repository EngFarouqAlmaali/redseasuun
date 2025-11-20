 // Create animated particles
        function createParticles() {
            const particlesContainer = document.querySelector('.particles');
            const particleCount = 50;

            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.classList.add('particle');
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 6 + 's';
                particle.style.animationDuration = (Math.random() * 4 + 6) + 's';
                particlesContainer.appendChild(particle);
            }
        }

        // Button functions
        function goHome() {
            window.location.href = '/';
        }

        function goBack() {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = '/';
            }
        }

        // Add hover effects to 404 number
        document.addEventListener('DOMContentLoaded', function() {
            createParticles();
            
            const errorNumber = document.querySelector('.error-number');
            
            errorNumber.addEventListener('mouseover', function() {
                this.style.transform = 'scale(1.1) rotate(5deg)';
                this.style.transition = 'all 0.3s ease';
            });
            
            errorNumber.addEventListener('mouseout', function() {
                this.style.transform = 'scale(1) rotate(0deg)';
            });

            // Add random glitch effect occasionally
            setInterval(() => {
                if (Math.random() < 0.1) {
                    errorNumber.style.textShadow = '2px 0 #ff0000, -2px 0 #00ffff';
                    setTimeout(() => {
                        errorNumber.style.textShadow = '0 0 30px rgba(255, 255, 255, 0.3)';
                    }, 100);
                }
            }, 3000);
        });

        // Add parallax effect on mouse move
        document.addEventListener('mousemove', function(e) {
            const floatingElements = document.querySelectorAll('.floating-element');
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;

            floatingElements.forEach((element, index) => {
                const speed = (index + 1) * 0.02;
                const x = (mouseX - 0.5) * speed * 100;
                const y = (mouseY - 0.5) * speed * 100;
                element.style.transform += ` translate(${x}px, ${y}px)`;
            });
        });
console.log("███████╗    ████████╗");
console.log("██╔════╝    ╚══██╔══╝");
console.log("█████╗         ██║");
console.log("██╔══╝         ██║");
console.log("██║            ██║");
console.log("╚═╝            ╚═╝");