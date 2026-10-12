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
let openCvPreview = null;
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
    if (openCvPreview) cv.addEventListener('click', event => { event.preventDefault(); openCvPreview(); });
    links.append(cv);
  }
  if (profile.email) links.append(externalLink(`mailto:${profile.email}`, 'Email ↗'));
  if (profile.whatsapp) links.append(externalLink(`https://wa.me/${profile.whatsapp}`, 'WhatsApp ↗'));
  if (profile.github) links.append(externalLink(profile.github, 'GitHub ↗'));
  if (profile.linkedin) links.append(externalLink(profile.linkedin, 'LinkedIn ↗'));
  const orbit = qs('#orbit-links');
  if (orbit) {
    orbit.replaceChildren(...Array.from(links.children).map(child => {
      const clone = child.cloneNode(true);
      clone.setAttribute('target', '_blank');
      clone.setAttribute('rel', 'noopener noreferrer');
      return clone;
    }));
  }
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
  const openCv = () => {
    if (!loaded) {
      frame.src = `${links[0].getAttribute('href')}#toolbar=0&navpanes=0`;
      loaded = true;
    }
    modal.showModal();
  };
  links.forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    openCv();
  }));
  openCvPreview = openCv;
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
function setupLaunch() {
  const launchBtn = qs('#launch-btn');
  const overlay = qs('#launch-overlay');
  if (!launchBtn || !overlay) return;
  const canvas = qs('#starfield');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const countdown = qs('#countdown');
  const exitBtn = qs('#orbit-exit');
  const rocket = qs('#mission-rocket');
  const padRocket = qs('.pad-rocket');
  const sourceSvg = rocket ? rocket.querySelector('svg') : null;
  if (padRocket && sourceSvg) padRocket.append(sourceSvg.cloneNode(true));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let timers = [];
  let raf = null;
  let stars = [];
  let meteor = null;
  let ascent = false;
  let starBoost = 0;
  let flying = false;
  let flightStart = 0;
  let ascentRate = 0;
  const FLIGHT_MS = 3000;
  let width = 0;
  let height = 0;
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  const clearTimers = () => {
    timers.forEach(timer => clearTimeout(timer));
    timers = [];
  };
  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const makeStars = () => {
    const count = Math.min(240, Math.round((width * height) / 7000));
    stars = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      depth: 0.3 + Math.random() * 0.7,
      size: 0.5 + Math.random() * 1.3,
      twinkle: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 1.2
    }));
  };
  const smoothstep = (a, b, x) => {
    const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  const draw = (timestamp) => {
    if (!ctx) return;
    const now = timestamp || performance.now();
    ctx.clearRect(0, 0, width, height);
    if (flying) {
      const t = Math.min((now - flightStart) / FLIGHT_MS, 1);
      const ease = t * t * t;
      rocket.style.transform = `translateY(${-150 * ease}vh)`;
      overlay.style.setProperty('--space', smoothstep(0.38, 0.95, ease).toFixed(3));
      overlay.style.setProperty('--cloud-move', smoothstep(0.1, 0.5, ease).toFixed(3));
      overlay.style.setProperty('--cloud-fade', (1 - smoothstep(0.45, 0.8, ease)).toFixed(3));
      starBoost = Math.max(starBoost, ease);
      ascentRate = 2 + 46 * ease;
      if (t >= 1) {
        flying = false;
        reachOrbit();
      }
    }
    const palette = ['#ffffff', '#f5f3ed', '#cfd8e3'];
    stars.forEach((star, i) => {
      star.twinkle += 0.03 * star.speed;
      const wave = Math.sin(star.twinkle);
      ctx.globalAlpha = (0.3 + Math.abs(wave) * 0.65 * star.depth) * (0.35 + 0.65 * starBoost);
      ctx.fillStyle = palette[i % palette.length];
      if (ascent) {
        star.y += (ascentRate * star.depth) / height;
        if (star.y > 1.02) { star.y = -0.03; star.x = Math.random(); }
        const px = star.x * width;
        const py = star.y * height;
        const len = (3 + ascentRate * 0.7) * star.depth;
        ctx.fillRect(px, py - len, star.size * star.depth + 0.5, len + star.size);
        return;
      }
      star.y += (0.14 * star.depth) / height;
      if (star.y > 1.02) { star.y = -0.02; star.x = Math.random(); }
      const px = star.x * width;
      const py = star.y * height;
      const radius = star.size * star.depth;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, 7);
      ctx.fill();
      if (star.size > 1.35 && wave > 0.86) {
        const flare = (wave - 0.86) / 0.14;
        ctx.globalAlpha = flare * star.depth;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 0.7;
        const arm = radius * 4.5 * flare + 2;
        ctx.beginPath();
        ctx.moveTo(px - arm, py);
        ctx.lineTo(px + arm, py);
        ctx.moveTo(px, py - arm);
        ctx.lineTo(px, py + arm);
        ctx.stroke();
        ctx.shadowBlur = 9;
        ctx.shadowColor = 'rgba(245,243,237,.9)';
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, 7);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });
    if (!ascent) {
      if (!meteor && Math.random() < 0.008) {
        const colors = ['255,233,201', '207,228,255', '245,243,237'];
        meteor = { x: 0.15 + Math.random() * 0.7, y: Math.random() * 0.2, vx: 0.9 + Math.random() * 0.5, vy: 0.42 + Math.random() * 0.3, life: 1, rgb: colors[Math.floor(Math.random() * colors.length)], trail: [] };
      }
      if (meteor) {
        meteor.x += meteor.vx / 60;
        meteor.y += meteor.vy / 60;
        meteor.life -= 0.012;
        const mx = meteor.x * width;
        const my = meteor.y * height;
        meteor.trail.push({ x: mx, y: my, life: 1 });
        meteor.trail.forEach(spark => {
          spark.life -= 0.03;
          spark.y += 0.4;
        });
        meteor.trail = meteor.trail.filter(spark => spark.life > 0);
        meteor.trail.forEach(spark => {
          ctx.globalAlpha = spark.life * 0.7;
          ctx.fillStyle = `rgba(${meteor.rgb},${spark.life})`;
          ctx.fillRect(spark.x, spark.y, 1.4, 1.4);
        });
        const tail = 150 * meteor.life;
        const gradient = ctx.createLinearGradient(mx, my, mx - tail * meteor.vx, my - tail * meteor.vy);
        gradient.addColorStop(0, `rgba(${meteor.rgb},.95)`);
        gradient.addColorStop(1, `rgba(${meteor.rgb},0)`);
        ctx.globalAlpha = Math.max(meteor.life, 0);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.7;
        ctx.beginPath();
        ctx.moveTo(mx, my);
        ctx.lineTo(mx - tail * meteor.vx, my - tail * meteor.vy);
        ctx.stroke();
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(${meteor.rgb},.9)`;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(mx, my, 1.9, 0, 7);
        ctx.fill();
        ctx.shadowBlur = 0;
        if (meteor.life <= 0 || mx < -180 || my > height + 180) meteor = null;
      }
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(draw);
  };
  const tick = text => {
    countdown.textContent = text;
    countdown.classList.remove('tick');
    void countdown.offsetWidth;
    countdown.classList.add('tick');
  };
  const reachOrbit = () => {
    ascent = false;
    ascentRate = 0;
    overlay.style.setProperty('--space', '1');
    overlay.style.setProperty('--cloud-fade', '0');
    overlay.classList.add('orbit');
  };
  const ignite = () => {
    overlay.classList.add('flame-on', 'ignition');
  };
  const liftoff = () => {
    tick('LIFTOFF');
    overlay.classList.add('lift-off');
    ascent = true;
    flightStart = performance.now();
    flying = true;
  };
  const open = () => {
    clearTimers();
    if (rocket) rocket.style.transition = 'none';
    overlay.classList.remove('orbit', 'lift-off', 'flame-on', 'ignition');
    if (rocket) void rocket.offsetWidth;
    if (rocket) rocket.style.transition = '';
    countdown.classList.remove('tick');
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    resize();
    makeStars();
    meteor = null;
    starBoost = 0;
    flying = false;
    ascentRate = 0;
    overlay.style.setProperty('--space', '0');
    overlay.style.setProperty('--cloud-move', '0');
    overlay.style.setProperty('--cloud-fade', '1');
    if (rocket) {
      rocket.style.transform = '';
      rocket.style.opacity = reduced ? '0' : '';
    }
    if (ctx) {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    }
    exitBtn.focus();
    if (reduced) {
      later(reachOrbit, 700);
      return;
    }
    later(() => tick('3'), 750);
    later(() => tick('2'), 1600);
    later(() => tick('1'), 2450);
    later(ignite, 3300);
    later(liftoff, 4400);
  };
  const close = () => {
    clearTimers();
    flying = false;
    overlay.classList.remove('open', 'orbit', 'lift-off', 'flame-on', 'ignition');
    overlay.setAttribute('aria-hidden', 'true');
    countdown.classList.remove('tick');
    document.body.style.overflow = '';
    overlay.style.removeProperty('--space');
    overlay.style.removeProperty('--cloud-move');
    overlay.style.removeProperty('--cloud-fade');
    if (rocket) {
      rocket.style.transition = 'none';
      rocket.style.transform = '';
      void rocket.offsetWidth;
      rocket.style.transition = '';
    }
    if (raf) {
      cancelAnimationFrame(raf);
      raf = null;
    }
    launchBtn.focus();
  };
  launchBtn.addEventListener('click', open);
  exitBtn.addEventListener('click', close);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && overlay.classList.contains('open')) close();
  });
  window.addEventListener('resize', () => {
    if (!overlay.classList.contains('open')) return;
    resize();
    makeStars();
  });
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
  setupLaunch();
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
