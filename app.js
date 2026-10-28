/**
 * ====================================================================
 * LUXEVISUALS CLIENT SCRIPT (app.js)
 * Handles:
 * 1. Configuration population (Stats & Links)
 * 2. Fullscreen Video Loader (Site load & transitions)
 * 3. Page Switching (Home, Services, ToS, Portfolio, Contact)
 * 4. Automatic Portfolio scanning (01, 02... 100+ in Photos/Videos)
 * 5. Fullscreen Lightbox Modal preview
 * ====================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize stats & links from config.js
  initStatsAndLinks();

  // 2. Setup video loader
  setupVideoLoader();

  // 3. Setup SPA Navigation
  setupNavigation();

  // 4. Setup Portfolio tabs and dynamic scan loader
  setupPortfolio();

  // 5. Setup Lightbox
  setupLightbox();
});

/**
 * Populate stats & links from window.LUXE_CONFIG
 */
function initStatsAndLinks() {
  const config = window.LUXE_CONFIG || {};

  if (config.stats) {
    const elExp = document.getElementById('statExp');
    const elExpLbl = document.getElementById('statExpLabel');
    const elProj = document.getElementById('statProjects');
    const elProjLbl = document.getElementById('statProjectsLabel');
    const elCli = document.getElementById('statClients');
    const elCliLbl = document.getElementById('statClientsLabel');

    if (elExp) elExp.textContent = config.stats.experienceMonths || '10+';
    if (elExpLbl) elExpLbl.textContent = config.stats.experienceLabel || 'Months';
    if (elProj) elProj.textContent = config.stats.projectsDone || '5+';
    if (elProjLbl) elProjLbl.textContent = config.stats.projectsLabel || 'Projects';
    if (elCli) elCli.textContent = config.stats.happyClients || '10+';
    if (elCliLbl) elCliLbl.textContent = config.stats.clientsLabel || 'Happy Clients';
  }

  if (config.links) {
    const dHome = document.getElementById('homeDiscordLink');
    const dContact = document.getElementById('contactDiscordCard');
    const xHome = document.getElementById('homeXLink');
    const xContact = document.getElementById('contactXCard');

    if (dHome && config.links.discord) dHome.href = config.links.discord;
    if (dContact && config.links.discord) dContact.href = config.links.discord;
    if (xHome && config.links.twitter) xHome.href = config.links.twitter;
    if (xContact && config.links.twitter) xContact.href = config.links.twitter;
  }
}

/**
 * Handles WebsiteLoading.mp4 on initial load and smooth transitions
 */
let isTransitioning = false;
function setupVideoLoader() {
  const loader = document.getElementById('pageLoader');
  const video = document.getElementById('loaderVideo');

  if (!loader || !video) return;

  // Function to smoothly hide loader
  const dismissLoader = () => {
    loader.classList.add('hidden');
    video.pause();
  };

  // If video ends, hide loader
  video.addEventListener('ended', dismissLoader);

  // Safety fallback: if video is blocked or takes too long, dismiss after 1.8 seconds
  setTimeout(dismissLoader, 1800);
}

/**
 * Triggers video loader during page switch
 */
function triggerPageTransition(onMidpoint) {
  const loader = document.getElementById('pageLoader');
  const video = document.getElementById('loaderVideo');

  if (!loader || isTransitioning) {
    if (onMidpoint) onMidpoint();
    return;
  }

  isTransitioning = true;
  loader.classList.remove('hidden');

  if (video) {
    video.currentTime = 0;
    video.play().catch(() => {});
  }

  // After brief loading animation, switch content and fade back out
  setTimeout(() => {
    if (onMidpoint) onMidpoint();
    setTimeout(() => {
      loader.classList.add('hidden');
      isTransitioning = false;
    }, 450);
  }, 450);
}

/**
 * Navigation switching
 */
function setupNavigation() {
  const navLinks = document.querySelectorAll('[data-nav]');
  const views = {
    home: document.getElementById('view-home'),
    services: document.getElementById('view-services'),
    tos: document.getElementById('view-tos'),
    portfolio: document.getElementById('view-portfolio'),
    contact: document.getElementById('view-contact')
  };

  function switchView(targetName) {
    if (!views[targetName]) return;

    // Check if clicking already active tab
    const currentActive = document.querySelector('.view-section.active');
    if (currentActive && currentActive.id === `view-${targetName}`) return;

    triggerPageTransition(() => {
      // Toggle nav items
      document.querySelectorAll('.nav-links .nav-item').forEach(item => {
        if (item.getAttribute('data-nav') === targetName) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });

      // Toggle views
      Object.keys(views).forEach(key => {
        if (key === targetName) {
          views[key].classList.add('active');
        } else {
          views[key].classList.remove('active');
        }
      });

      // Scroll to top of card smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-nav');
      if (target) {
        switchView(target);
      }
    });
  });
}

/**
 * Portfolio automatic detection & mini tabs
 */
function setupPortfolio() {
  const tabPhotosBtn = document.getElementById('tabPhotosBtn');
  const tabVideosBtn = document.getElementById('tabVideosBtn');
  const photosGrid = document.getElementById('photosGrid');
  const videosGrid = document.getElementById('videosGrid');

  // Mini Tab switching
  tabPhotosBtn.addEventListener('click', () => {
    tabPhotosBtn.classList.add('active');
    tabVideosBtn.classList.remove('active');
    photosGrid.style.display = 'grid';
    videosGrid.style.display = 'none';
  });

  tabVideosBtn.addEventListener('click', () => {
    tabVideosBtn.classList.add('active');
    tabPhotosBtn.classList.remove('active');
    photosGrid.style.display = 'none';
    videosGrid.style.display = 'grid';
  });

  // Automatically probe and load images and videos in Portfolio/Photos and Portfolio/Videos
  scanPortfolioFolder('Photos', photosGrid, false);
  scanPortfolioFolder('Videos', videosGrid, true);
}

