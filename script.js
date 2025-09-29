// Tidal Building Services - Main JavaScript File
// Handles interactive functionality for the static HTML website

document.addEventListener('DOMContentLoaded', function() {
    if (typeof lucide !== 'undefined') lucide.createIcons();

    initMobileMenu();
    initContactForms();
    initFAQ();
    initPortfolioFilter();
    initSmoothScrolling();
    initNavigationHighlighting();
    initLazyLoading();
});

/** Mobile Menu Toggle */
function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;

    let isOpen = false;
    btn.addEventListener('click', () => {
        isOpen = !isOpen;
        menu.classList.toggle('hidden', !isOpen);
        btn.innerHTML = isOpen
            ? '<i data-lucide="x" class="w-6 h-6"></i>'
            : '<i data-lucide="menu" class="w-6 h-6"></i>';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    });

    // Close on link click
    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            isOpen = false;
            menu.classList.add('hidden');
            btn.innerHTML = '<i data-lucide="menu" class="w-6 h-6"></i>';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    });
}

/** Contact Form Handling */
function initContactForms() {
    const forms = document.querySelectorAll('#contact-form, .contact-form');
    forms.forEach(form => form.addEventListener('submit', handleFormSubmission));
}

function handleFormSubmission(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    // Required fields validation
    let isValid = true;
    form.querySelectorAll('[required]').forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('border-red-500');
        } else {
            field.classList.remove('border-red-500');
        }
    });

    if (!isValid) return showNotification('Please fill in all required fields.', 'error');

    // Email validation
    const emailField = form.querySelector('input[type="email"]');
    if (emailField && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
        emailField.classList.add('border-red-500');
        return showNotification('Please enter a valid email address.', 'error');
    }

    // Consent validation
    const consent = form.querySelector('#consent');
    if (consent && !consent.checked) {
        return showNotification('Please accept the consent to proceed.', 'error');
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    // Send via EmailJS
    emailjs.sendForm(
        'service_wpbnhta',      // Your Service ID
        'template_pa18l34',    // Your Template ID
        form,
        'Bu-VBajIBdJNyUw0u-'     // Your Public Key
    ).then(() => {
        showNotification('Thank you for your message! We will get back to you within 24 hours.', 'success');
        form.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        trackEvent('form_submission', { form_name: form.id || 'contact_form' });
    }).catch((err) => {
        console.error('EmailJS error:', err);
        showNotification('Something went wrong. Please try again later.', 'error');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
}


/** FAQ Accordion */
function initFAQ() {
    document.querySelectorAll('.faq-item').forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const icon = question?.querySelector('i');
        if (!question || !answer) return;

        question.addEventListener('click', () => {
            const isOpen = !answer.classList.contains('hidden');
            document.querySelectorAll('.faq-item').forEach(otherItem => {
                if (otherItem !== item) {
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    const otherIcon = otherItem.querySelector('.faq-question i');
                    otherAnswer && otherAnswer.classList.add('hidden');
                    if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
                }
            });
            answer.classList.toggle('hidden', isOpen);
            if (icon) icon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
        });
    });
}

/** Portfolio Filtering + Slider */
function initPortfolioFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const items = document.querySelectorAll('.portfolio-item');
    const headings = document.querySelectorAll('.category-heading');

    if (!filterButtons.length || !items.length) return;

    filterButtons.forEach(btn => btn.addEventListener('click', () => {
        // Highlight active filter
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        // Hide all headings first
        headings.forEach(h => h.style.display = 'none');

        items.forEach(item => {
            const category = item.dataset.category;

            if (filter === 'all' || filter === category) {
                item.style.display = 'block';
                item.style.animation = 'fadeIn 0.5s ease-in-out';
                initSlider(item);
            } else {
                item.style.display = 'none';
            }
        });

        // Show heading of active category
        if (filter !== 'all') {
            const heading = document.querySelector(`.category-heading[data-category="${filter}"]`);
            if (heading) heading.style.display = 'block';
        } else {
            // Show all headings for "All Projects"
            headings.forEach(h => h.style.display = 'block');
        }
    }));

    // Initialize all sliders on load
    items.forEach(item => initSlider(item));
}


/** Single Slider Initialization with auto-slide */
function initSlider(item) {
  const track = item.querySelector(".slider-track");
  const images = item.querySelectorAll(".slider-image");
  if (!track || !images.length) return;

  let current = 0;

  function showImage(index) {
    track.style.transform = `translateX(-${index * 100}%)`;
  }

  const prevBtn = item.querySelector(".prev-btn");
  const nextBtn = item.querySelector(".next-btn");

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener("click", () => {
      current = (current - 1 + images.length) % images.length;
      showImage(current);
    });

    nextBtn.addEventListener("click", () => {
      current = (current + 1) % images.length;
      showImage(current);
    });
  }

  // Auto-slide every 3s
  setInterval(() => {
    current = (current + 1) % images.length;
    showImage(current);
  }, 3000);
}




/** Smooth Scrolling */
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const offset = target.getBoundingClientRect().top + window.pageYOffset - 80;
                window.scrollTo({ top: offset, behavior: 'smooth' });
            }
        });
    });
}

/** Navigation Highlight */
function initNavigationHighlighting() {
    const current = window.location.pathname;
    document.querySelectorAll('nav a, .nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === current || (current === '/' && href === 'index.html') || current.includes(href.replace('.html',''))) {
            link.classList.add('active', 'text-white', 'bg-white/10');
        }
    });
}

/** Lazy Loading */
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                observer.unobserve(img);
            }
        });
    });
    images.forEach(img => observer.observe(img));
}

/** Notifications */
function showNotification(message, type='info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full text-white`;
    switch(type) {
        case 'success': notification.classList.add('bg-green-500', 'text-white'); break;
        case 'error': notification.classList.add('bg-red-500', 'text-white'); break;
        default: notification.classList.add('bg-blue-500', 'text-white');
    }
    notification.innerHTML = `
        <div class="flex items-center space-x-3">
            <div class="flex-shrink-0">
                ${type==='success'?'<i data-lucide="check-circle" class="w-5 h-5"></i>':
                  type==='error'?'<i data-lucide="x-circle" class="w-5 h-5"></i>':
                  '<i data-lucide="info" class="w-5 h-5"></i>'}
            </div>
            <p class="text-sm font-medium">${message}</p>
            <button onclick="this.parentElement.parentElement.remove()" class="flex-shrink-0">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
        </div>
    `;
    document.body.appendChild(notification);
    if (typeof lucide !== 'undefined') lucide.createIcons();
    setTimeout(()=>notification.classList.remove('translate-x-full'),100);
    setTimeout(()=>notification.remove(),5000);
}

/** Event Tracker */
function trackEvent(eventName, props={}) {
    console.log('Event tracked:', eventName, props);
}
