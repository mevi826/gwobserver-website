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

  document.querySelectorAll('.has-preview').forEach(card => {
    card.addEventListener('click', () => {
      const gifUrl = card.dataset.gif;
      const titleEl = card.querySelector('h3') || card.querySelector('.showcase-label');
      const title = titleEl ? titleEl.textContent : '';

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

  // ---- Changelog from GitHub Releases ----
  const changelogContainer = document.getElementById('changelog-entries');
  if (changelogContainer) {
    fetch('https://api.github.com/repos/MC92-hash/GuildWarsObserver/releases?per_page=10')
      .then(res => {
        if (!res.ok) throw new Error('GitHub API error');
        return res.json();
      })
      .then(releases => {
        if (!releases.length) {
          changelogContainer.innerHTML = '<p class="changelog-empty">No releases found.</p>';
          return;
        }

        changelogContainer.innerHTML = releases.map(release => {
          const date = new Date(release.published_at).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
          });
          const body = release.body
            ? (typeof marked !== 'undefined' ? marked.parse(release.body) : release.body.replace(/\n/g, '<br>'))
            : '<p>No release notes.</p>';

          return `
            <article class="changelog-entry fade-in">
              <div class="changelog-header">
                <span class="changelog-version">${release.tag_name}</span>
                <span class="changelog-date">${date}</span>
              </div>
              <h3 class="changelog-title">${release.name || release.tag_name}</h3>
              <div class="changelog-body">${body}</div>
              <button class="changelog-toggle">Show more</button>
            </article>
          `;
        }).join('');

        // Hide toggle for short entries, add click handler
        changelogContainer.querySelectorAll('.changelog-entry').forEach(el => {
          const body = el.querySelector('.changelog-body');
          const toggle = el.querySelector('.changelog-toggle');
          if (body.scrollHeight <= 200) {
            toggle.style.display = 'none';
          }
          toggle.addEventListener('click', () => {
            const expanded = body.classList.toggle('expanded');
            toggle.textContent = expanded ? 'Show less' : 'Show more';
          });
          observer.observe(el);
        });
      })
      .catch(() => {
        changelogContainer.innerHTML = '<p class="changelog-empty">Could not load changelog. <a href="https://github.com/MC92-hash/GuildWarsObserver/releases" target="_blank">View on GitHub</a></p>';
      });
  }

  // Add fade-in CSS dynamically
  const style = document.createElement('style');
  style.textContent = `
    .fade-in { opacity: 0; transform: translateY(16px); transition: opacity .5s ease, transform .5s ease; }
    .fade-in.visible { opacity: 1; transform: translateY(0); }
  `;
  document.head.appendChild(style);
});
