/**
 * 粒子美学双模式实时调参台 (Debug HUD)
 * 完美支持【白天/黑夜】双套专属配置独立调校与记忆
 * 支持一键导出双模式完整配置
 */
(function () {
  'use strict';

  // 黄金双模式初始配置 (由您实测提取的最佳效果)
  const PRESETS = {
    day: {
      count: 11800,
      size: 2.4,
      alpha: 0.68,
      sharpness: 0.76,
      disperse: 3.8
    },
    night: {
      count: 11800,
      size: 4.2,
      alpha: 0.68,
      sharpness: 0.76,
      disperse: 3.8
    }
  };

  function getCurrentMode() {
    return document.documentElement.dataset.theme === 'dark' ? 'night' : 'day';
  }

  function createHUD() {
    // 注入 HUD 专属样式
    const style = document.createElement('style');
    style.id = 'universe-debug-style';
    style.textContent = `
      #universe-debug-hud {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 99999;
        width: 326px;
        background: rgba(18, 20, 24, 0.90);
        border: 1px solid rgba(255, 255, 255, 0.16);
        border-radius: 16px;
        box-shadow: 0 16px 45px rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        color: #f0f2f5;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 13px;
        padding: 16px;
        box-sizing: border-box;
        user-select: none;
        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
      }
      #universe-debug-hud.minimized {
        transform: translateY(20px) scale(0.9);
        opacity: 0;
        pointer-events: none;
      }
      #universe-debug-toggle {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 99998;
        padding: 10px 18px;
        background: rgba(18, 20, 24, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 30px;
        color: #f0f2f5;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        backdrop-filter: blur(14px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
        display: none;
        align-items: center;
        gap: 6px;
        transition: transform 0.2s, background 0.2s;
      }
      #universe-debug-toggle:hover {
        transform: scale(1.05);
        background: rgba(30, 34, 40, 0.95);
      }
      #universe-debug-toggle.visible {
        display: flex;
      }
      .hud-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        padding-bottom: 10px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      .hud-title-wrap {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .hud-title {
        font-weight: 700;
        font-size: 13.5px;
        color: #ffffff;
      }
      .hud-mode-pill {
        font-size: 11px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .hud-mode-pill.day {
        background: rgba(251, 191, 36, 0.2);
        color: #fbbf24;
        border: 1px solid rgba(251, 191, 36, 0.35);
      }
      .hud-mode-pill.night {
        background: rgba(129, 140, 248, 0.2);
        color: #a5b4fc;
        border: 1px solid rgba(129, 140, 248, 0.35);
      }
      .hud-close-btn {
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.55);
        font-size: 16px;
        cursor: pointer;
        padding: 2px 6px;
        border-radius: 6px;
        line-height: 1;
        transition: color 0.2s, background 0.2s;
      }
      .hud-close-btn:hover {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.12);
      }
      .hud-item {
        margin-bottom: 11px;
      }
      .hud-label-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.78);
      }
      .hud-val {
        font-family: monospace;
        font-size: 12px;
        font-weight: 700;
        color: #d4a373;
        background: rgba(212, 163, 115, 0.12);
        padding: 1px 6px;
        border-radius: 4px;
      }
      .hud-slider {
        width: 100%;
        height: 5px;
        -webkit-appearance: none;
        background: rgba(255, 255, 255, 0.15);
        border-radius: 3px;
        outline: none;
        transition: background 0.2s;
      }
      .hud-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 15px;
        height: 15px;
        border-radius: 50%;
        background: #d4a373;
        cursor: pointer;
        box-shadow: 0 0 8px rgba(212, 163, 115, 0.6);
        transition: transform 0.15s;
      }
      .hud-slider::-webkit-slider-thumb:hover {
        transform: scale(1.2);
      }
      .hud-actions {
        display: flex;
        gap: 8px;
        margin-top: 15px;
      }
      .hud-btn {
        flex: 1;
        padding: 9px 12px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        transition: all 0.2s ease;
      }
      .hud-btn-primary {
        background: #d4a373;
        color: #121418;
        border: none;
      }
      .hud-btn-primary:hover {
        background: #e2b485;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(212, 163, 115, 0.4);
      }
      .hud-btn-primary.copied {
        background: #10b981;
        color: #ffffff;
      }
      .hud-btn-secondary {
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.12);
        max-width: 75px;
      }
      .hud-btn-secondary:hover {
        background: rgba(255, 255, 255, 0.15);
        color: #ffffff;
      }
    `;
    document.head.appendChild(style);

    let activeMode = getCurrentMode();

    // 调参面板主体 HTML
    const hud = document.createElement('div');
    hud.id = 'universe-debug-hud';
    hud.innerHTML = `
      <div class="hud-header">
        <div class="hud-title-wrap">
          <div class="hud-title">🛠️ 粒子调参台</div>
          <span class="hud-mode-pill ${activeMode}" id="hud-mode-pill" title="点击可联动切换主题">
            ${activeMode === 'day' ? '☀️ 白天配置' : '🌙 黑夜配置'}
          </span>
        </div>
        <button class="hud-close-btn" id="hud-close-btn" title="收起面板">✕</button>
      </div>

      <div class="hud-item">
        <div class="hud-label-row">
          <span>颗粒总数 (Count)</span>
          <span class="hud-val" id="val-count">${PRESETS[activeMode].count}</span>
        </div>
        <input class="hud-slider" type="range" id="slider-count" min="4000" max="16000" step="200" value="${PRESETS[activeMode].count}">
      </div>

      <div class="hud-item">
        <div class="hud-label-row">
          <span>微粒大小 (Size)</span>
          <span class="hud-val" id="val-size">${PRESETS[activeMode].size}</span>
        </div>
        <input class="hud-slider" type="range" id="slider-size" min="1.0" max="8.0" step="0.1" value="${PRESETS[activeMode].size}">
      </div>

      <div class="hud-item">
        <div class="hud-label-row">
          <span>墨迹浓淡 (Alpha)</span>
          <span class="hud-val" id="val-alpha">${PRESETS[activeMode].alpha}</span>
        </div>
        <input class="hud-slider" type="range" id="slider-alpha" min="0.40" max="1.00" step="0.02" value="${PRESETS[activeMode].alpha}">
      </div>

      <div class="hud-item">
        <div class="hud-label-row">
          <span>边缘锐度 (Sharpness)</span>
          <span class="hud-val" id="val-sharpness">${PRESETS[activeMode].sharpness}</span>
        </div>
        <input class="hud-slider" type="range" id="slider-sharpness" min="0.00" max="1.00" step="0.02" value="${PRESETS[activeMode].sharpness}">
      </div>

      <div class="hud-item">
        <div class="hud-label-row">
          <span>散开阻尼 (Disperse)</span>
          <span class="hud-val" id="val-disperse">${PRESETS[activeMode].disperse}</span>
        </div>
        <input class="hud-slider" type="range" id="slider-disperse" min="1.0" max="4.0" step="0.1" value="${PRESETS[activeMode].disperse}">
      </div>

      <div class="hud-actions">
        <button class="hud-btn hud-btn-secondary" id="hud-reset-btn" title="重置当前模式为黄金预设">重置</button>
        <button class="hud-btn hud-btn-primary" id="hud-copy-btn">📋 复制当前配置</button>
      </div>
    `;

    // 唤起胶囊按钮
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'universe-debug-toggle';
    toggleBtn.innerHTML = `⚙️ 调参台`;

    document.body.appendChild(hud);
    document.body.appendChild(toggleBtn);

    // 获取 DOM 元素
    const modePill = hud.querySelector('#hud-mode-pill');
    const sliderCount = hud.querySelector('#slider-count');
    const sliderSize = hud.querySelector('#slider-size');
    const sliderAlpha = hud.querySelector('#slider-alpha');
    const sliderSharpness = hud.querySelector('#slider-sharpness');
    const sliderDisperse = hud.querySelector('#slider-disperse');

    const valCount = hud.querySelector('#val-count');
    const valSize = hud.querySelector('#val-size');
    const valAlpha = hud.querySelector('#val-alpha');
    const valSharpness = hud.querySelector('#val-sharpness');
    const valDisperse = hud.querySelector('#val-disperse');

    const copyBtn = hud.querySelector('#hud-copy-btn');
    const resetBtn = hud.querySelector('#hud-reset-btn');
    const closeBtn = hud.querySelector('#hud-close-btn');

    // 刷新 UI 显示以匹配 activeMode 的参数
    function updateHUDValues() {
      const p = PRESETS[activeMode];
      sliderCount.value = p.count;
      sliderSize.value = p.size;
      sliderAlpha.value = p.alpha;
      sliderSharpness.value = p.sharpness;
      sliderDisperse.value = p.disperse;

      valCount.textContent = p.count;
      valSize.textContent = p.size.toFixed(1);
      valAlpha.textContent = p.alpha.toFixed(2);
      valSharpness.textContent = p.sharpness.toFixed(2);
      valDisperse.textContent = p.disperse.toFixed(1);

      modePill.className = `hud-mode-pill ${activeMode}`;
      modePill.textContent = activeMode === 'day' ? '☀️ 白天配置' : '🌙 黑夜配置';
    }

    function syncEngine() {
      if (window.__universeInstance && window.__universeInstance.updateParams) {
        window.__universeInstance.updateParams(PRESETS[activeMode], activeMode);
      }
    }

    // 滑块实时监听
    let countDebounceTimer = null;
    sliderCount.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      PRESETS[activeMode].count = val;
      valCount.textContent = val;
      clearTimeout(countDebounceTimer);
      countDebounceTimer = setTimeout(syncEngine, 35);
    });

    sliderSize.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      PRESETS[activeMode].size = val;
      valSize.textContent = val.toFixed(1);
      syncEngine();
    });

    sliderAlpha.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      PRESETS[activeMode].alpha = val;
      valAlpha.textContent = val.toFixed(2);
      syncEngine();
    });

    sliderSharpness.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      PRESETS[activeMode].sharpness = val;
      valSharpness.textContent = val.toFixed(2);
      syncEngine();
    });

    sliderDisperse.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      PRESETS[activeMode].disperse = val;
      valDisperse.textContent = val.toFixed(1);
      syncEngine();
    });

    // 主题切换联动监听：自动切换显示的配置
    window.addEventListener('themechange', () => {
      activeMode = getCurrentMode();
      updateHUDValues();
      syncEngine();
    });

    // 点击徽标快捷触发主题切换
    modePill.addEventListener('click', () => {
      const themeBtn = document.getElementById('theme-btn');
      if (themeBtn) themeBtn.click();
    });

    // 复制双模式配置到剪贴板
    copyBtn.addEventListener('click', () => {
      const configObj = {
        day: PRESETS.day,
        night: PRESETS.night
      };
      const configStr = JSON.stringify(configObj, null, 2);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(configStr).then(onCopied);
      } else {
        const ta = document.createElement('textarea');
        ta.value = configStr;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        onCopied();
      }
    });

    function onCopied() {
      copyBtn.textContent = '✅ 已复制双模式配置！';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.textContent = '📋 复制当前配置';
        copyBtn.classList.remove('copied');
      }, 2000);
    }

    // 重置当前模式为黄金预设
    resetBtn.addEventListener('click', () => {
      if (activeMode === 'day') {
        PRESETS.day = { count: 11800, size: 2.4, alpha: 0.68, sharpness: 0.76, disperse: 3.8 };
      } else {
        PRESETS.night = { count: 11800, size: 4.2, alpha: 0.68, sharpness: 0.76, disperse: 3.8 };
      }
      updateHUDValues();
      syncEngine();
    });

    // 收起与展开
    closeBtn.addEventListener('click', () => {
      hud.classList.add('minimized');
      toggleBtn.classList.add('visible');
    });

    toggleBtn.addEventListener('click', () => {
      hud.classList.remove('minimized');
      toggleBtn.classList.remove('visible');
    });

    // 确保与引擎同步
    const readyCheck = setInterval(() => {
      if (window.__universeInstance && window.__universeInstance.updateParams) {
        clearInterval(readyCheck);
        syncEngine();
      }
    }, 50);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createHUD);
  } else {
    createHUD();
  }
})();