/**
 * Scan numbered files: 01, 02, 03... up to 100
 */
function scanPortfolioFolder(folderName, container, isVideo) {
  const cfg = window.LUXE_CONFIG?.portfolio || {};
  const max = cfg.maxItemsToCheck || 100;
  const extensions = isVideo 
    ? (cfg.videoExtensions || ['mp4', 'webm', 'mov'])
    : (cfg.photoExtensions || ['png', 'jpg', 'jpeg', 'webp', 'gif']);

  let foundCount = 0;
  container.innerHTML = '';

  // Helper to test each candidate
  for (let i = 1; i <= max; i++) {
    const padded = String(i).padStart(2, '0');
    const unpadded = String(i);

    const candidateBases = [padded, unpadded];

    candidateBases.forEach(name => {
      extensions.forEach(ext => {
        const filePath = `Portfolio/${folderName}/${name}.${ext}`;
        testAndAddMedia(filePath, container, isVideo, `${name}.${ext}`, () => {
          foundCount++;
          removeEmptyState(container);
        });
      });
    });
  }

  // If after checking none exist yet, display user-friendly helper
  setTimeout(() => {
    if (foundCount === 0) {
      showEmptyState(folderName, container, isVideo);
    }
  }, 600);
}

function testAndAddMedia(url, container, isVideo, fileName, onSuccess) {
  if (isVideo) {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = url;
    video.onloadeddata = () => {
      // Avoid duplicate insertion if padded and unpadded match
      if (container.querySelector(`[data-url="${url}"]`)) return;
      onSuccess();
      const card = createMediaCard(url, fileName, true);
      container.appendChild(card);
    };
  } else {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      if (container.querySelector(`[data-url="${url}"]`)) return;
      onSuccess();
      const card = createMediaCard(url, fileName, false);
      container.appendChild(card);
    };
  }
}

function createMediaCard(url, fileName, isVideo) {
  const item = document.createElement('div');
  item.className = 'portfolio-media-item';
  item.setAttribute('data-url', url);

  const tag = document.createElement('span');
  tag.className = 'media-tag';
  tag.textContent = fileName;

  const overlay = document.createElement('div');
  overlay.className = 'media-hover-overlay';
  overlay.innerHTML = '<i class="fa-solid fa-expand"></i>';

  if (isVideo) {
    const vid = document.createElement('video');
    vid.src = url;
    vid.muted = true;
    vid.loop = true;
    vid.playsInline = true;
    // Auto preview on hover
    item.addEventListener('mouseenter', () => vid.play().catch(() => {}));
    item.addEventListener('mouseleave', () => {
      vid.pause();
      vid.currentTime = 0;
    });
    item.appendChild(vid);
  } else {
    const img = document.createElement('img');
    img.src = url;
    img.alt = fileName;
    img.loading = 'lazy';
    item.appendChild(img);
  }

  item.appendChild(tag);
  item.appendChild(overlay);

  // Click opens in fullscreen lightbox
  item.addEventListener('click', () => {
    openLightbox(url, isVideo);
  });

  return item;
}

function showEmptyState(folderName, container, isVideo) {
  if (container.querySelector('.empty-state') || container.children.length > 0) return;

  const empty = document.createElement('div');
  empty.className = 'empty-state';
  empty.innerHTML = `
    <i class="fa-solid ${isVideo ? 'fa-film' : 'fa-images'}"></i>
    <h4>Portfolio/${folderName} Ready</h4>
    <p>Place your files (named <strong>01, 02, 03...</strong> up to 100+) in the <code>Portfolio/${folderName}</code> folder. They will automatically appear right here in rows of 2!</p>
  `;
  container.appendChild(empty);
}

function removeEmptyState(container) {
  const empty = container.querySelector('.empty-state');
  if (empty) empty.remove();
}

/**
 * Fullscreen Lightbox Modal
 */
function setupLightbox() {
  const modal = document.getElementById('mediaLightbox');
  const closeBtn = document.getElementById('lightboxClose');

  if (!modal || !closeBtn) return;

  closeBtn.addEventListener('click', () => {
    closeLightbox();
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
    }
  });
}

function openLightbox(url, isVideo) {
  const modal = document.getElementById('mediaLightbox');
  const slot = document.getElementById('lightboxMediaSlot');
  if (!modal || !slot) return;

  slot.innerHTML = '';

  if (isVideo) {
    const video = document.createElement('video');
    video.src = url;
    video.controls = true;
    video.autoplay = true;
    video.style.maxWidth = '100%';
    video.style.maxHeight = '85vh';
    slot.appendChild(video);
  } else {
    const img = document.createElement('img');
    img.src = url;
    img.style.maxWidth = '100%';
    img.style.maxHeight = '85vh';
    slot.appendChild(img);
  }

  modal.classList.add('active');
}

function closeLightbox() {
  const modal = document.getElementById('mediaLightbox');
  const slot = document.getElementById('lightboxMediaSlot');
  if (!modal) return;

  modal.classList.remove('active');
  if (slot) slot.innerHTML = '';
}
