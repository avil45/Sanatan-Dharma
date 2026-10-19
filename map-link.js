/* रामायण नक्शा: मेन्यू में लिंक + नीचे तैरता बटन। main.js के आख़िर में चिपका दें (या अलग फ़ाइल रखकर हर पेज पर जोड़ें)। */
(function () {
  var URL = "ramayan-map.html", TXT = "रामायण नक्शा";
  if (/ramayan-map/.test(location.pathname)) return;

  /* 1) मेन्यू में "लाइव एवं लीला" के बाद नया लिंक */
  function addNav() {
    var as = document.querySelectorAll('#hdr a[href$="live.html"], header a[href$="live.html"], nav a[href$="live.html"]');
    var done = false;
    as.forEach(function (a) {
      if (a.closest("#ftr, footer") || a.hasAttribute("data-mapnav")) return;
      var box = a.closest("li") || a;
      if (box.nextElementSibling && box.nextElementSibling.hasAttribute("data-mapnav")) { done = true; return; }
      var n = box.cloneNode(true);
      var l = n.tagName === "A" ? n : n.querySelector("a");
      if (!l) return;
      l.setAttribute("href", URL);
      l.textContent = TXT;
      ["on", "active", "act", "current", "is-active"].forEach(function (c) { l.classList.remove(c); });
      l.removeAttribute("aria-current");
      n.setAttribute("data-mapnav", "");
      if (n !== l) l.setAttribute("data-mapnav", "");
      box.parentNode.insertBefore(n, box.nextSibling);
      done = true;
    });
    return done;
  }

  /* 2) हर पेज पर नीचे-बाएँ तैरता बटन */
  function addFab() {
    if (document.getElementById("mapfab")) return;
    try { if (sessionStorage.getItem("mapfabX")) return; } catch (e) {}
    var st = document.createElement("style");
    st.textContent =
      "#mapfab{position:fixed;left:max(12px,env(safe-area-inset-left));bottom:max(14px,env(safe-area-inset-bottom));z-index:9000;display:flex;align-items:center;gap:2px;border-radius:999px;background:linear-gradient(135deg,#f3d98b,#e0a92c);box-shadow:0 6px 22px rgba(0,0,0,.5);font-family:Hind,sans-serif}" +
      "#mapfab a{color:#3a0a0a;text-decoration:none;font-weight:700;font-size:.92rem;padding:10px 6px 10px 16px;white-space:nowrap}" +
      "#mapfab button{border:0;background:none;color:#3a0a0a;font-size:1.1rem;line-height:1;padding:10px 12px 10px 4px;cursor:pointer;opacity:.7}" +
      "@media(max-width:420px){#mapfab a{font-size:.85rem;padding-left:13px}}";
    document.head.appendChild(st);
    var f = document.createElement("div");
    f.id = "mapfab";
    f.innerHTML = '<a href="' + URL + '">🗺️ रामायण का नक्शा</a><button type="button" aria-label="बंद करें">×</button>';
    f.querySelector("button").onclick = function () {
      f.remove();
      try { sessionStorage.setItem("mapfabX", "1"); } catch (e) {}
    };
    document.body.appendChild(f);
  }

  function init() {
    addFab();
    if (addNav()) return;
    /* हेडर देर से बने तो 10 सेकंड तक देखते रहो */
    var mo = new MutationObserver(function () { if (addNav()) mo.disconnect(); });
    mo.observe(document.body, { childList: true, subtree: true });
    setTimeout(function () { mo.disconnect(); }, 10000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
