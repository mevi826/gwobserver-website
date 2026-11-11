// GW Observer Website — interactions

document.addEventListener('DOMContentLoaded', () => {
  // ============================================================
  //  TRAILER
  //  The trailer sits in the hero, above the headline. Its facade
  //  (thumbnail plus play button) is written into index.html, so
  //  with JavaScript off it stays a plain link to YouTube. The
  //  handler below upgrades it to an inline player on click, which
  //  is the only point YouTube's script and cookies load.
  //  The release band keeps a still on purpose: the
  //  same trailer twice on one page helps nobody.
  // ============================================================
  const TRAILER_ID = 'KztEBKYX5ho';

  document.querySelectorAll('[data-trailer]').forEach(function (facade) {
    // maxresdefault is missing on some uploads; hqdefault always exists
    const thumb = facade.querySelector('img');
    if (thumb) {
      thumb.addEventListener('error', function () {
        thumb.src = 'https://i.ytimg.com/vi/' + TRAILER_ID + '/hqdefault.jpg';
      }, { once: true });
    }

    facade.addEventListener('click', function (e) {
      e.preventDefault();
      const frame = document.createElement('iframe');
      frame.src = 'https://www.youtube-nocookie.com/embed/' + TRAILER_ID + '?autoplay=1&rel=0';
      frame.title = 'Guild Wars Observer official trailer';
      frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      frame.allowFullscreen = true;
      facade.parentNode.replaceChildren(frame);
    });
  });

  // ---- Release band still ----
  // The release screenshot opens full size in the lightbox. (Never a facade as
  // well: a click must not zoom AND play.)
  const releaseMedia = document.getElementById('release-media');
  if (releaseMedia) {
    releaseMedia.classList.add('has-preview');
    releaseMedia.dataset.gif = 'assets/releases/3.6.2/meta-map.webp';
    releaseMedia.dataset.title = 'The Meta tab in 3.6.2';
  }

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

  // Shared by the feature cards, the release screenshots and the changelog
  function openPreview(title, url) {
    modalTitle.textContent = title;
    modalImg.classList.remove('loaded');
    modalImg.src = '';
    modalLoading.style.display = 'block';
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    modalImg.onload = () => {
      modalLoading.style.display = 'none';
      modalImg.classList.add('loaded');
    };
    modalImg.src = url;
  }

  document.querySelectorAll('.has-preview').forEach(card => {
    card.addEventListener('click', () => {
      const titleEl = card.querySelector('h3') || card.querySelector('.showcase-label');
      const title = card.dataset.title || (titleEl ? titleEl.textContent : '');
      openPreview(title, card.dataset.gif);
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

  // ---- Keep the download buttons on the real latest release ----
  // One API call per page view (unauthenticated GitHub allows only 60 requests
  // an hour per IP). If the fetch fails the hardcoded links in index.html still
  // stand. The changelog itself is static HTML so it never depends on this call.
  // Pre-releases count: 2.0.0 is published as one, and skipping it here would
  // quietly rewrite every button back to 1.2.7 on a page that advertises 2.0.0.
  function syncDownloadLinks(releases) {
    var latest = (releases || []).filter(function(r) { return !r.draft; })[0];
    if (!latest) return;
    var zip = (latest.assets || []).filter(function(a) { return /\.zip$/i.test(a.name); })[0];
    if (!zip) return;
    document.querySelectorAll('[data-download]').forEach(function(el) {
      el.href = zip.browser_download_url;
      if (el.dataset.download === 'label') el.textContent = 'Download ' + latest.tag_name;
    });
  }

  fetch('https://api.github.com/repos/MC92-hash/GuildWarsObserver/releases?per_page=5')
    .then(function(res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(syncDownloadLinks)
    .catch(function() { /* keep the hardcoded links */ });

  document.querySelectorAll('.changelog-entry').forEach(function(el) {
    el.classList.add('fade-in');
    observer.observe(el);
  });

  // Add fade-in CSS dynamically
  const style = document.createElement('style');
  style.textContent = `
    .fade-in { opacity: 0; transform: translateY(16px); transition: opacity .5s ease, transform .5s ease; }
    .fade-in.visible { opacity: 1; transform: translateY(0); }
  `;
  document.head.appendChild(style);
});
