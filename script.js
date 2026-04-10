// GW Observer Website — interactions

document.addEventListener('DOMContentLoaded', () => {
  // ---- Mobile nav toggle ----
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
    });
    // Close on link click
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => links.classList.remove('open'));
    });
  }

  // ---- Hero background slideshow ----
  const bgs = document.querySelectorAll('.hero-bg');
  const dots = document.querySelectorAll('.hero-dot');
  let current = 0;
  const total = bgs.length;

  function showSlide(index) {
    bgs.forEach(bg => bg.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    bgs[index].classList.add('active');
    dots[index].classList.add('active');
    current = index;
  }

  // Auto-rotate every 6 seconds
  let interval = setInterval(() => {
    showSlide((current + 1) % total);
  }, 6000);

  // Dot click
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      clearInterval(interval);
      showSlide(parseInt(dot.dataset.index));
      interval = setInterval(() => {
        showSlide((current + 1) % total);
      }, 6000);
    });
  });

  // ---- Navbar background on scroll ----
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.style.borderBottomColor = 'var(--border)';
    } else {
      navbar.style.borderBottomColor = 'transparent';
    }
  });

  // ---- Smooth reveal on scroll ----
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.card, .mini-card, .hotkey-item, .map-thumb').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
  });

  // ---- GIF Preview Modal ----
  const modal = document.getElementById('gifModal');
  const modalImg = modal.querySelector('.modal-gif');
  const modalTitle = modal.querySelector('.modal-title');
  const modalLoading = modal.querySelector('.modal-loading');
  const modalClose = modal.querySelector('.modal-close');

  document.querySelectorAll('.card.has-preview').forEach(card => {
    card.addEventListener('click', () => {
      const gifUrl = card.dataset.gif;
      const title = card.querySelector('h3').textContent;

      modalTitle.textContent = title;
      modalImg.classList.remove('loaded');
      modalImg.src = '';
      modalLoading.style.display = 'block';
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';

      // Load the GIF
      modalImg.onload = () => {
        modalLoading.style.display = 'none';
        modalImg.classList.add('loaded');
      };
      modalImg.src = gifUrl;
    });
  });

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    modalImg.src = '';
  }

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

  // Add fade-in CSS dynamically
  const style = document.createElement('style');
  style.textContent = `
    .fade-in { opacity: 0; transform: translateY(16px); transition: opacity .5s ease, transform .5s ease; }
    .fade-in.visible { opacity: 1; transform: translateY(0); }
  `;
  document.head.appendChild(style);
});
