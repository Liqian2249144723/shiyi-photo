/* ============================================================
   拾忆相馆 —— 交互脚本
   ------------------------------------------------------------
   依赖 js/layout.js 已注入共享布局（导航 / 页脚 / 悬浮客服），
   因此必须在该文件之后以普通同步 script 引入。
   所有模块都对缺失元素做了兜底，任一模块失效不影响其余模块。
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  /* ---------- 导航：滚动加底色 ---------- */
  var nav = document.getElementById("nav");
  if (nav) {
    var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 30); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 移动端菜单 ---------- */
  var burger = document.getElementById("burger");
  var navLinks = document.getElementById("navLinks");

  if (burger && navLinks) {
    var setMenu = function (open) {
      navLinks.classList.toggle("open", open);
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
      // 菜单是全屏遮罩，展开时锁定页面滚动
      document.body.classList.toggle("menu-open", open);
    };

    burger.addEventListener("click", function () {
      setMenu(!navLinks.classList.contains("open"));
    });

    $$("a", navLinks).forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navLinks.classList.contains("open")) setMenu(false);
    });
  }

  /* ---------- 修复前后对比滑块 ---------- */
  $$(".comparison").forEach(function (box) {
    var dragging = false;
    var pos = 50; // 当前百分比位置

    var setPos = function (value) {
      pos = Math.max(2, Math.min(98, value));
      box.style.setProperty("--pos", pos + "%");
      box.setAttribute("aria-valuenow", String(Math.round(pos)));
    };

    var setPosFromX = function (clientX) {
      var rect = box.getBoundingClientRect();
      setPos(((clientX - rect.left) / rect.width) * 100);
    };

    box.addEventListener("pointerdown", function (e) {
      dragging = true;
      if (box.setPointerCapture) box.setPointerCapture(e.pointerId);
      setPosFromX(e.clientX);
    });
    box.addEventListener("pointermove", function (e) {
      if (dragging) setPosFromX(e.clientX);
    });
    var stopDrag = function () { dragging = false; };
    box.addEventListener("pointerup", stopDrag);
    box.addEventListener("pointercancel", stopDrag);

    // 键盘与读屏可达性
    box.tabIndex = 0;
    box.setAttribute("role", "slider");
    box.setAttribute("aria-label", "修复前后对比，使用左右方向键调整");
    box.setAttribute("aria-valuemin", "0");
    box.setAttribute("aria-valuemax", "100");
    setPos(50);

    box.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { setPos(pos - 4); e.preventDefault(); }
      else if (e.key === "ArrowRight") { setPos(pos + 4); e.preventDefault(); }
      else if (e.key === "Home") { setPos(2); e.preventDefault(); }
      else if (e.key === "End") { setPos(98); e.preventDefault(); }
    });
  });

  /* ---------- 滚动显现 ---------- */
  var reveals = $$(".reveal");
  if (reveals.length && "IntersectionObserver" in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }
    );
    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    // 不支持 IntersectionObserver 或用户要求减弱动效：直接显示
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- 数字滚动 ---------- */
  var animateCounter = function (el) {
    var target = Number(el.dataset.target) || 0;
    if (reduceMotion) {
      el.textContent = target.toLocaleString("zh-CN");
      return;
    }
    var duration = 1500;
    var start = performance.now();

    var tick = function (now) {
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString("zh-CN");
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  var counters = $$(".counter");
  if (counters.length && "IntersectionObserver" in window) {
    var counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (el) { counterObserver.observe(el); });
  } else {
    counters.forEach(animateCounter);
  }

  /* ---------- 下载按钮：安装包上线前给出友好提示 ----------
     上线真实安装包后，把 download.html 中按钮 href 改为真实地址，
     并移除其 .dl-trigger class，以下拦截即不再生效。 */
  var toast = document.getElementById("toast");
  var toastTimer = null;

  var showToast = function (msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 3200);
  };

  $$(".dl-trigger").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      showToast("加微信 shiyi-photo 获取 " + btn.dataset.platform + " 安装包");
    });
  });

  /* ---------- 悬浮客服 ---------- */
  var fwToggle = document.getElementById("fwToggle");
  var fwClose = document.getElementById("fwClose");
  var fwPanel = document.getElementById("fwPanel");
  var floatWidget = document.getElementById("floatWidget");

  if (fwToggle && fwPanel) {
    var setPanel = function (open) {
      fwPanel.hidden = !open;
      fwToggle.setAttribute("aria-expanded", String(open));
    };

    fwToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      setPanel(fwPanel.hidden);
    });
    if (fwClose) fwClose.addEventListener("click", function () { setPanel(false); });

    document.addEventListener("click", function (e) {
      if (!fwPanel.hidden && floatWidget && !floatWidget.contains(e.target)) setPanel(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !fwPanel.hidden) setPanel(false);
    });
  }
})();
