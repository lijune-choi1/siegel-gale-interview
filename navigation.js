document.addEventListener('DOMContentLoaded', function() {
    // References to DOM elements
    const startExploringBtn = document.getElementById('start-exploring');
    const galleryBtns = document.querySelectorAll('.gallery-btn');
    const galleryModals = document.querySelectorAll('.gallery-modal');
    const galleryCloses = document.querySelectorAll('.gallery-close');
    const progressDots = document.querySelectorAll('.progress-dot');
    const contentItems = document.querySelectorAll('.content-item, .landing-page, .game-container');
    
    // Current state
    let currentIndex = 0;
    let isScrolling = false;
    let scrollTimeout;
    
    // Start exploring button in landing page
    startExploringBtn.addEventListener('click', () => {
        navigateTo(1); // Move to the first content (plus)
    });
    
    // Gallery functionality
    galleryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const galleryId = btn.getAttribute('data-gallery');
            document.getElementById(galleryId).classList.add('active');
        });
    });
    
    // Close gallery
    galleryCloses.forEach(close => {
        close.addEventListener('click', () => {
            close.closest('.gallery-modal').classList.remove('active');
        });
    });
    
    // Close gallery on outside click
    galleryModals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Open in new tab functionality
    document.getElementById('open-new-tab').addEventListener('click', function(e) {
        e.preventDefault();
        const newTab = window.open('', '_blank');
        newTab.document.write(document.documentElement.outerHTML);
        newTab.document.close();
    });
    
    // Navigation functionality
    function navigateTo(index, smooth = false) {
        // Update progress dots
        progressDots.forEach(dot => dot.classList.remove('active'));
        progressDots[index].classList.add('active');
        
        // Update body class for symbol state
        document.body.className = progressDots[index].getAttribute('data-state');
        
        // Update content
        contentItems.forEach(item => item.classList.remove('active'));
        document.getElementById(progressDots[index].getAttribute('data-content')).classList.add('active');
        
        // Update current index
        currentIndex = index;
        
        // If navigating to game section, initialize game
        if (index === 4) {
            initializeGame();
        }
    }
    
    // Function to initialize game when navigating to the game section
    function initializeGame() {
        // Game initialization will be handled by the external script
        if (typeof initGame === 'function') {
            initGame();
        }
    }
    
    // Click event for navigation
    progressDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            navigateTo(index);
        });
    });
    
    // Scroll-based navigation
    function handleScroll(e) {
        if (isScrolling) return;
        
        isScrolling = true;
        
        // Clear previous timeout
        clearTimeout(scrollTimeout);
        
        // Determine scroll direction
        const deltaY = e.deltaY;
        let newIndex = currentIndex;
        
        if (deltaY > 0) {
            // Scrolling down
            newIndex = Math.min(currentIndex + 1, progressDots.length - 1);
        } else if (deltaY < 0) {
            // Scrolling up
            newIndex = Math.max(currentIndex - 1, 0);
        }
        
        // Only navigate if the index changed
        if (newIndex !== currentIndex) {
            navigateTo(newIndex);
        }
        
        // Set a timeout to allow for another scroll
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
        }, 800);
    }
    
    // Add wheel event listener for scroll
    document.addEventListener('wheel', handleScroll);
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            const newIndex = Math.min(currentIndex + 1, progressDots.length - 1);
            navigateTo(newIndex);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            const newIndex = Math.max(currentIndex - 1, 0);
            navigateTo(newIndex);
        }
    });
    
    // Touch swipe support for mobile
    let touchStartY = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchmove', (e) => {
        if (isScrolling) return;
        
        const touchY = e.touches[0].clientY;
        const deltaY = touchStartY - touchY;
        
        // Set a threshold to prevent accidental swipes
        if (Math.abs(deltaY) > 50) {
            isScrolling = true;
            
            let newIndex = currentIndex;
            if (deltaY > 0) {
                // Swiping up (moving down)
                newIndex = Math.min(currentIndex + 1, progressDots.length - 1);
            } else {
                // Swiping down (moving up)
                newIndex = Math.max(currentIndex - 1, 0);
            }
            
            if (newIndex !== currentIndex) {
                navigateTo(newIndex);
            }
            
            touchStartY = touchY;
            
            // Reset scroll state after a delay
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                isScrolling = false;
            }, 800);
        }
    }, { passive: true });
    
    // Initialize first state
    navigateTo(0);
});