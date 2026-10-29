/**
 * ====================================================================
 * LUXEVISUALS CLIENT SCRIPT (app.js)
 * ====================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initStatsAndLinks();
  setupVideoLoader();
  setupNavigation();
  setupPortfolio();
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

  const dismissLoader = () => {
    loader.classList.add('hidden');
    video.pause();
  };

  video.addEventListener('ended', dismissLoader);
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

    const currentActive = document.querySelector('.view-section.active');
    if (currentActive && currentActive.id === `view-${targetName}`) return;

    triggerPageTransition(() => {
      document.querySelectorAll('.nav-links .nav-item').forEach(item => {
        if (item.getAttribute('data-nav') === targetName) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });

      Object.keys(views).forEach(key => {
        if (key === targetName) {
          views[key].classList.add('active');
        } else {
          views[key].classList.remove('active');
        }
      });

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
 * Portfolio: tabs + direct-render loading (no probing!)
 */
function setupPortfolio() {
  const tabPhotosBtn = document.getElementById('tabPhotosBtn');
  const tabVideosBtn = document.getElementById('tabVideosBtn');
  const photosGrid = document.getElementById('photosGrid');
  const videosGrid = document.getElementById('videosGrid');

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

  directRenderFolder('Videos', videosGrid, true);
  directRenderFolder('Photos', photosGrid, false);
  loadXPosts(videosGrid);
}

/**
 * DIRECT RENDER approach:
 * Instead of probing whether files exist (which fails on file://),
 * we create all cards immediately for 01..max and hide the ones
 * whose media fails to load. This works on both file:// and https://.
 */
function directRenderFolder(folderName, container, isVideo) {
  const cfg = window.LUXE_CONFIG?.portfolio || {};
  const max = cfg.maxItemsToCheck || 100;

  // For videos we only check .mp4 (most common), for photos we check .png then .jpg
  const primaryExt = isVideo ? 'mp4' : 'png';
  const fallbackExt = isVideo ? null : 'jpg';

  container.innerHTML = '';
  let foundCount = 0;

  const statusBar = document.getElementById('portfolioLoadingStatus');
  const statusText = document.getElementById('portfolioStatusText');

  if (statusBar) statusBar.classList.remove('hidden');
  if (statusText) statusText.textContent = `Loading ${isVideo ? 'videos' : 'photos'}...`;

  // Create all cards immediately, hide ones that fail
  for (let i = 1; i <= max; i++) {
    const padded = String(i).padStart(2, '0');
    const filePath = `Portfolio/${folderName}/${padded}.${primaryExt}`;

    const card = createDirectCard(filePath, `${padded}.${primaryExt}`, isVideo, i,
      // onLoaded
      () => {
        foundCount++;
        if (statusText) statusText.textContent = `Loaded ${foundCount} ${isVideo ? 'videos' : 'photos'}...`;
      },
      // onFailed - try fallback extension, or hide
      () => {
        if (fallbackExt) {
          const fbPath = `Portfolio/${folderName}/${padded}.${fallbackExt}`;
          retryCardWithFallback(card, fbPath, `${padded}.${fallbackExt}`, isVideo,
            () => {
              foundCount++;
              if (statusText) statusText.textContent = `Loaded ${foundCount} ${isVideo ? 'videos' : 'photos'}...`;
            },
            () => {
              card.style.display = 'none';
            }
          );
        } else {
          card.style.display = 'none';
        }
      }
    );

    container.appendChild(card);
  }

  // After a generous wait, clean up hidden cards and update status
  setTimeout(() => {
    // Remove all hidden (non-existent) cards from DOM
    container.querySelectorAll('.portfolio-media-item[style*="display: none"]').forEach(el => el.remove());

    if (foundCount === 0) {
      showEmptyState(folderName, container, isVideo);
    }

    if (statusText) statusText.textContent = `All ${isVideo ? 'videos' : 'photos'} loaded! (${foundCount} found)`;
    setTimeout(() => {
      if (statusBar) statusBar.classList.add('hidden');
    }, 800);
  }, 3000);
}

/**
 * Create a card with embedded media that self-hides on error.
 */
