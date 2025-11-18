// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const dropdowns = document.querySelectorAll('.dropdown');
    
    // Toggle mobile menu
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
                // Close all dropdowns when closing menu
                dropdowns.forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
            }
        });
    }
    
    // Handle dropdowns
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('.nav-link');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        // Prevent default link behavior
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // On mobile, toggle dropdown
            if (window.innerWidth <= 768) {
                // Close other dropdowns
                dropdowns.forEach(d => {
                    if (d !== dropdown) {
                        d.classList.remove('active');
                    }
                });
                
                // Toggle current dropdown
                dropdown.classList.toggle('active');
            }
        });
    });
    
    // Close menu when clicking a dropdown link
    const dropdownLinks = document.querySelectorAll('.dropdown-menu a');
    dropdownLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                navMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                document.body.style.overflow = '';
                dropdowns.forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
            }
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.main-nav')) {
            if (window.innerWidth <= 768) {
                navMenu.classList.remove('active');
                if (mobileMenuToggle) {
                    mobileMenuToggle.classList.remove('active');
                }
                document.body.style.overflow = '';
            }
            
            // Close desktop dropdowns when clicking outside
            if (window.innerWidth > 768) {
                dropdowns.forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
            }
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            navMenu.classList.remove('active');
            if (mobileMenuToggle) {
                mobileMenuToggle.classList.remove('active');
            }
            document.body.style.overflow = '';
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    });
    
    // Email Signup Modal
    const emailSignupBtn = document.getElementById('emailSignupBtn');
    if (emailSignupBtn) {
        emailSignupBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showEmailSignupModal();
        });
    }
    
    function showEmailSignupModal() {
        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'email-modal-overlay';
        modalOverlay.innerHTML = `
            <div class="email-modal">
                <button class="email-modal-close">&times;</button>
                <h2><i class="fas fa-envelope"></i> Subscribe to Weekly Updates</h2>
                <p>Get the latest personal finance tips and news delivered to your inbox every week.</p>
                <form class="email-signup-form" id="emailSignupForm">
                    <input type="email" placeholder="Enter your email address" required class="email-input">
                    <button type="submit" class="email-submit-btn">Subscribe</button>
                </form>
                <p class="email-privacy">We respect your privacy. Unsubscribe at any time.</p>
            </div>
        `;
        
        document.body.appendChild(modalOverlay);
        document.body.style.overflow = 'hidden';
        
        // Close button functionality
        const closeBtn = modalOverlay.querySelector('.email-modal-close');
        closeBtn.addEventListener('click', function() {
            closeEmailModal(modalOverlay);
        });
        
        // Close on overlay click
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                closeEmailModal(modalOverlay);
            }
        });
        
        // Form submission
        const form = modalOverlay.querySelector('#emailSignupForm');
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = form.querySelector('.email-input').value;
            
            // Show success message
            form.innerHTML = `
                <div class="email-success">
                    <i class="fas fa-check-circle" style="font-size: 3rem; color: #28a745; margin-bottom: 1rem;"></i>
                    <h3>Thanks for subscribing!</h3>
                    <p>We'll send you our weekly updates at ${email}</p>
                </div>
            `;
            
            // Close modal after 3 seconds
            setTimeout(function() {
                closeEmailModal(modalOverlay);
            }, 3000);
        });
    }
    
    function closeEmailModal(modalOverlay) {
        document.body.style.overflow = '';
        modalOverlay.remove();
    }
});

