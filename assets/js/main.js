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

  const data = window.SITE_DATA || { i18n: {}, projects: [], articles: [] };
  let currentLang = localStorage.getItem('gk_lang') || 'pt';
  let currentFilter = 'all';

  /* ========================================================================
     1. Header Scroll, Fundo Fumaceado no Scroll & Scroll-Spy
     ======================================================================== */
  function handleScroll() {
    const y = window.scrollY;

    if (y > 24) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Movimento do fundo fumaceado fosco reagindo ao scroll (para baixo e para cima)
    if (bgAmbient) {
      const x1 = Math.sin(y * 0.0025) * 150;
      const y1 = -y * 0.22;
      const rot1 = y * 0.03;
      const scale1 = 1 + Math.sin(y * 0.0018) * 0.14;

      const x2 = Math.cos(y * 0.0022) * -170;
      const y2 = y * 0.16;
      const rot2 = -(y * 0.025);

      bgAmbient.style.setProperty('--smoke-x1', `${x1.toFixed(1)}px`);
      bgAmbient.style.setProperty('--smoke-y1', `${y1.toFixed(1)}px`);
      bgAmbient.style.setProperty('--smoke-rot1', `${rot1.toFixed(2)}deg`);
      bgAmbient.style.setProperty('--smoke-scale1', `${scale1.toFixed(3)}`);
      bgAmbient.style.setProperty('--smoke-x2', `${x2.toFixed(1)}px`);
      bgAmbient.style.setProperty('--smoke-y2', `${y2.toFixed(1)}px`);
      bgAmbient.style.setProperty('--smoke-rot2', `${rot2.toFixed(2)}deg`);
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