function createDirectCard(url, fileName, isVideo, index, onLoaded, onFailed) {
  const item = document.createElement('div');
  item.className = 'portfolio-media-item';
  item.setAttribute('data-url', url);
  item.setAttribute('data-index', index);

  const tag = document.createElement('span');
  tag.className = 'media-tag';
  tag.textContent = fileName;

  const overlay = document.createElement('div');
  overlay.className = 'media-hover-overlay';
  overlay.innerHTML = '<i class="fa-solid fa-expand"></i>';

  if (isVideo) {
    const vid = document.createElement('video');
    vid.src = url;
    vid.preload = 'auto';
    vid.muted = true;
    vid.loop = true;
    vid.playsInline = true;

    vid.addEventListener('loadeddata', () => { if (onLoaded) onLoaded(); }, { once: true });
    vid.addEventListener('error', () => { if (onFailed) onFailed(); }, { once: true });

    item.addEventListener('mouseenter', () => vid.play().catch(() => {}));
    item.addEventListener('mouseleave', () => { vid.pause(); vid.currentTime = 0; });
    item.appendChild(vid);
  } else {
    const img = document.createElement('img');
    img.src = url;
    img.alt = fileName;

    img.addEventListener('load', () => { if (onLoaded) onLoaded(); }, { once: true });
    img.addEventListener('error', () => { if (onFailed) onFailed(); }, { once: true });

    item.appendChild(img);
  }

  item.appendChild(tag);
  item.appendChild(overlay);

  item.addEventListener('click', () => {
    openLightbox(url, isVideo);
  });

  return item;
}

/**
 * Retry a card with a fallback file extension (e.g. .jpg if .png failed)
 */
function retryCardWithFallback(card, newUrl, newFileName, isVideo, onLoaded, onFailed) {
  card.setAttribute('data-url', newUrl);

  // Update the tag label
  const tag = card.querySelector('.media-tag');
  if (tag) tag.textContent = newFileName;

  if (isVideo) {
    const vid = card.querySelector('video');
    if (vid) {
      vid.src = newUrl;
      vid.addEventListener('loadeddata', () => { if (onLoaded) onLoaded(); }, { once: true });
      vid.addEventListener('error', () => { if (onFailed) onFailed(); }, { once: true });
    } else {
      if (onFailed) onFailed();
    }
  } else {
    const img = card.querySelector('img');
    if (img) {
      img.src = newUrl;
      img.alt = newFileName;
      img.addEventListener('load', () => { if (onLoaded) onLoaded(); }, { once: true });
      img.addEventListener('error', () => { if (onFailed) onFailed(); }, { once: true });
    } else {
      if (onFailed) onFailed();
    }
  }

  // Update lightbox click
  card.onclick = () => openLightbox(newUrl, isVideo);
}

/**
 * Loads X (Twitter) Video / Media Posts from XPosts.js
 */
function loadXPosts(container) {
  const posts = window.X_POSTS || [];
  if (!Array.isArray(posts) || posts.length === 0) return;

  posts.forEach((url, idx) => {
    if (!url || typeof url !== 'string' || !url.trim()) return;
    const cleanUrl = url.trim();

    const item = document.createElement('div');
    item.className = 'portfolio-media-item x-embed-item';
    item.setAttribute('data-x-url', cleanUrl);

    const blockquote = document.createElement('blockquote');
    blockquote.className = 'twitter-tweet';
    blockquote.setAttribute('data-theme', 'dark');
    blockquote.setAttribute('data-dnt', 'true');
    blockquote.setAttribute('data-align', 'center');

    const anchor = document.createElement('a');
    anchor.href = cleanUrl;
    anchor.textContent = `Loading X Post #${idx + 1}...`;
    blockquote.appendChild(anchor);

    item.appendChild(blockquote);
    container.appendChild(item);
  });

  if (window.twttr && window.twttr.widgets) {
    window.twttr.widgets.load(container);
  } else {
    const timer = setInterval(() => {
      if (window.twttr && window.twttr.widgets) {
        window.twttr.widgets.load(container);
        clearInterval(timer);
      }
    }, 400);
    setTimeout(() => clearInterval(timer), 6000);
  }
}

function showEmptyState(folderName, container, isVideo) {
  if (container.querySelector('.empty-state') || container.querySelectorAll('.portfolio-media-item:not([style*="display: none"])').length > 0) return;

  const empty = document.createElement('div');
  empty.className = 'empty-state';
  empty.innerHTML = `
    <i class="fa-solid ${isVideo ? 'fa-film' : 'fa-images'}"></i>
    <h4>Portfolio/${folderName} Ready</h4>
    <p>Place your files (named <strong>01, 02, 03...</strong> up to 100+) in the <code>Portfolio/${folderName}</code> folder. They will automatically appear right here in rows of 2!</p>
  `;
  container.appendChild(empty);
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
