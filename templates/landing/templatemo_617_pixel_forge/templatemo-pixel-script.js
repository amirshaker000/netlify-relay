/*

TemplateMo 617 Pixel Forge
https://templatemo.com/tm-617-pixel-forge

*/

// Mobile menu toggle
const mobileToggle = document.getElementById('mobileToggle');
const mobileMenu = document.getElementById('mobileMenu');

mobileToggle.addEventListener('click', () => {
    mobileToggle.classList.toggle('active');
    mobileMenu.classList.toggle('active');
});

// Close mobile menu when clicking a link
mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
    });
});

// Aspect ratio buttons
document.querySelectorAll('.aspect-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.aspect-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// Generate button demo
const generateBtn = document.getElementById('generateBtn');
const outputPlaceholder = document.getElementById('outputPlaceholder');
const generatedImage = document.getElementById('generatedImage');
const imageActions = document.getElementById('imageActions');

// Sample images for demo
const demoImages = [
    'images/tm-pixel-forge-06.jpg',
    'images/tm-pixel-forge-01.jpg',
    'images/tm-pixel-forge-02.jpg',
    'images/tm-pixel-forge-03.jpg',
    'images/tm-pixel-forge-07.jpg'
];

generateBtn.addEventListener('click', () => {
    generateBtn.classList.add('loading');
    
    setTimeout(() => {
        generateBtn.classList.remove('loading');
        const randomImg = demoImages[Math.floor(Math.random() * demoImages.length)];
        generatedImage.src = randomImg;
        generatedImage.classList.add('visible');
        outputPlaceholder.classList.add('has-image');
        outputPlaceholder.style.display = 'none';
        imageActions.classList.add('visible');
    }, 2000);
});

// Gallery filter
document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const filter = tab.dataset.filter;
        document.querySelectorAll('.gallery-item').forEach(item => {
            if (filter === 'all' || item.dataset.category === filter) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
});

// Pricing toggle
const pricingToggle = document.getElementById('pricingToggle');
pricingToggle.addEventListener('click', () => {
    pricingToggle.classList.toggle('yearly');
    const isYearly = pricingToggle.classList.contains('yearly');
    
    document.querySelectorAll('.price-value[data-monthly]').forEach(price => {
        price.textContent = isYearly ? price.dataset.yearly : price.dataset.monthly;
    });

    document.querySelectorAll('.pricing-toggle span').forEach((span, i) => {
        if (i === 0) span.classList.toggle('active', !isYearly);
        if (i === 1) span.classList.toggle('active', isYearly);
    });

    // Show/hide yearly total
    document.querySelectorAll('.price-yearly-total').forEach(total => {
        total.classList.toggle('visible', isYearly);
    });
});

// FAQ accordion
document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
        const wasOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
        if (!wasOpen) item.classList.add('open');
    });
});

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Gallery Popup
const galleryPopup = document.getElementById('galleryPopup');
const popupImage = document.getElementById('popupImage');
const popupPrompt = document.getElementById('popupPrompt');
const popupStyle = document.getElementById('popupStyle');
const popupClose = document.getElementById('popupClose');
const popupOverlay = document.querySelector('.popup-overlay');

const galleryItems = document.querySelectorAll('.gallery-item');
galleryItems.forEach(item => {
    item.style.cursor = 'pointer';
    item.addEventListener('click', () => {
        const img = item.querySelector('img');
        const prompt = item.querySelector('.item-prompt');
        const style = item.querySelector('.item-style');
        
        if (img) popupImage.src = img.src;
        if (prompt) popupPrompt.textContent = prompt.textContent;
        if (style) popupStyle.textContent = style.textContent;
        
        galleryPopup.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

function closePopup() {
    galleryPopup.classList.remove('active');
    document.body.style.overflow = '';
}

popupClose.addEventListener('click', closePopup);
popupOverlay.addEventListener('click', closePopup);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && galleryPopup.classList.contains('active')) {
        closePopup();
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.feature-card, .gallery-item, .price-card, .how-step').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});
