/* 

JavaScript Document

TemplateMo 615 Amber Folio

https://templatemo.com/tm-615-amber-folio

*/

// Coverflow Class
class PhotoCoverflow {
   constructor() {
      this.items = document.querySelectorAll('.coverflow-item');
      this.indicators = document.querySelectorAll('.indicator');
      this.currentIndex = 4; // Start with middle item
      this.totalItems = this.items.length;
      this.isPlaying = false;
      this.autoPlayInterval = null;
      this.autoPlaySpeed = 4000;

      this.init();
   }

   init() {
      this.updateCoverflow();
      this.bindEvents();
   }

   bindEvents() {
      // Navigation buttons
      document.getElementById('prevBtn').addEventListener('click', () => this.prev());
      document.getElementById('nextBtn').addEventListener('click', () => this.next());
      document.getElementById('playPauseBtn').addEventListener('click', () => this.toggleAutoPlay());

      // Indicator clicks
      this.indicators.forEach((indicator, index) => {
         indicator.addEventListener('click', () => this.goTo(index));
      });

      // Item clicks
      this.items.forEach((item, index) => {
         item.addEventListener('click', () => {
            if (index === this.currentIndex) {
               // If clicking the center item, you could open a modal or link
               console.log('Center item clicked');
            } else {
               this.goTo(index);
            }
         });
      });

      // Keyboard navigation
      document.addEventListener('keydown', (e) => {
         if (e.key === 'ArrowLeft') this.prev();
         if (e.key === 'ArrowRight') this.next();
         if (e.key === ' ') {
            e.preventDefault();
            this.toggleAutoPlay();
         }
      });

      // Touch/swipe support
      let startX = 0;
      let startY = 0;

      const container = document.getElementById('coverflowContainer');

      container.addEventListener('touchstart', (e) => {
         startX = e.touches[0].clientX;
         startY = e.touches[0].clientY;
      }, {
         passive: true
      });

      container.addEventListener('touchend', (e) => {
         if (!startX || !startY) return;

         const endX = e.changedTouches[0].clientX;
         const endY = e.changedTouches[0].clientY;
         const diffX = startX - endX;
         const diffY = startY - endY;

         if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            if (diffX > 0) {
               this.next();
            } else {
               this.prev();
            }
         }

         startX = 0;
         startY = 0;
      }, {
         passive: true
      });

