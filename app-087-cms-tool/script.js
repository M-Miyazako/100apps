document.addEventListener('DOMContentLoaded', function() {
    console.log('App initialized successfully\!');
    
    // Add a simple interactive element
    const container = document.querySelector('.container');
    if (container) {
        container.addEventListener('click', function() {
            container.style.transform = container.style.transform === 'scale(1.05)' ? 'scale(1)' : 'scale(1.05)';
            container.style.transition = 'transform 0.3s ease';
        });
    }
});
