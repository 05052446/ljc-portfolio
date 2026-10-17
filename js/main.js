/**
 * 李减除 个人网站交互主控脚本
 * 包含：液态流光按钮、无闪白主题系统、原生模态弹窗、GPU进度条与 3D 粒子联动
 */
(function () {
  'use strict';

  // 1. 初始化 Lucide 图标
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  // 2. 主题切换体系 (无闪白 + 自定义事件通知)
  const themeBtn = document.getElementById('theme-btn');
  const themeColorMeta = document.getElementById('theme-color');

  function updateThemeUI(theme, withAnimation = false) {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('jianchu-theme', theme);
    } catch (e) {}

    if (themeColorMeta) {
      themeColorMeta.content = theme === 'dark' ? '#111416' : '#fafafa';
    }

    if (themeBtn) {
      const label = theme === 'dark' ? '切换为浅色模式' : '切换为深色模式';
      themeBtn.setAttribute('aria-label', label);
      themeBtn.setAttribute('title', label);

      if (withAnimation) {
        themeBtn.classList.remove('theme-animating');
        void themeBtn.offsetWidth; // 触发回流重新执行 360 度转动
        themeBtn.classList.add('theme-animating');
        setTimeout(() => themeBtn.classList.remove('theme-animating'), 550);
      }
    }

    // 广播全局事件，通知 3D 粒子等模块更新
    window.dispatchEvent(new Event('themechange'));
  }

  let savedTheme = 'dark';
  try {
    savedTheme = localStorage.getItem('jianchu-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  } catch (e) {}
  updateThemeUI(savedTheme, false);

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      updateThemeUI(current, true);
    });
  }

  // 3. 液态流光磁性按钮（Liquid Magnetic Buttons 渐进增强）
  function initLiquidButtons() {
    // 匹配带有 .liquid-button 的按钮
    const buttons = document.querySelectorAll('.liquid-button');
    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    buttons.forEach((btn) => {
      // 动态注入反光层与表面层
      if (!btn.querySelector('.liquid-surface')) {
        const content = btn.innerHTML;
        btn.innerHTML = `
          <i class="liquid-surface" aria-hidden="true"></i>
          <i class="liquid-light" aria-hidden="true"></i>
          <span class="liquid-content">${content}</span>
        `;
      }

      if (!isFinePointer || isReducedMotion) return;

      let rAF = 0;
      let targetX = 0;
      let targetY = 0;
      let currentX = 0;
      let currentY = 0;

      function updateLiquidStyle() {
        rAF = 0;
        currentX += (targetX - currentX) * 0.25;
        currentY += (targetY - currentY) * 0.25;

        const lx = currentX * 100;
        const ly = currentY * 100;
        const tiltX = (0.5 - currentY) * 6;
        const tiltY = (currentX - 0.5) * 8;
        const moveX = (currentX - 0.5) * 5;
        const moveY = (currentY - 0.5) * 3;
        const angle = 115 + (currentX - 0.5) * 70;

        btn.style.setProperty('--lx', `${lx.toFixed(1)}%`);
        btn.style.setProperty('--ly', `${ly.toFixed(1)}%`);
        btn.style.setProperty('--liquid-x', `${moveX.toFixed(2)}px`);
        btn.style.setProperty('--liquid-y', `${moveY.toFixed(2)}px`);
        btn.style.setProperty('--liquid-rx', `${tiltX.toFixed(2)}deg`);
        btn.style.setProperty('--liquid-ry', `${tiltY.toFixed(2)}deg`);
        btn.style.setProperty('--liquid-angle', `${angle.toFixed(1)}deg`);

        if (Math.abs(targetX - currentX) > 0.005 || Math.abs(targetY - currentY) > 0.005) {
          rAF = requestAnimationFrame(updateLiquidStyle);
        }
      }

      btn.addEventListener('pointerenter', (e) => {
        const rect = btn.getBoundingClientRect();
        targetX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        targetY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
        currentX = targetX;
        currentY = targetY;
        btn.classList.add('is-liquid-hover');
        if (!rAF) rAF = requestAnimationFrame(updateLiquidStyle);
      });

      btn.addEventListener('pointermove', (e) => {
        const rect = btn.getBoundingClientRect();
        targetX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        targetY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
        if (!rAF) rAF = requestAnimationFrame(updateLiquidStyle);
      }, { passive: true });

      btn.addEventListener('pointerleave', () => {
        btn.classList.remove('is-liquid-hover');
        targetX = 0.5;
        targetY = 0.5;
        if (!rAF) rAF = requestAnimationFrame(updateLiquidStyle);
      });
    });
  }
  initLiquidButtons();

  // 4. 原生 HTML5 模态弹窗系统 (<dialog>)
  const dialog = document.getElementById('contact-dialog');
  const openNavBtn = document.getElementById('open-contact-nav');
  const openHeroBtn = document.getElementById('open-contact-hero');
  const openSecBtn = document.getElementById('open-contact-btn');
  const closeDialogBtn = document.getElementById('close-dialog-btn');
  const copyBtn = document.getElementById('copy-btn');
  const copyStatus = document.getElementById('copy-status');
  const wechatVal = document.getElementById('wechat-val');
  let lastActiveElement = null;

  function openDialog(triggerEl) {
    if (!dialog || dialog.open) return;
    lastActiveElement = triggerEl || document.activeElement;
    dialog.showModal();
    document.body.classList.add('contact-open');
    if (copyBtn) copyBtn.focus();
  }

  function closeDialog() {
    if (!dialog || !dialog.open) return;
    dialog.close();
  }

  if (dialog) {
    dialog.addEventListener('close', () => {
      document.body.classList.remove('contact-open');
      if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
        lastActiveElement.focus({ preventScroll: true });
      }
    });

    // 背景遮罩边界盒点击检测
    dialog.addEventListener('click', (e) => {
      const rect = dialog.getBoundingClientRect();
      const isOutside = (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      );
      if (isOutside) {
        closeDialog();
      }
    });
  }

  [openNavBtn, openHeroBtn, openSecBtn].forEach((btn) => {
    if (btn) {
      btn.addEventListener('click', (e) => openDialog(btn));
    }
  });

  if (closeDialogBtn) {
    closeDialogBtn.addEventListener('click', closeDialog);
  }

  // 5. 微信号复制 + 唤醒微信 App (weixin:// URL scheme) + 二维码抽屉
  const qrToggleBtn = document.getElementById('qr-toggle-btn');
  const qrContainer = document.getElementById('wechat-qrcode-container');

  if (qrToggleBtn && qrContainer) {
    qrToggleBtn.addEventListener('click', () => {
      qrContainer.classList.toggle('hidden');
    });
  }

  if (copyBtn && wechatVal) {
    copyBtn.addEventListener('click', async () => {
      if (copyBtn.disabled) return;
      copyBtn.disabled = true;
      const text = wechatVal.innerText.trim();
      let success = false;

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
          success = true;
        }
      } catch (err) {}

      if (!success) {
        const tempInput = document.createElement('input');
        tempInput.value = text;
        document.body.appendChild(tempInput);
        tempInput.select();
        try {
          success = document.execCommand('copy');
        } catch (e) {}
        document.body.removeChild(tempInput);
      }

      const label = copyBtn.querySelector('.liquid-content') || copyBtn;
      const originalText = label.innerText;

      if (success) {
        label.innerText = '已复制 · 正在打开微信...';
        if (copyStatus) {
          copyStatus.innerText = '✓ 微信号已复制！若未跳转，请打开微信在「添加朋友」中粘贴搜索。';
        }

        // 唤醒本地或移动端微信应用
        const isWeChatInApp = /MicroMessenger/i.test(navigator.userAgent);
        if (!isWeChatInApp) {
          setTimeout(() => {
            try {
              window.location.assign('weixin://');
            } catch (e) {}
          }, 350);
        }

        setTimeout(() => {
          label.innerText = originalText;
          if (copyStatus) copyStatus.innerText = '点击复制微信号，前往微信交个朋友。';
          copyBtn.disabled = false;
        }, 3600);
      } else {
        if (copyStatus) copyStatus.innerText = '请手动长按复制：' + text;
        copyBtn.disabled = false;
      }
    });
  }

  // 6. GPU 加速滚动阅读进度条与吸顶导航
  const progressBar = document.getElementById('progress-bar');
  const headerEl = document.querySelector('.header');
  let isTicking = false;

  function onScroll() {
    const scrollY = window.scrollY || window.pageYOffset;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const progress = total > 0 ? Math.min(Math.max(scrollY / total, 0), 1) : 0;

    // GPU 合成层 transform scaleX
    if (progressBar) {
      progressBar.style.transform = `scaleX(${progress})`;
    }

    // Header 磨砂背景切换
    if (headerEl) {
      if (scrollY > 50) {
        headerEl.classList.add('scrolled');
      } else {
        headerEl.classList.remove('scrolled');
      }
    }

    isTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!isTicking) {
      requestAnimationFrame(onScroll);
      isTicking = true;
    }
  }, { passive: true });
  onScroll();

  // 7. 视口入场渐显 (IntersectionObserver)
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('is-visible'));
  }

  // 8. 启动 WebGL 3D 宇宙粒子系统
  let universeInstance = null;
  const universeCanvas = document.querySelector('#universe-canvas');

  if (universeCanvas && typeof window.initUniverse === 'function') {
    universeInstance = window.initUniverse({
      canvas: universeCanvas
    });
  }

  // 8.1 粒子复原/重播按钮交互 (爆散重聚 + 图标旋转)
  const btnReplay = document.getElementById('btn-replay');
  if (btnReplay) {
    btnReplay.addEventListener('pointerdown', (e) => e.stopPropagation());
    btnReplay.addEventListener('mousedown', (e) => e.stopPropagation());
    btnReplay.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      // 旋转动效
      btnReplay.classList.remove('is-spinning');
      void btnReplay.offsetWidth;
      btnReplay.classList.add('is-spinning');
      setTimeout(() => btnReplay.classList.remove('is-spinning'), 650);

      // 调用 WebGL 粒子系统复位重播
      if (universeInstance && typeof universeInstance.replay === 'function') {
        universeInstance.replay();
      } else if (window.__universeInstance && typeof window.__universeInstance.replay === 'function') {
        window.__universeInstance.replay();
      }
    });
  }

  // 9. 毛笔专属光标控制器 (Chinese Calligraphy Brush Controller)
  function initBrushCursor() {
    const cursor = document.getElementById('brush-cursor');
    if (!cursor || window.matchMedia('(hover: none)').matches) return;

    let mouseX = -100;
    let mouseY = -100;
    let currentX = -100;
    let currentY = -100;
    let isVisible = false;

    window.addEventListener('pointermove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) {
        isVisible = true;
        cursor.classList.add('is-active');
      }
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      cursor.classList.remove('is-active');
      isVisible = false;
    });

    window.addEventListener('pointerdown', () => {
      cursor.classList.add('is-pressing');
    });

    window.addEventListener('pointerup', () => {
      cursor.classList.remove('is-pressing');
    });

    // 交互悬停反馈
    const interactives = 'a, button, input, textarea, select, .liquid-button, .theme-toggle, .visual-btn, .star-interaction';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactives)) {
        cursor.classList.add('is-hovering');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactives)) {
        cursor.classList.remove('is-hovering');
      }
    });

    // 60-120fps GPU 丝滑硬件加速跟随
    function renderCursor() {
      if (isVisible) {
        currentX += (mouseX - currentX) * 0.75;
        currentY += (mouseY - currentY) * 0.75;
        // 笔尖 (7, 52) 严密对齐鼠标真实点击像素，笔杆在右上方
        cursor.style.transform = `translate3d(${currentX - 7}px, ${currentY - 52}px, 0)`;
      }
      requestAnimationFrame(renderCursor);
    }
    renderCursor();
  }
  initBrushCursor();

})();
