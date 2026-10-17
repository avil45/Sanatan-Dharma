/* श्री रामलीला महोत्सव — बस्ती · interactions */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };

  /* Event constants (IST) */
  var START = new Date('2026-11-12T18:30:00+05:30');
  var END = new Date('2026-11-21T22:30:00+05:30');
  var VENUE = 'सक्सेरिया इंटर कॉलेज, बस्ती';

  /* Preloader */
  var pre = $('.preloader');
  function hidePre() { if (pre) pre.classList.add('done'); }
  window.addEventListener('load', function () { setTimeout(hidePre, reduce ? 0 : 450); });
  setTimeout(hidePre, 2500);

  /* Header, progress, menu */
  var header = $('.site-header'), bar = $('.progress i');
  function onScroll() {
    var y = window.scrollY || root.scrollTop;
    if (header) header.classList.toggle('scrolled', y > 24);
    if (bar) {
      var h = root.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(y / h, 1) : 0) + ')';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var toggle = $('.menu-toggle'), nav = $('.nav');
  function setMenu(open) {
    d.body.classList.toggle('menu-open', open);
    if (toggle) { toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-label', open ? 'मेन्यू बंद करें' : 'मेन्यू खोलें'); }
  }
  if (toggle) toggle.addEventListener('click', function () { setMenu(!d.body.classList.contains('menu-open')); });
  $$('.nav a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMenu(false); closeLightbox(); } });

  /* Reveal on scroll */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: .14, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else reveals.forEach(function (el) { el.classList.add('is-in'); });

  /* Counters */
  var counters = $$('[data-count]');
  function runCount(el) {
    var to = +el.getAttribute('data-count'), t0 = null, dur = 1600;
    if (reduce) { el.textContent = to; return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); } });
    }, { threshold: .6 });
    counters.forEach(function (c) { cio.observe(c); });
  } else counters.forEach(function (c) { c.textContent = c.getAttribute('data-count'); });

  /* Countdown */
  $$('[data-countdown]').forEach(function (box) {
    var els = { d: $('[data-u=d]', box), h: $('[data-u=h]', box), m: $('[data-u=m]', box), s: $('[data-u=s]', box) };
    var msg = $('.countdown-msg', box), label = $('.countdown-label span', box);
    function pad(n) { return n < 10 ? '0' + n : '' + n; }
    function tick() {
      var now = new Date(), diff = START - now;
      box.classList.remove('is-live', 'is-over');
      if (now > END) {
        box.classList.add('is-over');
        msg.textContent = '॥ महोत्सव सम्पन्न हुआ — आप सभी का हृदय से आभार ॥';
        if (label) label.textContent = 'श्री रामलीला महोत्सव 2026';
        return;
      }
      if (diff <= 0) {
        box.classList.add('is-live');
        msg.textContent = '॥ महोत्सव चल रहा है — आज सायं 6:30 बजे से पधारें ॥';
        if (label) label.textContent = 'श्री रामलीला महोत्सव';
        return;
      }
      var s = Math.floor(diff / 1000);
      els.d.textContent = Math.floor(s / 86400);
      els.h.textContent = pad(Math.floor(s % 86400 / 3600));
      els.m.textContent = pad(Math.floor(s % 3600 / 60));
      els.s.textContent = pad(s % 60);
    }
    tick(); setInterval(tick, 1000);
  });

  /* Highlight today in the day strip */
  var today = new Date();
  $$('.day[data-date]').forEach(function (el) {
    var dt = new Date(el.getAttribute('data-date') + 'T23:59:59+05:30');
    var start = new Date(el.getAttribute('data-date') + 'T00:00:00+05:30');
    if (today >= start && today <= dt) { el.classList.add('is-today'); el.querySelector('span').textContent = 'आज'; }
    else if (today > dt) el.classList.add('is-past');
  });

  /* Embers canvas */
  $$('canvas[data-embers]').forEach(function (cv) {
    if (reduce) return;
    var ctx = cv.getContext('2d'), W, H, dpr, ps = [], run = true, parent = cv.parentElement;
    function size() {
      var phone = window.innerWidth < 820; dpr = Math.min(window.devicePixelRatio || 1, phone ? 1.5 : 2);
      W = parent.clientWidth; H = parent.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(W * H / (phone ? 26000 : 14000), phone ? 26 : 70)); ps = [];
      for (var i = 0; i < n; i++) ps.push(spawn(true));
    }
    function spawn(init) {
      return { x: Math.random() * W, y: init ? Math.random() * H : H + 10, r: Math.random() * 2.2 + .6,
        v: Math.random() * .5 + .18, dx: (Math.random() - .5) * .3, ph: Math.random() * 6.28, a: Math.random() * .6 + .25,
        hue: Math.random() > .35 ? 38 : 24 };
    }
    function frame() {
      if (!run) return;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < ps.length; i++) {
        var p = ps[i]; p.y -= p.v; p.ph += .02; p.x += p.dx + Math.sin(p.ph) * .25;
        if (p.y < -12) ps[i] = spawn(false);
        var fade = Math.min(1, Math.max(0, p.y / (H * .35))) * p.a;
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
        g.addColorStop(0, 'hsla(' + p.hue + ',95%,68%,' + fade + ')');
        g.addColorStop(1, 'hsla(' + p.hue + ',95%,55%,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 5, 0, 6.283); ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    size(); window.addEventListener('resize', size);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        var vis = es[0].isIntersecting;
        if (vis && !run) { run = true; frame(); } else if (!vis) run = false;
      }).observe(parent);
    }
    frame();
  });

  /* Poster tilt */
  var arch = $('[data-tilt]');
  if (arch && !reduce && window.matchMedia('(hover:hover)').matches) {
    var zone = arch.parentElement;
    zone.addEventListener('mousemove', function (e) {
      var r = zone.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      arch.style.transform = 'rotateY(' + (x * 12) + 'deg) rotateX(' + (-y * 10) + 'deg)';
    });
    zone.addEventListener('mouseleave', function () { arch.style.transform = ''; });
  }

  /* Purpose-card spotlight */
  $$('.purpose-card').forEach(function (c) {
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* Toast + copy */
  var toast = $('.toast'), tt;
  function showToast(t) {
    if (!toast) return; toast.textContent = t; toast.classList.add('show');
    clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }
  function fallbackCopy(v) {
    var ta = d.createElement('textarea'); ta.value = v; ta.style.position = 'fixed'; ta.style.opacity = '0';
    d.body.appendChild(ta); ta.select(); var ok = false; try { ok = d.execCommand('copy'); } catch (e) {} d.body.removeChild(ta); return ok;
  }
  $$('[data-copy]').forEach(function (b) {
    var orig = b.innerHTML;
    b.addEventListener('click', function () {
      var v = b.getAttribute('data-copy');
      var done = function (ok) {
        if (!ok) { window.prompt('कॉपी करने के लिए टेक्स्ट चुनें:', v); return; }
        b.classList.add('ok'); b.textContent = 'कॉपी हुआ ✓'; showToast('कॉपी हो गया: ' + v);
        setTimeout(function () { b.classList.remove('ok'); b.innerHTML = orig; }, 1800);
      };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(v).then(function () { done(true); }, function () { done(fallbackCopy(v)); });
      else done(fallbackCopy(v));
    });
  });

  /* Lightbox */
  var lb = $('.lightbox'), lbImg = lb && $('img', lb);
  function closeLightbox() { if (lb) lb.classList.remove('open'); }
  $$('[data-zoom]').forEach(function (el) {
    el.addEventListener('click', function () {
      var img = el.tagName === 'IMG' ? el : $('img', el);
      if (!lb || !img) return; lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt; lb.classList.add('open');
    });
  });
  if (lb) lb.addEventListener('click', function (e) { if (e.target === lb || e.target.tagName === 'BUTTON') closeLightbox(); });

  /* Share invitation */
  $$('[data-share]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault();
      var url = location.href.split('#')[0].replace(/(sahyog|index)\.html.*$/, 'mahotsav.html');
      var text = '🙏 जय श्री राम 🙏\nसनातन धर्म संस्था, बस्ती द्वारा आयोजित श्री रामलीला महोत्सव\n📅 12–21 नवम्बर 2026\n📍 ' + VENUE + '\n🕡 सायं 6:30 से रात्रि 10:30 बजे तक\nसपरिवार पधारें।';
      if (navigator.share && /^https?:/.test(url)) navigator.share({ title: 'श्री रामलीला महोत्सव — बस्ती', text: text, url: url }).catch(function () {});
      else window.open('https://wa.me/?text=' + encodeURIComponent(text + (/^https?:/.test(url) ? '\n' + url : '')), '_blank', 'noopener');
    });
  });

  /* Add to calendar (.ics, daily 18:30–22:30 IST for 10 days) */
  $$('[data-ics]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault();
      var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Sanatan Dharm Sanstha Basti//Ramleela 2026//HI', 'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT', 'UID:ramleela-basti-2026@sanatandharmsanstha', 'DTSTAMP:20261017T000000Z',
        'DTSTART;TZID=Asia/Kolkata:20261112T183000', 'DTEND;TZID=Asia/Kolkata:20261112T223000', 'RRULE:FREQ=DAILY;COUNT=10',
        'SUMMARY:श्री रामलीला महोत्सव — बस्ती', 'LOCATION:' + VENUE,
        'DESCRIPTION:सनातन धर्म संस्था\\, बस्ती द्वारा आयोजित श्री रामलीला महोत्सव। सपरिवार पधारें।',
        'BEGIN:VALARM', 'TRIGGER:-PT90M', 'ACTION:DISPLAY', 'DESCRIPTION:श्री रामलीला महोत्सव आज सायं 6:30 बजे', 'END:VALARM',
        'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
      var blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' }), a = d.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'shri-ramleela-mahotsav-2026.ics'; d.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500); showToast('कैलेंडर फ़ाइल डाउनलोड हो रही है');
    });
  });
})();
