/**
 * geovanikalil.site — script principal (interatividade, idioma pt/en, filtros e modal)
 */

(function () {
  'use strict';

  const header = document.getElementById('site-header');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navLinksContainer = document.getElementById('nav-links');
  const navLinks = document.querySelectorAll('.nav-link');
  const projectsGrid = document.getElementById('projects-grid');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const articlesList = document.getElementById('articles-list');
  const modalBackdrop = document.getElementById('article-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalMeta = document.getElementById('modal-meta');
  const modalBody = document.getElementById('modal-body');
  const modalCloseBtn = document.getElementById('modal-close');
  const copyEmailBtn = document.getElementById('copy-email-btn');
  const currentYearSpan = document.getElementById('current-year');
  const langButtons = document.querySelectorAll('.lang-btn');
  const bgAmbient = document.querySelector('.bg-ambient');
  const smokeCanvas = document.getElementById('smoke-canvas');

  const data = window.SITE_DATA || { i18n: {}, projects: [], articles: [] };
  let currentLang = localStorage.getItem('gk_lang') || 'pt';
  let currentFilter = 'all';

  /* ========================================================================
     1. Header Scroll, Transição Azul -> Verde (Fundo e Botões) & Scroll-Spy
     ======================================================================== */
  let scrollProgress = 0; // 0 no topo (azul), 1 no final do site (verde)
  let lastScrollY = window.scrollY;
  let scrollBoost = 0;

  function lerpChannel(a, b, t) {
    return Math.round(a + (b - a) * t);
  }

  function updateDynamicColors(progress) {
    const rootStyle = document.documentElement.style;
    // Topo (t = 0): Azul Claro (#38BDF8 -> 56, 189, 248) | Final (t = 1): Verde Terminal (#0FF05B -> 15, 240, 91)
    const r = lerpChannel(56, 15, progress);
    const g = lerpChannel(189, 240, progress);
    const b = lerpChannel(248, 91, progress);

    rootStyle.setProperty('--accent-terminal', `rgb(${r}, ${g}, ${b})`);
    rootStyle.setProperty('--accent-glow', `rgba(${r}, ${g}, ${b}, 0.2)`);
    rootStyle.setProperty('--accent-glow-strong', `rgba(${r}, ${g}, ${b}, 0.38)`);
    rootStyle.setProperty('--accent-subtle', `rgba(${r}, ${g}, ${b}, 0.12)`);
    rootStyle.setProperty('--border-subtle', `rgba(${r}, ${g}, ${b}, 0.18)`);
    rootStyle.setProperty('--border-blue', `rgba(${r}, ${g}, ${b}, 0.36)`);
    rootStyle.setProperty('--border-blue-strong', `rgba(${r}, ${g}, ${b}, 0.72)`);

    // Atualiza também cada botão individualmente conforme sua altura na página + scroll
    const docHeight = Math.max(1, document.documentElement.scrollHeight);
    const allButtons = document.querySelectorAll('.btn, .filter-btn, .copy-btn');
    allButtons.forEach((btn) => {
      const rect = btn.getBoundingClientRect();
      const absTop = rect.top + window.scrollY;
      const posRatio = Math.min(1, Math.max(0, absTop / docHeight));
      const tBtn = Math.min(1, Math.max(0, progress * 0.7 + posRatio * 0.3));

      const br = lerpChannel(56, 15, tBtn);
      const bg = lerpChannel(189, 240, tBtn);
      const bb = lerpChannel(248, 91, tBtn);

      btn.style.setProperty('--btn-accent', `rgb(${br}, ${bg}, ${bb})`);
      btn.style.setProperty('--btn-glow', `rgba(${br}, ${bg}, ${bb}, 0.22)`);
      btn.style.setProperty('--btn-glow-strong', `rgba(${br}, ${bg}, ${bb}, 0.4)`);
      btn.style.setProperty('--btn-subtle', `rgba(${br}, ${bg}, ${bb}, 0.13)`);
      btn.style.setProperty('--btn-border', `rgba(${br}, ${bg}, ${bb}, 0.42)`);
    });
  }

  function handleScroll() {
    const y = window.scrollY;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    scrollProgress = Math.min(1, Math.max(0, y / maxScroll));

    const deltaY = y - lastScrollY;
    lastScrollY = y;
    scrollBoost = Math.max(-6, Math.min(8, deltaY * 0.12));

    updateDynamicColors(scrollProgress);

    if (y > 24) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    const sections = document.querySelectorAll('section[id]');
    const scrollPos = y + 160;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* Motor de Fumaça Subindo no Background (Azul no topo -> Verde no final) */
  if (smokeCanvas && smokeCanvas.getContext) {
    const ctx = smokeCanvas.getContext('2d');
    let width = (smokeCanvas.width = window.innerWidth);
    let height = (smokeCanvas.height = window.innerHeight);

    window.addEventListener(
      'resize',
      () => {
        width = smokeCanvas.width = window.innerWidth;
        height = smokeCanvas.height = window.innerHeight;
      },
      { passive: true }
    );

    const PUFF_COUNT = 28;
    const puffs = [];

    function createPuff(initialRandomY) {
      const radius = 160 + Math.random() * 240;
      return {
        x: Math.random() * width,
        y: initialRandomY ? Math.random() * (height + radius * 2) - radius : height + radius * 0.8,
        radius,
        vy: 0.55 + Math.random() * 0.95, // Velocidade de subida constante da fumaça
        swayAmp: 0.4 + Math.random() * 0.9,
        swayFreq: 0.004 + Math.random() * 0.006,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.14 + Math.random() * 0.2,
        toneShift: (Math.random() - 0.5) * 0.18, // Variação sutil entre nuvens de fumaça
      };
    }

    for (let i = 0; i < PUFF_COUNT; i++) {
      puffs.push(createPuff(true));
    }

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    let tick = 0;
    function renderSmoke() {
      tick += 1;
      scrollBoost *= 0.9;

      // Fundo base interpolando suavemente de Azul Industrial (#0A1128) no topo para Azul-Esverdeado escuro no final
      const bgR = Math.round(lerp(8, 5, scrollProgress));
      const bgG = Math.round(lerp(15, 24, scrollProgress));
      const bgB = Math.round(lerp(38, 28, scrollProgress));
      ctx.fillStyle = `rgb(${bgR}, ${bgG}, ${bgB})`;
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < puffs.length; i++) {
        const p = puffs[i];

        // Movimento de subida da fumaça + ondulação lateral orgânica
        p.y -= p.vy + scrollBoost * 0.35;
        p.x += Math.sin(tick * p.swayFreq + p.phase) * p.swayAmp;

        // Se subiu completamente além do topo, renasce na base
        if (p.y < -p.radius * 1.1) {
          p.y = height + p.radius * 0.9;
          p.x = Math.random() * width;
        } else if (p.y > height + p.radius * 1.2) {
          p.y = -p.radius * 0.8;
          p.x = Math.random() * width;
        }

        // Cor da fumaça interpolada pelo scroll:
        // Topo (t = 0): Azul (#2E78EE / #38BDF8) -> Final (t = 1): Verde Terminal (#0FF05B)
        const t = Math.min(1, Math.max(0, scrollProgress + p.toneShift));
        const r = Math.round(lerp(48, 15, t));
        const g = Math.round(lerp(132, 240, t));
        const b = Math.round(lerp(242, 91, t));

        const grad = ctx.createRadialGradient(p.x, p.y, p.radius * 0.08, p.x, p.y, p.radius);
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${p.alpha})`);
        grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.45})`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(renderSmoke);
    }

    requestAnimationFrame(renderSmoke);
  }

  /* ========================================================================
     2. Menu Mobile
     ======================================================================== */
  if (mobileMenuBtn && navLinksContainer) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = navLinksContainer.classList.toggle('open');
      mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        navLinksContainer.classList.remove('open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ========================================================================
     3. Renderização e Filtro de Projetos Técnicos
     ======================================================================== */
  function renderProjects(filterCategory = 'all') {
    if (!projectsGrid) return;

    const filtered =
      filterCategory === 'all'
        ? data.projects
        : data.projects.filter((p) => p.category === filterCategory);

    projectsGrid.innerHTML = filtered
      .map((project) => {
        const catLabel = project.categoryLabel[currentLang] || project.categoryLabel.pt;
        const title = project.title[currentLang] || project.title.pt;
        const desc = project.description[currentLang] || project.description.pt;

        return `
      <article class="project-card" data-category="${project.category}">
        <div>
          <div class="project-top">
            <div class="project-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
            </div>
            <div class="project-links">
              ${
                project.githubUrl
                  ? `<a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="project-link-icon" aria-label="github: ${title}" title="github">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                      </svg>
                    </a>`
                  : ''
              }
              ${
                project.liveUrl
                  ? `<a href="${project.liveUrl}" target="_blank" rel="noopener noreferrer" class="project-link-icon" aria-label="demo: ${title}" title="demo">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                    </a>`
                  : ''
              }
            </div>
          </div>
          <div class="project-category">${catLabel}</div>
          <h3 class="project-title">${title}</h3>
          <p class="project-desc">${desc}</p>
        </div>
        <ul class="project-stack" aria-label="stack">
          ${project.stack.map((tech) => `<li class="project-stack-item">${tech}</li>`).join('')}
        </ul>
      </article>
    `;
      })
      .join('');
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter') || 'all';
      renderProjects(currentFilter);
    });
  });

  /* ========================================================================
     4. Renderização de Artigos / Discussões & Modal de Leitura
     ======================================================================== */
  function openArticleModal(articleId) {
    const article = data.articles.find((a) => a.id === articleId);
    if (!article || !modalBackdrop) return;

    const topic = article.topic[currentLang] || article.topic.pt;
    const date = article.date[currentLang] || article.date.pt;
    const readTime = article.readTime[currentLang] || article.readTime.pt;
    const title = article.title[currentLang] || article.title.pt;
    const content = article.content[currentLang] || article.content.pt;

    modalTitle.textContent = title;
    modalMeta.innerHTML = `<span class="article-topic">${topic}</span> <span>${date}</span> <span>•</span> <span>${readTime}</span>`;
    modalBody.innerHTML = content;

    modalBackdrop.classList.add('open');
    modalBackdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeArticleModal() {
    if (!modalBackdrop) return;
    modalBackdrop.classList.remove('open');
    modalBackdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function renderArticles() {
    if (!articlesList) return;
    const readMoreLabel =
      (data.i18n[currentLang] && data.i18n[currentLang].articles.readMore) || 'ler texto completo';

    articlesList.innerHTML = data.articles
      .map((article) => {
        const topic = article.topic[currentLang] || article.topic.pt;
        const date = article.date[currentLang] || article.date.pt;
        const readTime = article.readTime[currentLang] || article.readTime.pt;
        const title = article.title[currentLang] || article.title.pt;
        const summary = article.summary[currentLang] || article.summary.pt;

        return `
      <article class="article-card" tabindex="0" role="button" data-article-id="${article.id}" aria-label="${title}">
        <div>
          <div class="article-meta">
            <span class="article-topic">${topic}</span>
            <span>${date}</span>
            <span>•</span>
            <span>${readTime}</span>
          </div>
          <h3 class="article-title">${title}</h3>
          <p class="article-summary">${summary}</p>
        </div>
        <span class="article-readmore">
          ${readMoreLabel}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </span>
      </article>
    `;
      })
      .join('');

    articlesList.querySelectorAll('.article-card').forEach((card) => {
      const id = card.getAttribute('data-article-id');
      card.addEventListener('click', () => openArticleModal(id));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openArticleModal(id);
        }
      });
    });
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeArticleModal);
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeArticleModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop && modalBackdrop.classList.contains('open')) {
      closeArticleModal();
    }
  });

  /* ========================================================================
     5. Seletor de Idioma (pt / en)
     ======================================================================== */
  function resolveKey(obj, path) {
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : null), obj);
  }

  function applyLanguage(lang) {
    currentLang = data.i18n[lang] ? lang : 'pt';
    localStorage.setItem('gk_lang', currentLang);
    document.documentElement.lang = currentLang === 'en' ? 'en' : 'pt-BR';

    langButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
    });

    const dict = data.i18n[currentLang];
    if (dict) {
      document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        const val = resolveKey(dict, key);
        if (val !== null) {
          el.innerHTML = val;
        }
      });
    }

    renderProjects(currentFilter);
    renderArticles();
    handleScroll();
  }

  langButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const selected = btn.getAttribute('data-lang');
      if (selected) applyLanguage(selected);
    });
  });

  applyLanguage(currentLang);

  /* ========================================================================
     6. Copiar E-mail & Ano Atual
     ======================================================================== */
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', async () => {
      const email = copyEmailBtn.getAttribute('data-email') || 'contato@geovanikalil.site';
      const dict = data.i18n[currentLang] || data.i18n.pt;
      try {
        await navigator.clipboard.writeText(email);
        copyEmailBtn.textContent = (dict && dict.contact && dict.contact.copied) || 'copiado!';
        setTimeout(() => {
          copyEmailBtn.textContent = (dict && dict.contact && dict.contact.copy) || 'copiar';
        }, 2000);
      } catch {
        window.location.href = `mailto:${email}`;
      }
    });
  }

  if (currentYearSpan) {
    currentYearSpan.textContent = String(new Date().getFullYear());
  }
})();
