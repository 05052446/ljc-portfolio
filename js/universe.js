/**
 * 3D 宇宙发光粒子交互引擎 - 李减除 (李减除 ➔ − ÷ 形变系统)
 * 1. 采用【马善政毛笔行楷】大字态：字号与画幅扩至撑满首屏右侧红框视野
 * 2. 浅色模式纯正浓墨石黑，深色模式暗金星芒，消除过淡
 * 3. 默认正面朝前稳定不自转，支持鼠标/触控 360 度任意全向旋转交互
 */
(function (global) {
  'use strict';

  // 1. 点阵采样工具函数
  // 采样马善政毛笔行楷“李 减 除”形态 (形态 A - 巨幅饱满撑满红框)
  function generateCharPoints(count) {
    const canvas = document.createElement('canvas');
    const width = 1800;
    const height = 650;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // 字体字号严格统一为 275px，保证“李、减、除”大小绝对均等一致
    ctx.font = 'normal 275px "Ma Shan Zheng", "STKaiti", "KaiTi", cursive, serif';

    const cx = width / 2;
    const cy = height / 2;

    // 【核心实现：真实笔墨轮廓等净距算法】
    // 精密测量三字墨迹边界，使【李到减的净间距 == 减到除的净间距】且减与除重新靠近！
    const mLi = ctx.measureText('李');
    const mJian = ctx.measureText('减');
    const mChu = ctx.measureText('除');

    let xLi, xJian, xChu;
    if (mLi.actualBoundingBoxLeft !== undefined && mLi.actualBoundingBoxRight !== undefined) {
      const wLi = mLi.actualBoundingBoxLeft + mLi.actualBoundingBoxRight;
      const wJian = mJian.actualBoundingBoxLeft + mJian.actualBoundingBoxRight;
      const wChu = mChu.actualBoundingBoxLeft + mChu.actualBoundingBoxRight;

      // 真实笔墨物理净间隙：设定为紧凑、亲密、舒适且绝不碰触的 24px
      const inkGap = 24;
      const totalVisualWidth = wLi + inkGap + wJian + inkGap + wChu;
      const startVisualLeft = cx - totalVisualWidth / 2;

      // 严格计算每个字的绘制中心锚点
      xLi = startVisualLeft + mLi.actualBoundingBoxLeft;
      const rightLi = startVisualLeft + wLi;

      const leftJian = rightLi + inkGap;
      xJian = leftJian + mJian.actualBoundingBoxLeft;
      const rightJian = leftJian + wJian;

      const leftChu = rightJian + inkGap;
      xChu = leftChu + mChu.actualBoundingBoxLeft;
    } else {
      // 备用均等间距兜底
      const gap = 248;
      xLi = cx - gap;
      xJian = cx;
      xChu = cx + gap;
    }

    ctx.fillText('李', xLi, cy);
    ctx.fillText('减', xJian, cy);
    ctx.fillText('除', xChu, cy);

    const imgData = ctx.getImageData(0, 0, width, height);
    const pixels = imgData.data;
    const validPoints = [];

    // 致密微步长采样（step = 1.8），确保笔墨饱满充盈、绝无稀疏发白
    const step = 1.8;
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const idx = (Math.floor(y) * width + Math.floor(x)) * 4;
        if (pixels[idx] > 50) {
          // 映射到 3D 空间：横向跨度约 5.0，纵向跨度约 1.95，撑满右侧视觉容器！
          validPoints.push({
            x: ((x - cx) / (width / 2)) * 4.95,
            y: -((y - cy) / (height / 2)) * 1.95,
            z: (Math.random() - 0.5) * 0.14
          });
        }
      }
    }

    // 按 X 坐标排序保持空间连续拓扑
    validPoints.sort((a, b) => a.x - b.x);

    const result = [];
    const len = validPoints.length;
    for (let i = 0; i < count; i++) {
      if (len > 0) {
        const idx = Math.min(Math.floor((i / count) * len), len - 1);
        const pt = validPoints[idx];
        result.push(
          pt.x + (Math.random() - 0.5) * 0.015,
          pt.y + (Math.random() - 0.5) * 0.015,
          pt.z + (Math.random() - 0.5) * 0.03
        );
      } else {
        result.push((Math.random() - 0.5) * 5.0, (Math.random() - 0.5) * 2.0, 0);
      }
    }
    return new Float32Array(result);
  }

  // 采样数学符号“− ÷”形态 (形态 B - 同比例扩大加厚)
  function generateSymbolPoints(count) {
    const points = [];
    const minusRatio = 0.40;
    const minusCount = Math.floor(count * minusRatio);
    const divCount = count - minusCount;

    // 1. 减号 '-': 横杠 [-2.6, -0.6]，厚度 0.36
    for (let i = 0; i < minusCount; i++) {
      const x = -2.6 + Math.random() * 2.0;
      const y = (Math.random() - 0.5) * 0.36;
      const z = (Math.random() - 0.5) * 0.12;
      points.push({ x, y, z });
    }

    // 2. 除号 '÷': 横杠 [0.6, 2.6]，厚度 0.36 + 上下大正圆点
    const barCount = Math.floor(divCount * 0.58);
    const dotCount = Math.floor((divCount - barCount) / 2);

    for (let i = 0; i < barCount; i++) {
      const x = 0.6 + Math.random() * 2.0;
      const y = (Math.random() - 0.5) * 0.36;
      const z = (Math.random() - 0.5) * 0.12;
      points.push({ x, y, z });
    }

    // 上点
    const divCenterX = 1.60;
    for (let i = 0; i < dotCount; i++) {
      const r = Math.sqrt(Math.random()) * 0.35;
      const theta = Math.random() * Math.PI * 2;
      const x = divCenterX + Math.cos(theta) * r;
      const y = 0.95 + Math.sin(theta) * r;
      const z = (Math.random() - 0.5) * 0.12;
      points.push({ x, y, z });
    }

    // 下点
    const rem = count - points.length;
    for (let i = 0; i < rem; i++) {
      const r = Math.sqrt(Math.random()) * 0.35;
      const theta = Math.random() * Math.PI * 2;
      const x = divCenterX + Math.cos(theta) * r;
      const y = -0.95 + Math.sin(theta) * r;
      const z = (Math.random() - 0.5) * 0.12;
      points.push({ x, y, z });
    }

    points.sort((a, b) => a.x - b.x);

    const flat = [];
    for (let i = 0; i < points.length; i++) {
      flat.push(points[i].x, points[i].y, points[i].z);
    }
    return new Float32Array(flat);
  }

  // 2. GLSL 着色器代码
  const vertexShader = `
    attribute vec3 aLogoPos;
    attribute vec3 aScatter;
    attribute float aSize;
    attribute float aPhase;
    attribute float aColorMix;

    uniform vec3 uHeroPos;
    uniform vec3 uSlotPos;
    uniform float uMorph;
    uniform float uTime;
    uniform float uAssemble;
    uniform float uPixelRatio;
    uniform vec2 uPointer;
    uniform float uRepel;
    uniform vec2 uRot;
    uniform float uLightMode;
    uniform float uParticleScale;
    uniform float uDisperseScale;
    uniform float uScale;

    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      float t = uMorph;

      // 1. 中心位置在首屏 Hero 区域到下方 Slot 区域平滑过渡
      vec3 centerOffset = mix(uHeroPos, uSlotPos, t);

      // 2. 个体非线性物理缓动
      float delay = aPhase * 0.22;
      float localT = clamp((t - delay) / 0.78, 0.0, 1.0);
      float morphEased = localT * localT * (3.0 - 2.0 * localT);

      // 3. 向下滑动中段向全屏漫天散开的流星波浪 (支持移动端 uScale 缩放)
      float disperse = sin(morphEased * 3.1415926) * (2.25 * uDisperseScale);
      vec3 shapePos = (mix(position, aLogoPos, morphEased) + aScatter * disperse) * uScale;

      // 重播爆散聚合缓动
      shapePos += aScatter * ((1.0 - uAssemble) * 6.5);

      // 4. 围绕自身局部中心进行纯手动 360 度旋转 (默认无自转，正面朝前)
      float cx = cos(uRot.x), sx = sin(uRot.x);
      float cy = cos(uRot.y), sy = sin(uRot.y);

      vec3 rPos = shapePos;
      // 自由 Y 轴 360 度旋转
      rPos = vec3(rPos.x * cy + rPos.z * sy, rPos.y, -rPos.x * sy + rPos.z * cy);
      // 自由 X 轴 360 度旋转
      rPos = vec3(rPos.x, rPos.y * cx - rPos.z * sx, rPos.y * sx + rPos.z * cx);

      vec3 worldPos = centerOffset + rPos;

      // 自然流动微颤
      worldPos.y += sin(uTime * 1.4 + worldPos.x * 0.7) * 0.025;
      worldPos.x += cos(uTime * 1.1 + worldPos.y * 0.6) * 0.02;

      vec4 mvPosition = modelViewMatrix * vec4(worldPos, 1.0);

      // 5. 屏幕空间鼠标排斥推散交互
      vec4 proj = projectionMatrix * mvPosition;
      vec2 screenP = proj.xy / proj.w;
      float distToMouse = length(screenP - uPointer);
      if (distToMouse < 0.28 && uRepel > 0.0) {
        vec2 pushDir = normalize(screenP - uPointer);
        float force = (1.0 - distToMouse / 0.28) * uRepel * 0.45;
        worldPos.x += pushDir.x * force;
        worldPos.y += pushDir.y * force;
        mvPosition = modelViewMatrix * vec4(worldPos, 1.0);
      }

      gl_Position = projectionMatrix * mvPosition;

      // 6. 微粒尺寸：支持实时动态缩放 uParticleScale 与移动端 uScale 自适应
      float sizeScale = mix(1.0, uScale, 0.35);
      float baseSize = aSize * (26.0 / -mvPosition.z) * uPixelRatio * sizeScale;
      if (uLightMode > 0.5) {
        gl_PointSize = clamp(baseSize * 1.55 * uParticleScale, 1.2 * uPixelRatio, 12.0 * uPixelRatio);
      } else {
        gl_PointSize = clamp(baseSize * uParticleScale, 1.0, 7.5 * uPixelRatio);
      }

      float twinkle = 0.82 + 0.18 * sin(uTime * 2.8 + aPhase * 6.28);
      vAlpha = twinkle;

      // 暗色模式金芒 (0.92, 0.75, 0.52) 与冰蓝钻星 (0.95, 0.97, 1.0)
      vec3 gold = vec3(0.92, 0.75, 0.52);
      vec3 starlight = vec3(0.95, 0.97, 1.0);
      vColor = mix(gold, starlight, aColorMix);
    }
  `;

  const fragmentShader = `
    uniform float uLightMode;
    uniform float uLightAlpha;
    uniform float uSharpness;

    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      vec2 coord = gl_PointCoord - vec2(0.5);
      float dist = length(coord) * 2.0;
      if (dist > 1.0) discard;

      if (uLightMode > 0.5) {
        // 【纯黑全黑设计：纯黑墨迹，可动态调控边缘锐度与浓度】
        float edgeStart = mix(0.35, 0.96, clamp(uSharpness, 0.0, 1.0));
        float alpha = smoothstep(1.0, edgeStart, dist) * uLightAlpha;
        gl_FragColor = vec4(0.0, 0.0, 0.0, alpha);
        return;
      }

      // 暗色模式发光星辰
      float core = smoothstep(0.52, 0.0, dist);
      float halo = exp(-dist * dist * 4.0);
      float intensity = core * 0.75 + halo * 0.25;

      gl_FragColor = vec4(vColor, intensity * vAlpha * 0.72);
    }
  `;

  // 3. 主启动函数
  function initUniverse(options = {}) {
    const canvas = options.canvas || document.querySelector('#universe-canvas');
    if (!canvas || !window.THREE) return null;

    const THREE = window.THREE;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 10.0);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance'
    });

    const MAX_PARTICLES = 20000;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // 黄金双模式预设配置（提取自实测最佳效果）
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

    const isInitiallyLight = document.documentElement.dataset.theme !== 'dark';
    const initialPreset = isInitiallyLight ? PRESETS.day : PRESETS.night;
    let particleCount = initialPreset.count;

    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight, false);

    // 点阵数据缓冲区（预分配 20000，使用 setDrawRange 动态裁剪，杜绝 WebGL 越界报错）
    const charBuffer = new Float32Array(MAX_PARTICLES * 3);
    const symbolBuffer = new Float32Array(MAX_PARTICLES * 3);
    const scatters = new Float32Array(MAX_PARTICLES * 3);
    const sizes = new Float32Array(MAX_PARTICLES);
    const phases = new Float32Array(MAX_PARTICLES);
    const colorMixes = new Float32Array(MAX_PARTICLES);

    for (let i = 0; i < MAX_PARTICLES; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 0.8 + Math.random() * 1.8;
      scatters[i * 3 + 0] = Math.sin(phi) * Math.cos(theta) * speed * 1.45;
      scatters[i * 3 + 1] = Math.cos(phi) * speed * 1.15;
      scatters[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed * 0.9;

      sizes[i] = 0.85 + Math.random() * 1.35;
      phases[i] = Math.random();
      colorMixes[i] = Math.random() < 0.35 ? 0.0 : Math.random();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(charBuffer, 3));
    geometry.setAttribute('aLogoPos', new THREE.BufferAttribute(symbolBuffer, 3));
    geometry.setAttribute('aScatter', new THREE.BufferAttribute(scatters, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute('aColorMix', new THREE.BufferAttribute(colorMixes, 1));

    function updatePointsData(count) {
      count = Math.min(Math.max(count, 1000), MAX_PARTICLES);
      particleCount = count;
      const chars = generateCharPoints(count);
      const symbols = generateSymbolPoints(count);

      charBuffer.set(chars);
      symbolBuffer.set(symbols);

      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.aLogoPos.needsUpdate = true;
      geometry.setDrawRange(0, count);
    }

    // 初始载入点阵
    updatePointsData(particleCount);

    const uniforms = {
      uHeroPos: { value: new THREE.Vector3(2.5, 0.2, 0.0) },
      uSlotPos: { value: new THREE.Vector3(0.0, -1.0, 0.0) },
      uMorph: { value: 0.0 },
      uTime: { value: 0.0 },
      uAssemble: { value: 0.0 },
      uPixelRatio: { value: dpr },
      uPointer: { value: new THREE.Vector2(-10, -10) },
      uRepel: { value: 0.0 },
      // 默认正面朝前 (0, 0)，绝不自动旋转
      uRot: { value: new THREE.Vector2(0.0, 0.0) },
      uLightMode: { value: isInitiallyLight ? 1.0 : 0.0 },
      uParticleScale: { value: initialPreset.size / 4.5 },
      uDisperseScale: { value: initialPreset.disperse / 2.25 },
      uLightAlpha: { value: initialPreset.alpha },
      uSharpness: { value: initialPreset.sharpness },
      uScale: { value: 1.0 }
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: uniforms,
      transparent: true,
      depthWrite: false,
      blending: isInitiallyLight ? THREE.NormalBlending : THREE.AdditiveBlending
    });

    const pointsMesh = new THREE.Points(geometry, material);
    scene.add(pointsMesh);

    function screenToWorld(screenX, screenY) {
      const vH = 2.0 * Math.tan((camera.fov * Math.PI) / 360.0) * camera.position.z;
      const vW = vH * (window.innerWidth / window.innerHeight);
      const wx = ((screenX - window.innerWidth / 2) / window.innerWidth) * vW;
      const wy = -((screenY - window.innerHeight / 2) / window.innerHeight) * vH;
      return { x: wx, y: wy };
    }

    let assembleProgress = 0.0;
    // 默认角度 0，正面朝前！
    let targetRotX = 0.0;
    let targetRotY = 0.0;
    let rotX = 0.0;
    let rotY = 0.0;
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    const heroVisual = document.querySelector('#hero-visual') || document.querySelector('.hero-visual');
    const heroInteraction = document.querySelector('#hero-interaction') || heroVisual;
    const symbolSlot = document.querySelector('#symbol-slot') || document.querySelector('.cursor-slot');

    function updateLayoutPositions() {
      const isMob = window.innerWidth <= 768;
      if (heroVisual) {
        const rect = heroVisual.getBoundingClientRect();
        // 桌面端横向向右微调偏置（+68px），手机端严格水平居中（0px）
        const offsetX = isMob ? 0 : 68;
        const pos = screenToWorld(rect.left + rect.width / 2 + offsetX, rect.top + rect.height / 2);
        uniforms.uHeroPos.value.set(pos.x, pos.y, 0.0);
      } else {
        uniforms.uHeroPos.value.set(isMob ? 0.0 : 2.9, 0.0, 0.0);
      }

      if (symbolSlot) {
        const rect = symbolSlot.getBoundingClientRect();
        const pos = screenToWorld(rect.left + rect.width / 2, rect.top + rect.height / 2);
        uniforms.uSlotPos.value.set(pos.x, pos.y, 0.0);
      } else {
        uniforms.uSlotPos.value.set(0.0, -1.5, 0.0);
      }
    }

    function onScroll() {
      const scrollY = window.scrollY || window.pageYOffset;
      const vh = window.innerHeight;

      if (symbolSlot) {
        const slotRect = symbolSlot.getBoundingClientRect();
        const slotScreenY = slotRect.top;
        const startY = vh * 0.95;
        const endY = vh * 0.45;
        const p = (startY - slotScreenY) / (startY - endY);
        uniforms.uMorph.value = Math.min(Math.max(p, 0.0), 1.0);
      } else {
        const p = (scrollY - 30) / 450;
        uniforms.uMorph.value = Math.min(Math.max(p, 0.0), 1.0);
      }

      updateLayoutPositions();
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    // 交互绑定：支持 360 度全向无死角自由拖拽旋转，松开时自动平滑回正
    const endHeroDrag = (e) => {
      if (isDragging) {
        isDragging = false;
        if (heroInteraction) heroInteraction.classList.remove('dragging');
        // 【核心交互：松开鼠标时，将当前累积弧度换算至 [-π, π]，沿最短路径平滑回正到正面朝前！】
        rotX = Math.atan2(Math.sin(rotX), Math.cos(rotX));
        rotY = Math.atan2(Math.sin(rotY), Math.cos(rotY));
        targetRotX = 0.0;
        targetRotY = 0.0;
        try {
          if (e && e.pointerId && heroInteraction && heroInteraction.hasPointerCapture && heroInteraction.hasPointerCapture(e.pointerId)) {
            heroInteraction.releasePointerCapture(e.pointerId);
          }
        } catch (err) {}
      }
    };

    if (heroInteraction) {
      heroInteraction.addEventListener('pointerdown', (e) => {
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        heroInteraction.classList.add('dragging');
        uniforms.uRepel.value = 1.0;
        try {
          heroInteraction.setPointerCapture(e.pointerId);
        } catch (err) {}
      });

      heroInteraction.addEventListener('pointerup', endHeroDrag);
      heroInteraction.addEventListener('pointercancel', endHeroDrag);
    }

    // 全局拖拽追踪：即便鼠标急速拖拽至屏幕任意位置，也能持续精准 360 度旋转与平滑回正
    window.addEventListener('pointermove', (e) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      uniforms.uPointer.value.set(normX, normY);
      uniforms.uRepel.value = isDragging ? 1.0 : 0.7;

      if (isDragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        // 360 度自由度旋转
        targetRotY += dx * 0.008;
        targetRotX += dy * 0.008;
        lastX = e.clientX;
        lastY = e.clientY;
      }
    }, { passive: true });

    window.addEventListener('pointerup', endHeroDrag);
    window.addEventListener('pointercancel', endHeroDrag);

    // 键盘支持 (方向键 360 度旋转，松开同样平滑回正)
    window.addEventListener('keydown', (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        if (e.key === 'ArrowLeft') targetRotY -= 0.12;
        if (e.key === 'ArrowRight') targetRotY += 0.12;
        if (e.key === 'ArrowUp') targetRotX -= 0.12;
        if (e.key === 'ArrowDown') targetRotX += 0.12;
      }
    });

    window.addEventListener('keyup', (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        rotX = Math.atan2(Math.sin(rotX), Math.cos(rotX));
        rotY = Math.atan2(Math.sin(rotY), Math.cos(rotY));
        targetRotX = 0.0;
        targetRotY = 0.0;
      }
    });

    // 动态主题深浅色切换及混合模式与双模式参数自适应
    function updateThemeMode(isLight) {
      const modeKey = isLight ? 'day' : 'night';
      const preset = PRESETS[modeKey];

      uniforms.uLightMode.value = isLight ? 1.0 : 0.0;
      uniforms.uParticleScale.value = preset.size / 4.5;
      uniforms.uLightAlpha.value = preset.alpha;
      uniforms.uSharpness.value = preset.sharpness;
      uniforms.uDisperseScale.value = preset.disperse / 2.25;

      material.blending = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;
      material.needsUpdate = true;

      updatePointsData(preset.count);
    }

    window.addEventListener('themechange', () => {
      const isLight = document.documentElement.dataset.theme !== 'dark';
      updateThemeMode(isLight);
    });

    // 重播复位：重置粒子汇聚并回归正面朝前 (0, 0)，重新爆散聚合
    function replay() {
      assembleProgress = 0.0;
      uniforms.uAssemble.value = 0.0;
      targetRotX = 0.0;
      targetRotY = 0.0;
      rotX = 0.0;
      rotY = 0.0;
      uniforms.uRot.value.set(0.0, 0.0);
    }

    let clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);

      const delta = clock.getDelta();
      uniforms.uTime.value += delta;

      if (assembleProgress < 1.0) {
        assembleProgress += (1.0 - assembleProgress) * 0.065;
        if (1.0 - assembleProgress < 0.001) assembleProgress = 1.0;
        uniforms.uAssemble.value = assembleProgress;
      }

      // 【核心设定：默认正面朝前！拖拽时响应旋转，松开时以 0.085 缓动系数自动平滑回正】
      rotX += (targetRotX - rotX) * 0.085;
      rotY += (targetRotY - rotY) * 0.085;

      uniforms.uRot.value.set(rotX, rotY);
      renderer.render(scene, camera);
    }
    animate();

    // 移动端粒子三维视口自适应缩放（留出舒适边距，彻底消除“李”与“除”两侧裁切）
    function updateMobileScale() {
      const w = window.innerWidth;
      if (w <= 768) {
        uniforms.uScale.value = Math.min(Math.max(w / 660.0, 0.46), 0.70);
      } else {
        uniforms.uScale.value = 1.0;
      }
    }

    function onResize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.position.z = 10.0;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, 2);
      updateMobileScale();
      updateLayoutPositions();
      onScroll();
    }
    window.addEventListener('resize', onResize, { passive: true });

    // 监听字体就绪后重新高精度采样马善政行楷笔画
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        updatePointsData(particleCount);
      });
    }

    // 动态重构点阵缓冲区（支持调试面板拖拽实时生效）
    function updateParticleCount(newCount) {
      updatePointsData(newCount);
    }

    setTimeout(() => {
      updateMobileScale();
      updateLayoutPositions();
      onScroll();
      updateThemeMode(document.documentElement.dataset.theme !== 'dark');
    }, 60);

    const api = {
      replay: replay,
      setLightMode: (isLight) => updateThemeMode(isLight),
      updateParams: (params, targetMode) => {
        if (!params) return;
        const currentIsLight = document.documentElement.dataset.theme !== 'dark';
        const mode = targetMode || (currentIsLight ? 'day' : 'night');
        if (PRESETS[mode]) {
          Object.assign(PRESETS[mode], params);
        }
        if (params.count !== undefined) updateParticleCount(Number(params.count));
        if (params.size !== undefined) uniforms.uParticleScale.value = Number(params.size) / 4.5;
        if (params.alpha !== undefined) uniforms.uLightAlpha.value = Number(params.alpha);
        if (params.sharpness !== undefined) uniforms.uSharpness.value = Number(params.sharpness);
        if (params.disperse !== undefined) uniforms.uDisperseScale.value = Number(params.disperse) / 2.25;
      },
      getPresets: () => JSON.parse(JSON.stringify(PRESETS)),
      getActiveParams: () => {
        const isLight = document.documentElement.dataset.theme !== 'dark';
        return Object.assign({}, PRESETS[isLight ? 'day' : 'night']);
      }
    };

    window.__universeInstance = api;
    return api;
  }

  global.initUniverse = initUniverse;
})(window);
