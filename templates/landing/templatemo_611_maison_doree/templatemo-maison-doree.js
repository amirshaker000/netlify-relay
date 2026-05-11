/* 

JavaScript Document

TemplateMo 611 Maison Doree

https://templatemo.com/tm-611-maison-doree

*/

// Header scroll effect
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
   if (window.scrollY > 100) {
      header.classList.add('scrolled');
   } else {
      header.classList.remove('scrolled');
   }
});

// Mobile navigation
const menuToggle = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');
const mobileOverlay = document.getElementById('mobileOverlay');
const mobileNavClose = document.getElementById('mobileNavClose');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-links a');

function openMobileNav() {
   mobileNav.classList.add('active');
   mobileOverlay.classList.add('active');
   document.body.style.overflow = 'hidden';
}

function closeMobileNav() {
   mobileNav.classList.remove('active');
   mobileOverlay.classList.remove('active');
   document.body.style.overflow = '';
}

menuToggle.addEventListener('click', openMobileNav);
mobileNavClose.addEventListener('click', closeMobileNav);
mobileOverlay.addEventListener('click', closeMobileNav);

mobileNavLinks.forEach(link => {
   link.addEventListener('click', closeMobileNav);
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
   anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const href = this.getAttribute('href');
      if (href === '#') {
         window.scrollTo({
            top: 0,
            behavior: 'smooth'
         });
         return;
      }
      const target = document.querySelector(href);
      if (target) {
         const headerHeight = header.offsetHeight;
         const targetPosition = target.offsetTop - headerHeight;
         window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
         });
      }
   });
});

// Hero image slideshow
const slides = document.querySelectorAll('.hero-slide');
const heroTitle = document.getElementById('heroTitle');
const heroPrice = document.getElementById('heroPrice');
let currentSlide = 0;

function changeSlide() {
   slides[currentSlide].classList.remove('active');
   currentSlide = (currentSlide + 1) % slides.length;

   // Fade out text
   heroTitle.style.opacity = '0';
   heroPrice.style.opacity = '0';

   setTimeout(() => {
      heroTitle.textContent = slides[currentSlide].dataset.title;
      heroPrice.textContent = slides[currentSlide].dataset.price;
      heroTitle.style.opacity = '1';
      heroPrice.style.opacity = '1';
   }, 500);

   slides[currentSlide].classList.add('active');
}

setInterval(changeSlide, 4000);

// Form submission
const form = document.getElementById('appointmentForm');
form.addEventListener('submit', function (e) {
   e.preventDefault();
   alert('Thank you for your inquiry! We will contact you within 24 hours to confirm your appointment.');
   form.reset();
});

// Intersection Observer for scroll animations
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

// Add fade-in animation to sections
document.querySelectorAll('section:not(.hero)').forEach(section => {
   section.style.opacity = '0';
   section.style.transform = 'translateY(30px)';
   section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
   observer.observe(section);
});