'use strict';

// All editable portfolio content lives in data/content.json.
// For local preview, serve the folder with a small HTTP server (see README).
const qs = (selector) => document.querySelector(selector);
const create = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};
const append = (parent, ...nodes) => nodes.forEach(node => parent.append(node));
const externalLink = (url, label) => {
  const anchor = create('a', '', label);
  anchor.href = url;
  if (/^https?:\/\//.test(url)) {
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
  }
  return anchor;
};
function renderProfile(profile) {
  qs('#profile-location').textContent = profile.location;
  qs('#hero-intro').textContent = profile.intro;
  const about = qs('#about-text');
  about.replaceChildren(...profile.about.map(paragraph => create('p', '', paragraph)));
  const links = qs('#contact-links');
  if (profile.resume) {
    const cv = externalLink(profile.resume, 'Download CV ↗');
    cv.className = 'cv-link';
    links.append(cv);
  }
  if (profile.email) links.append(externalLink(`mailto:${profile.email}`, 'Email ↗'));
  if (profile.whatsapp) links.append(externalLink(`https://wa.me/${profile.whatsapp}`, 'WhatsApp ↗'));
  if (profile.github) links.append(externalLink(profile.github, 'GitHub ↗'));
  if (profile.linkedin) links.append(externalLink(profile.linkedin, 'LinkedIn ↗'));
}
function renderExperience(items) {
  const root = qs('#experience-list');
  items.forEach(item => {
    const article = create('article', 'experience-item');
    const header = create('div', 'experience-header');
    const label = create('div');
    append(label, create('h3', 'experience-role', item.role), create('div', 'experience-company', `${item.company} · ${item.location || 'Indonesia'}`));
    append(header, label, create('span', 'experience-date', item.period));
    append(article, header, create('p', 'experience-description', item.description));
    if (item.highlights?.length) {
      const ul = create('ul', 'highlights');
      item.highlights.forEach(highlight => ul.append(create('li', '', highlight)));
      article.append(ul);
    }
    if (item.stack?.length) {
      const pills = create('div', 'pill-row');
      item.stack.forEach(skill => pills.append(create('span', 'pill', skill)));
      article.append(pills);
    }
    root.append(article);
  });
}
function openProjectModal(project, modal) {
  qs('#modal-kind').textContent = project.type || 'Project';
  qs('#modal-title').textContent = project.name;
  qs('#modal-description').textContent = project.detail || project.description;
  const features = project.features || [];
  qs('#modal-features').replaceChildren(...features.map(item => create('li', '', item)));
  qs('#modal-features-wrap').hidden = !features.length;
  const stack = qs('#modal-stack');
  stack.replaceChildren(...(project.stack || []).map(item => create('span', 'pill', item)));
  const links = qs('#modal-links');
  links.replaceChildren();
  if (project.url) links.append(externalLink(project.url, 'Visit project ↗'));
  if (project.repository) links.append(externalLink(project.repository, 'Source code ↗'));
  if (!links.childNodes.length) links.append(create('span', 'pill', 'Coming soon'));
  if (!modal.open) modal.showModal();
}
function setupCvModal() {
  const modal = qs('#cv-modal');
  if (!modal) return;
  const links = document.querySelectorAll('.cv-link');
  if (!links.length) return;
  const frame = qs('#cv-frame');
  let loaded = false;
  const open = event => {
    event.preventDefault();
    if (!loaded) {
      frame.src = `${links[0].getAttribute('href')}#toolbar=0&navpanes=0`;
      loaded = true;
    }
    modal.showModal();
  };
  links.forEach(link => link.addEventListener('click', open));
  qs('#cv-close').addEventListener('click', () => modal.close());
  modal.addEventListener('click', event => {
    if (event.target === modal) modal.close();
  });
}
function setupProjectModal() {
  const modal = qs('#project-modal');
  if (!modal) return;
  qs('#modal-close').addEventListener('click', () => modal.close());
  modal.addEventListener('click', event => {
    if (event.target === modal) modal.close();
  });
}
function renderProjects(projects) {
  const root = qs('#projects-list');
  const modal = qs('#project-modal');
  if (!projects.length) {
    const empty = create('div', 'empty-projects');
    append(empty, create('strong', '', 'Selected projects, coming soon.'), create('p', '', 'This section is intentionally left without fictional case studies. Add your own public or approved projects to data/content.json and they will appear here.'));
    root.append(empty);
    return;
  }
  projects.forEach((project, i) => {
    const card = create('article', 'project-card');
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-haspopup', 'dialog');
    card.setAttribute('aria-label', `Open ${project.name} details`);
    const top = create('div', 'project-top');
    append(top, create('span', 'project-number', String(i + 1).padStart(2, '0')), create('span', 'project-kind', project.type || 'Project'));
    append(card, top, create('h3', 'project-title', project.name), create('p', 'project-description', project.description));
    if (project.stack?.length) {
      const tags = create('div', 'pill-row');
      project.stack.forEach(item => tags.append(create('span', 'pill', item)));
      card.append(tags);
    }
    const links = create('div', 'project-links');
    if (project.url) links.append(externalLink(project.url, 'Visit project ↗'));
    if (project.repository) links.append(externalLink(project.repository, 'Source code ↗'));
    const details = create('button', 'project-details');
    details.type = 'button';
    details.append(document.createTextNode('Details'), create('span', '', '→'));
    links.append(details);
    links.querySelectorAll('a').forEach(anchor => anchor.addEventListener('click', event => event.stopPropagation()));
    card.addEventListener('click', () => openProjectModal(project, modal));
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openProjectModal(project, modal);
      }
    });
    card.append(links);
    root.append(card);
  });
}
function renderSkills(groups) {
  const root = qs('#skills-list');
  groups.forEach(group => {
    const row = create('div', 'skill-group');
    const items = create('div', 'skill-items');
    group.items.forEach(item => items.append(create('span', 'skill-item', item)));
    append(row, create('h3', '', group.label), items);
    root.append(row);
  });
}
function renderEducation(education, recognition) {
  const root = qs('#education-list');
  education.forEach(item => {
    const row = create('div', 'education-item');
    const details = create('div');
    append(details, create('strong', '', item.school), create('p', '', item.program));
    append(row, details, create('span', 'education-date', item.period));
    root.append(row);
  });
  const awards = qs('#recognition-list');
  recognition.forEach(item => {
    const block = create('div', 'recognition');
    append(block, create('strong', '', `${item.year} / `), document.createTextNode(item.title));
    awards.append(block);
  });
}
function setupTheme() {
  const toggle = qs('#theme-toggle');
  if (!toggle) return;
  const root = document.documentElement;
  const meta = qs('meta[name="theme-color"]');
  const apply = (theme) => {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch (e) {}
    const dark = theme === 'dark';
    if (meta) meta.setAttribute('content', dark ? '#151713' : '#f5f3ed');
    toggle.setAttribute('aria-pressed', String(dark));
    toggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  };
  toggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || reduced) {
      apply(next);
      return;
    }
    const rect = toggle.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const maxRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    const transition = document.startViewTransition(() => apply(next));
    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxRadius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(.22,1,.36,1)', pseudoElement: '::view-transition-new(root)' }
      );
    }).catch(() => {});
  });
  apply(root.getAttribute('data-theme') || 'light');
}
function setupNavbar() {
  const header = qs('.topbar');
  if (!header) return;
  let lastY = window.scrollY;
  let ticking = false;
  const update = () => {
    const y = window.scrollY;
    const delta = y - lastY;
    if (y > 140 && delta > 2) header.classList.add('nav-hidden');
    else if (y <= 140 || delta < -2) header.classList.remove('nav-hidden');
    header.classList.toggle('nav-scrolled', y > 10);
    lastY = y;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  update();
}
function enableMotion() {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('anim-ready');
  }
}
function setupReveal() {
  if (!document.documentElement.classList.contains('anim-ready') || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = parseFloat(el.style.getPropertyValue('--rd')) || 0;
      el.classList.add('in-view');
      observer.unobserve(el);
      setTimeout(() => {
        el.removeAttribute('data-reveal');
        el.classList.remove('in-view');
        el.style.removeProperty('--rd');
      }, 850 + delay);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  const watch = (el, index) => {
    if (!el) return;
    el.setAttribute('data-reveal', '');
    el.style.setProperty('--rd', `${Math.min((index || 0) * 70, 350)}ms`);
    observer.observe(el);
  };
  ['.section-heading', '.section-content', '.additional-block', '.contact-layout'].forEach(selector => {
    document.querySelectorAll(selector).forEach(el => watch(el));
  });
  [['#experience-list', '.experience-item'], ['#projects-list', '.project-card, .empty-projects'], ['#skills-list', '.skill-group']].forEach(([parentSelector, itemSelector]) => {
    const container = qs(parentSelector);
    if (!container) return;
    Array.from(container.querySelectorAll(itemSelector)).forEach((el, i) => watch(el, i));
  });
}
function setupCursor() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const root = document.documentElement;
  const dot = create('div', 'cursor-dot');
  const ring = create('div', 'cursor-ring');
  document.body.append(ring, dot);
  root.classList.add('custom-cursor');
  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let ringX = x;
  let ringY = y;
  const onMove = event => {
    x = event.clientX;
    y = event.clientY;
    dot.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`;
    root.classList.add('cursor-active');
    const interactive = event.target instanceof Element && event.target.closest('a, button, [role="button"], .project-card');
    ring.classList.toggle('is-hover', Boolean(interactive));
    dot.classList.toggle('is-hover', Boolean(interactive));
  };
  window.addEventListener('mousemove', onMove, { passive: true });
  document.addEventListener('mouseleave', () => root.classList.remove('cursor-active'));
  window.addEventListener('mousedown', () => ring.classList.add('is-down'));
  window.addEventListener('mouseup', () => ring.classList.remove('is-down'));
  document.addEventListener('mouseover', event => {
    const overIframe = event.target instanceof Element && event.target.tagName === 'IFRAME';
    ring.classList.toggle('cursor-hidden', overIframe);
    dot.classList.toggle('cursor-hidden', overIframe);
  });
  const loop = () => {
    ringX += (x - ringX) * 0.16;
    ringY += (y - ringY) * 0.16;
    ring.style.transform = `translate(${ringX}px,${ringY}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
async function init() {
  enableMotion();
  setupCursor();
  setupTheme();
  setupNavbar();
  setupProjectModal();
  setupCvModal();
  qs('#year').textContent = new Date().getFullYear();
  try {
    const response = await fetch('./data/content.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    renderProfile(data.profile);
    renderExperience(data.experience || []);
    renderProjects(data.projects || []);
    renderSkills(data.skills || []);
    renderEducation(data.education || [], data.recognition || []);
    setupReveal();
  } catch (error) {
    console.error('Could not load portfolio content:', error);
    qs('#about-text').textContent = 'Portfolio content could not be loaded. Start a local server or verify data/content.json.';
    qs('#projects-list').textContent = 'Content unavailable.';
  }
}
init();
