// Navigation dropdown functionality
document.addEventListener('DOMContentLoaded', function() {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('.nav-link');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        // Prevent default link behavior
        link.addEventListener('click', function(e) {
            e.preventDefault();
        });
        
        // Show dropdown on hover (already handled by CSS)
        // This is for touch devices
        dropdown.addEventListener('touchstart', function(e) {
            const isOpen = menu.style.opacity === '1';
            
            // Close all other dropdowns
            document.querySelectorAll('.dropdown-menu').forEach(m => {
                m.style.opacity = '0';
                m.style.visibility = 'hidden';
            });
            
            // Toggle current dropdown
            if (!isOpen) {
                menu.style.opacity = '1';
                menu.style.visibility = 'visible';
                e.preventDefault();
            }
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.style.opacity = '0';
                menu.style.visibility = 'hidden';
            });
        }
    });
});

