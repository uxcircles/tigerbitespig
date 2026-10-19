(() => {
  const doc = document.documentElement;
  doc.classList.remove('no-js');

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const mobile = window.matchMedia('(max-width: 900px)');

  /* ---------- Strings ---------- */
  const zh = doc.lang.startsWith('zh');
  const T = zh ? {
    open: '開啟選單', close: '關閉選單',
    days: ['週日', '週一', '週二', '週三', '週四', '週五', '週六'],
    tomorrow: (h) => `明天 ${h}:00`,
    on: (d, h) => `${d} ${h}:00`,
    kitchen: (h) => `營業中 · 廚房供餐至 ${h}:00`,
    bar: (h) => `營業中 · 酒吧營業至 ${h}:00`,
    opensToday: (h) => `今天 ${h}:00 開門`,
    closed: (next) => `今日已打烊 · ${next} 開門`,
  } : {
    open: 'Open menu', close: 'Close menu',
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    tomorrow: (h) => `tomorrow at ${h}:00`,
    on: (d, h) => `${d} at ${h}:00`,
    kitchen: (h) => `Open now · Kitchen until ${h}:00`,
    bar: (h) => `Open now · Bar until ${h}:00`,
    opensToday: (h) => `Opens today at ${h}:00`,
    closed: (next) => `Closed · Opens ${next}`,
  };

  /* ---------- Header: solid on scroll, action bar after hero ---------- */
  const header = $('[data-header]');
  const actionBar = $('.action-bar');
  const hero = $('.hero');
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-solid', y > 40);
    actionBar.classList.toggle('is-shown', y > hero.offsetHeight * 0.6);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Dropdowns ---------- */
  const drops = $$('.has-drop');
  const closeDrops = (except) => drops.forEach((d) => {
    if (d === except) return;
    d.classList.remove('is-open');
    $('.drop-toggle', d).setAttribute('aria-expanded', 'false');
  });

  drops.forEach((d) => {
    const btn = $('.drop-toggle', d);
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = !d.classList.contains('is-open');
      closeDrops(d);
      d.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
    // desktop: open on hover too
    d.addEventListener('mouseenter', () => {
      if (mobile.matches) return;
      closeDrops(d);
      d.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
    });
    d.addEventListener('mouseleave', () => {
      if (mobile.matches) return;
      d.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.has-drop')) closeDrops(); });

  /* ---------- Mobile nav ---------- */
  const burger = $('[data-burger]');
  const nav = $('[data-nav]');
  const setNav = (open) => {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? T.close : T.open);
    document.body.classList.toggle('nav-locked', open);
    if (!open) closeDrops();
  };
  burger.addEventListener('click', () => setNav(!nav.classList.contains('is-open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
  mobile.addEventListener('change', () => setNav(false));

  /* ---------- Order sheet (mobile) ---------- */
  const sheet = $('[data-sheet]');
  let lastFocus = null;
  const setSheet = (open) => {
    sheet.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) { lastFocus = document.activeElement; $('.sheet-opt', sheet).focus(); }
    else if (lastFocus) lastFocus.focus();
  };
  $$('[data-sheet-open]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); setSheet(true); }));
  $$('[data-sheet-close]', sheet).forEach((b) => b.addEventListener('click', () => setSheet(false)));
  $$('.sheet-opt', sheet).forEach((a) => a.addEventListener('click', () => setSheet(false)));

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!sheet.hidden) return setSheet(false);
    const openDrop = drops.find((d) => d.classList.contains('is-open'));
    if (openDrop) { closeDrops(); $('.drop-toggle', openDrop).focus(); return; }
    if (nav.classList.contains('is-open')) { setNav(false); burger.focus(); }
  });

  /* ---------- Open / closed status (Europe/London) ---------- */
  // Church Street hours. 0 = Sunday. null = closed.
  const HOURS = { 0: null, 1: [12, 22], 2: [12, 22], 3: [12, 22], 4: [12, 22], 5: [12, 22], 6: [12, 22] };
  const KITCHEN_CLOSE = 21;

  const londonNow = () => {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23',
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t).value;
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
    return { day, hour: Number(get('hour')) + Number(get('minute')) / 60 };
  };

  const nextOpening = (day) => {
    for (let i = 1; i <= 7; i++) {
      const d = (day + i) % 7;
      if (HOURS[d]) return i === 1 ? T.tomorrow(HOURS[d][0]) : T.on(T.days[d], HOURS[d][0]);
    }
    return '';
  };

  const renderStatus = () => {
    const el = $('[data-status]');
    const text = $('[data-status-text]');
    const { day, hour } = londonNow();
    const today = HOURS[day];
    el.classList.remove('is-open', 'is-closed');

    if (today && hour >= today[0] && hour < today[1]) {
      el.classList.add('is-open');
      text.textContent = hour < KITCHEN_CLOSE ? T.kitchen(KITCHEN_CLOSE) : T.bar(today[1]);
    } else if (today && hour < today[0]) {
      el.classList.add('is-closed');
      text.textContent = T.opensToday(today[0]);
    } else {
      el.classList.add('is-closed');
      text.textContent = T.closed(nextOpening(day));
    }

    $$('[data-hours] tr').forEach((tr) => tr.classList.toggle('is-today', Number(tr.dataset.day) === day));
  };
  renderStatus();
  setInterval(renderStatus, 60_000);

  /* ---------- Signature rail ---------- */
  const rail = $('[data-rail]');
  const prev = $('[data-rail-prev]');
  const next = $('[data-rail-next]');
  const step = () => (rail.firstElementChild?.getBoundingClientRect().width || 300) + 22;
  prev.addEventListener('click', () => rail.scrollBy({ left: -step() * 2, behavior: 'smooth' }));
  next.addEventListener('click', () => rail.scrollBy({ left: step() * 2, behavior: 'smooth' }));
  const updateRail = () => {
    prev.disabled = rail.scrollLeft < 8;
    next.disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 8;
  };
  rail.addEventListener('scroll', updateRail, { passive: true });
  window.addEventListener('resize', updateRail);
  updateRail();

  /* ---------- Menu tabs ---------- */
  const tabs = $$('[data-tabs] [role="tab"]');
  const empty = $('[data-empty]');
  let filter = 'all';

  const activePanel = () => $(`#${tabs.find((t) => t.getAttribute('aria-selected') === 'true').getAttribute('aria-controls')}`);

  const selectTab = (tab, focus = false) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      $(`#${t.getAttribute('aria-controls')}`).hidden = !on;
    });
    if (focus) tab.focus();
    tab.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    applyFilter();
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', (e) => {
      const keys = { ArrowRight: 1, ArrowLeft: -1 };
      if (e.key in keys) { e.preventDefault(); selectTab(tabs[(i + keys[e.key] + tabs.length) % tabs.length], true); }
      if (e.key === 'Home') { e.preventDefault(); selectTab(tabs[0], true); }
      if (e.key === 'End') { e.preventDefault(); selectTab(tabs[tabs.length - 1], true); }
    });
  });

  /* ---------- Dietary filter ---------- */
  const matches = (item) => {
    if (filter === 'all') return true;
    const diet = (item.dataset.diet || '').split(/\s+/);
    return diet.includes(filter) || diet.includes(`${filter}o`);
  };

  function applyFilter() {
    const panel = activePanel();
    let shown = 0;
    $$('.item', panel).forEach((item) => {
      // drinks aren't tagged, so leave them alone
      const ok = item.classList.contains('item-drink') || matches(item);
      item.hidden = !ok;
      if (ok) shown++;
    });
    // hide group headings whose list is now empty
    $$('.group-title', panel).forEach((h) => {
      const list = h.nextElementSibling;
      if (list?.classList.contains('items')) h.hidden = !$$('.item:not([hidden])', list).length;
    });
    empty.hidden = shown > 0;
  }

  $$('[data-filter]').forEach((chip) => chip.addEventListener('click', () => {
    filter = chip.dataset.filter;
    $$('[data-filter]').forEach((c) => {
      const on = c === chip;
      c.classList.toggle('is-on', on);
      c.setAttribute('aria-pressed', String(on));
    });
    applyFilter();
  }));

  /* ---------- FAQ: one open at a time ---------- */
  const faqs = $$('.faq-list details');
  faqs.forEach((d) => d.addEventListener('toggle', () => {
    if (d.open) faqs.forEach((o) => { if (o !== d) o.open = false; });
  }));

  /* ---------- Reveal on scroll ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    reveals.forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 70}ms`; io.observe(el); });
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Footer year ---------- */
  $('[data-year]').textContent = new Date().getFullYear();
})();