      // Handle window resize (both width and height)
      let resizeTimer;
      window.addEventListener('resize', () => {
         clearTimeout(resizeTimer);
         resizeTimer = setTimeout(() => {
            this.updateCoverflow();
         }, 100);
      });
   }

   updateCoverflow() {
      const isMobile = window.innerWidth <= 768;
      const isSmallMobile = window.innerWidth <= 480;
      const viewportHeight = window.innerHeight;

      // Dynamic spacing based on viewport height and width
      let baseSpacing = 220;

      // Adjust spacing based on viewport height
      if (viewportHeight > 900) {
         baseSpacing = 250;
      } else if (viewportHeight < 768) {
         baseSpacing = 180;
      }

      // Further adjust for mobile
      if (isSmallMobile) {
         baseSpacing = Math.min(baseSpacing * 0.7, 140);
      } else if (isMobile) {
         baseSpacing = Math.min(baseSpacing * 0.8, 170);
      }

      this.items.forEach((item, index) => {
         let offset = index - this.currentIndex;

         // Handle looping
         if (offset > this.totalItems / 2) {
            offset -= this.totalItems;
         } else if (offset < -this.totalItems / 2) {
            offset += this.totalItems;
         }

         let translateX = offset * baseSpacing;
         let translateZ = 0;
         let rotateY = 0;
         let scale = 1;
         let opacity = 1;

         if (offset === 0) {
            // Center item
            translateZ = 100;
            scale = 1.1;
         } else if (Math.abs(offset) === 1) {
            translateZ = 0;
            rotateY = offset * -40;
            scale = 0.85;
            opacity = 0.7;
         } else if (Math.abs(offset) === 2) {
            translateZ = -100;
            rotateY = offset * -50;
            scale = 0.7;
            opacity = 0.5;
         } else if (Math.abs(offset) === 3) {
            translateZ = -150;
            rotateY = offset * -60;
            scale = 0.6;
            opacity = 0.3;
         } else {
            translateZ = -200;
            rotateY = offset * -70;
            scale = 0.5;
            opacity = 0.2;
         }

         item.style.transform = `
                        translate(-50%, -50%) 
                        translateX(${translateX}px) 
                        translateZ(${translateZ}px) 
                        rotateY(${rotateY}deg) 
                        scale(${scale})
                    `;
         item.style.opacity = opacity;
         item.style.zIndex = this.totalItems - Math.abs(offset);
      });

      // Update indicators
      this.indicators.forEach((indicator, index) => {
         indicator.classList.toggle('active', index === this.currentIndex);
      });
   }

   toggleAutoPlay() {
      const playPauseBtn = document.getElementById('playPauseBtn');

      if (this.isPlaying) {
         this.stopAutoPlay();
         playPauseBtn.innerHTML = '▶';
         playPauseBtn.classList.remove('playing');
      } else {
         this.startAutoPlay();
         playPauseBtn.innerHTML = '❚❚';
         playPauseBtn.classList.add('playing');
      }
   }

   startAutoPlay() {
      this.isPlaying = true;
      this.autoPlayInterval = setInterval(() => {
         this.next();
      }, this.autoPlaySpeed);
   }

   stopAutoPlay() {
      this.isPlaying = false;
      if (this.autoPlayInterval) {
         clearInterval(this.autoPlayInterval);
         this.autoPlayInterval = null;
      }
   }

   prev() {
      this.currentIndex = (this.currentIndex - 1 + this.totalItems) % this.totalItems;
      this.updateCoverflow();
   }

   next() {
      this.currentIndex = (this.currentIndex + 1) % this.totalItems;
      this.updateCoverflow();
   }

   goTo(index) {
      this.currentIndex = index;
      this.updateCoverflow();
   }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
   // Initialize Coverflow
   new PhotoCoverflow();

   // Hide loading screen
   setTimeout(() => {
      document.getElementById('loadingScreen').classList.add('hidden');
   }, 1000);

   // Header scroll effect
   const header = document.getElementById('header');
   window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
         header.classList.add('scrolled');
      } else {
         header.classList.remove('scrolled');
      }
   });

   // Mobile menu toggle
   const menuToggle = document.getElementById('menuToggle');
   const navMenu = document.getElementById('navMenu');

   menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
   });

   // Close mobile menu when clicking a link
   document.querySelectorAll('.nav-menu a').forEach(link => {
      link.addEventListener('click', () => {
         menuToggle.classList.remove('active');
         navMenu.classList.remove('active');
      });
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

   // Active menu highlighting on scroll
   const sections = document.querySelectorAll('section[id]');
   const navLinks = document.querySelectorAll('.nav-menu a');

   window.addEventListener('scroll', () => {
      let current = '';
      sections.forEach(section => {
         const sectionTop = section.offsetTop;
         const sectionHeight = section.clientHeight;
         if (window.pageYOffset >= (sectionTop - 200)) {
            current = section.getAttribute('id');
         }
      });

      navLinks.forEach(link => {
         link.classList.remove('active');
         if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
         }
      });
   });

   // Reveal animations on scroll
   const revealElements = document.querySelectorAll('.reveal');

   const revealOnScroll = () => {
      revealElements.forEach(element => {
         const elementTop = element.getBoundingClientRect().top;
         const elementVisible = 150;

         if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('active');
         }
      });
   };

   window.addEventListener('scroll', revealOnScroll);
   revealOnScroll(); // Check on load
});