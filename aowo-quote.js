
(function () {
  'use strict';

  /* =========================================================
   * SHOPLINE 結帳設定（已接好：HK$1 計價商品）
   * 商品「透明展示盒訂製・計價單位（HK$1）」已於後台建立並上架。
   * 結帳流程：POST /api/merchants/{MERCHANT_ID}/cart/items
   *   （標頭帶頁面 meta[name="csrf-token"] 的 X-CSRF-Token）
   *   加購「計價單位 × 報價金額」→ 導向 /checkout 完成付款。
   * 僅在商店網域內（嵌入 SHOPLINE 頁面）自動結帳；其他網域為預覽模式。
   * ========================================================= */
  const CONFIG = {
    STORE_HOST: 'www.aowotoys.com',
    MERCHANT_ID: '64e6b7e0812b660045e3a51c',
    UNIT_PRODUCT_ID: '6ac60462ad32cf0001e99d12',
    UNIT_VARIATION_ID: '6ac604631b6195000101a560',
    UNIT_PRICE_HKD: 1
  };
  const ON_STORE = window.location.hostname === CONFIG.STORE_HOST;

  /* ---------- i18n ---------- */
  const I18N = {
    zhTW: {
      bannerTitle: '高透明展示盒 · 線上訂製報價',
      bannerSub: '輸入尺寸立即試算價格 → 確認報價 → 直接加入購物車付款',
      step: '步驟', quote: '報價',
      step1Title: '選擇配置',
      cfgNone: '無燈', cfgNoneDesc: '不附燈光，適合自行布光',
      cfgLight: '有燈', cfgLightDesc: 'LED 燈帶，USB 或 DC 供電',
      power5vDesc: 'USB 供電，限定標準底面尺寸',
      power12vDesc: '變壓器供電，尺寸可客製，可加背燈',
      step2Title: '輸入內尺寸（cm）',
      dimW: '寬 W', dimD: '深 D', dimH: '高 H',
      usbHint: '5V USB 僅支援底面尺寸：15×15、20×20、25×20、25×25、30×30 cm',
      usbHint12vOnly: '目前底面尺寸不支援 5V USB，僅提供 12V DC；改用標準底面尺寸可選 5V USB。',
      step3Title: '選擇電源',
      step4Title: '選擇燈配置',
      cfgBottom: '底燈', cfgBottomDesc: '底部 1 條 LED 燈帶',
      cfgDual: '頂底燈', cfgDualDesc: '頂部 + 底部共 2 條 LED 燈帶',
      baseColor: '底板顏色', lightPanelColor: '燈板顏色',
      colBlack: '黑色', colWhite: '白色', colClear: '透明', colDefault: '（預設）',
      lightColor: '燈光顏色', lcBottom: '底燈顏色', lcTop: '頂燈顏色',
      lcOuter: '外圈', lcInner: '內圈', lcB: '底', lcT: '頂',
      previewTitle: '示意圖',
      priceExclShip: '展示盒價格（不含運）',
      innerSize: '內尺寸',
      outerSize: '外尺寸約', estWeight: '預估重量',
      shipNote: '報價為展示盒價格，未含運費；運費將於 SHOPLINE 結帳時依您的收貨地址自動計算。',
      cta: '確認價格無誤，加入購物車並前往付款',
      copySpecs: '複製訂製規格',
      contactTitle: '更多客製需求，聯絡我們',
      copied: '已複製訂製規格。',
      addedTitle: '已加入購物車 ✓ 請確認訂製規格',
      otherWarn: '注意：購物車內還有 {n} 件其他商品，結帳時會一併計算付款。',
      addedHint: '建議先至購物車確認商品清單與金額無誤後再結帳；請按「複製規格」保存訂製內容，並可於結帳頁訂單備註貼上，或透過 LINE / WhatsApp 提供給我們。',
      goCart: '前往購物車確認清單',
      goCheckout: '直接前往結帳',
      copySpec2: '複製規格',
      previewNote: '預覽模式：此頁面不在 SHOPLINE 商店網域內，無法直接加購。嵌入商店後，將自動把「計價單位」以報價金額作為數量加入購物車並前往結帳。',
      checkoutError: '加入購物車失敗，請稍後再試；或按下方「複製訂製規格」聯絡客服下單。',
      errDims: '請輸入有效的寬、深、高（1–200 cm 的整數）。',
      footer: '定制商品於付款後進入製作，非運損或瑕疵不適用退換貨；所輸入為內尺寸，成品外尺寸會因板厚與燈光配置而增加。'
    },
    zhCN: {
      bannerTitle: '高透明展示盒 · 在线定制报价',
      bannerSub: '输入尺寸立即试算价格 → 确认报价 → 直接加入购物车付款',
      step: '步骤', quote: '报价',
      step1Title: '选择配置',
      cfgNone: '无灯', cfgNoneDesc: '不带灯光，适合自行布光',
      cfgLight: '有灯', cfgLightDesc: 'LED 灯带，USB 或 DC 供电',
      power5vDesc: 'USB 供电，仅限标准底面尺寸',
      power12vDesc: '变压器供电，尺寸可定制，可加背灯',
      step2Title: '输入内尺寸（cm）',
      dimW: '宽 W', dimD: '深 D', dimH: '高 H',
      usbHint: '5V USB 仅支持底面尺寸：15×15、20×20、25×20、25×25、30×30 cm',
      usbHint12vOnly: '目前底面尺寸不支持 5V USB，仅提供 12V DC；改用标准底面尺寸可选 5V USB。',
      step3Title: '选择电源',
      step4Title: '选择灯配置',
      cfgBottom: '底灯', cfgBottomDesc: '底部 1 条 LED 灯带',
      cfgDual: '顶底灯', cfgDualDesc: '顶部 + 底部共 2 条 LED 灯带',
      baseColor: '底板颜色', lightPanelColor: '灯板颜色',
      colBlack: '黑色', colWhite: '白色', colClear: '透明', colDefault: '（默认）',
      lightColor: '灯光颜色', lcBottom: '底灯颜色', lcTop: '顶灯颜色',
      lcOuter: '外圈', lcInner: '内圈', lcB: '底', lcT: '顶',
      previewTitle: '示意图',
      priceExclShip: '展示盒价格（不含运费）',
      innerSize: '内尺寸',
      outerSize: '外尺寸约', estWeight: '预估重量',
      shipNote: '报价为展示盒价格，不含运费；运费将于 SHOPLINE 结账时依您的收货地址自动计算。',
      cta: '确认价格无误，加入购物车并前往付款',
      copySpecs: '复制定制规格',
      contactTitle: '更多客制需求，联系我们',
      copied: '已复制定制规格。',
      addedTitle: '已加入购物车 ✓ 请确认定制规格',
      otherWarn: '注意：购物车内还有 {n} 件其他商品，结账时会一并计算付款。',
      addedHint: '建议先到购物车确认商品清单与金额无误后再结账；请按「复制规格」保存定制内容，并可于结账页订单备注贴上，或透过 LINE / WhatsApp 提供给我们。',
      goCart: '前往购物车确认清单',
      goCheckout: '直接前往结账',
      copySpec2: '复制规格',
      previewNote: '预览模式：此页面不在 SHOPLINE 商店域名内，无法直接加购。嵌入商店后，将自动把「计价单位」以报价金额作为数量加入购物车并前往结账。',
      checkoutError: '加入购物车失败，请稍后再试；或按下方「复制定制规格」联系客服下单。',
      errDims: '请输入有效的宽、深、高（1–200 cm 的整数）。',
      footer: '定制商品于付款后进入制作，非运损或瑕疵不适用退换货；所输入为内尺寸，成品外尺寸会因板厚与灯光配置而增加。'
    },
    en: {
      bannerTitle: 'Crystal Clear Display Case · Instant Custom Quote',
      bannerSub: 'Enter dimensions → get an instant price → add to cart and checkout',
      step: 'STEP', quote: 'QUOTE',
      step1Title: 'Configuration',
      cfgNone: 'No light', cfgNoneDesc: 'No lighting included, for your own setup',
      cfgLight: 'With light', cfgLightDesc: 'LED strips, USB or DC powered',
      power5vDesc: 'USB powered, standard base sizes only',
      power12vDesc: 'Adapter powered, fully custom sizes, back light optional',
      step2Title: 'Inner dimensions (cm)',
      dimW: 'Width W', dimD: 'Depth D', dimH: 'Height H',
      usbHint: '5V USB supports base sizes: 15×15, 20×20, 25×20, 25×25, 30×30 cm only',
      usbHint12vOnly: 'This base size does not support 5V USB — 12V DC only. Switch to a standard base size to enable 5V USB.',
      step3Title: 'Power supply',
      step4Title: 'Lighting layout',
      cfgBottom: 'Bottom light', cfgBottomDesc: '1 LED strip at the base',
      cfgDual: 'Top + bottom lights', cfgDualDesc: '2 LED strips, top and base',
      baseColor: 'Base panel color', lightPanelColor: 'Light panel color',
      colBlack: 'Black', colWhite: 'White', colClear: 'Clear', colDefault: ' (default)',
      lightColor: 'Light colors', lcBottom: 'Bottom light color', lcTop: 'Top light color',
      lcOuter: 'Outer ring', lcInner: 'Inner ring', lcB: 'Bottom', lcT: 'Top',
      previewTitle: 'Preview',
      priceExclShip: 'case price, shipping excluded',
      innerSize: 'Inner size',
      outerSize: 'Outer size approx.', estWeight: 'Est. weight',
      shipNote: 'The quote covers the display case only; shipping is calculated automatically by SHOPLINE at checkout based on your delivery address.',
      cta: 'Confirm price, add to cart and go to payment',
      copySpecs: 'Copy specs',
      contactTitle: 'Need something more custom? Contact us',
      copied: 'Specs copied.',
      addedTitle: 'Added to cart ✓ Please confirm your specs',
      otherWarn: 'Note: your cart also contains {n} other item(s); they will be charged together at checkout.',
      addedHint: 'We recommend reviewing the item list and total in the cart before checkout. Click "Copy specs" to save the spec, paste it into the order note at checkout, or send it to us via LINE / WhatsApp.',
      goCart: 'Review cart items',
      goCheckout: 'Go straight to checkout',
      copySpec2: 'Copy specs',
      previewNote: 'PREVIEW MODE: this page is not on the SHOPLINE store domain, so add-to-cart is disabled. Once embedded in the store, the pricing unit is added with the quoted amount as quantity and checkout opens automatically.',
      checkoutError: 'Failed to add to cart. Please try again, or use "Copy specs" below and contact us to place the order.',
      errDims: 'Please enter valid width, depth and height (integers 1–200 cm).',
      footer: 'Custom products go into production after payment and cannot be returned unless damaged or defective. Inputs are inner dimensions; the finished outer size is larger due to panel thickness and lighting.'
    }
  };
  let lang = 'zhTW';
  const t = (k) => (I18N[lang] && I18N[lang][k]) || I18N.zhTW[k];

  function applyLang() {
    document.querySelectorAll('#aowobox-tb-root [data-i18n]').forEach((el) => {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.documentElement.lang = lang === 'en' ? 'en' : (lang === 'zhCN' ? 'zh-CN' : 'zh-Hant');
    document.querySelectorAll('#aowobox-tb-lang button').forEach((b) => {
      b.classList.toggle('on', b.dataset.lang === lang);
    });
    renderLightGrids();
    refresh();
  }
  document.querySelectorAll('#aowobox-tb-lang button').forEach((b) => {
    b.addEventListener('click', () => { lang = b.dataset.lang; applyLang(); });
  });

  /* ---------- Pricing core (mirrors price_calculator_V2.html, transparent mode) ---------- */
  const FIVE_V_PAIRS = [[15, 15], [20, 20], [25, 20], [25, 25], [30, 30]];
  const CM2 = 0.0001, CM = 0.01;
  // 透明盒固定 3mm 板（160 元/㎡）、前薄板 2mm（100 元/㎡）、燈帶 28 元/m、雕刻 200、噴繪 400
  const C = { light: 28, carve: 200, print: 400, board: 160, boardThin: 100 };

  function calculateWeight(W, D, H, hasTop, hasBottom, hasBack) {
    W = Number(W); D = Number(D); H = Number(H);
    if (!W || !D || !H) return 0;
    const thickness = (W > 50 || D > 50 || H > 50) ? 5 : 3;
    const totalCm2 = 2 * (W * D + D * H + W * H);
    const baseW = totalCm2 * (thickness === 3 ? 0.00033 : 0.00055);
    let lightW = 0;
    const panel = (a, b) => { const la = a * b + 2 * a + 2 * b; return (la * 2 * 0.0276 + a + b) / 0.088 * 3 * 0.00033; };
    if (hasBottom) lightW += panel(W, D);
    if (hasTop) lightW += panel(W, D);
    if (hasBack) lightW += panel(W, H);
    const volumeW = ((W + 5) * (D + 5) * (H / 2 + 5)) / 6000;
    return Math.ceil(Math.max(baseW + lightW, volumeW));
  }

  function roundToNearest9Rmb(price) {
    const rounded = Math.round(price);
    const tens = Math.floor(rounded / 10) * 10;
    const ones = rounded % 10;
    if (ones < 9) return tens + 9;
    if (ones === 9) return rounded;
    return tens + 10 + 9;
  }
  const applyRmbMarkup = (p) => roundToNearest9Rmb(p * 1.10);
  function calculateHkd(rmb) {
    const val = Math.floor(rmb * 1.2);
    if (val % 10 === 0) return val - 1;
    return Math.floor(val / 10) * 10 + 9;
  }

  function factoryBase(W, D, H) {
    const L = W;
    const a = {
      totalSix: ((L * W) + (L * H) + (W * H)) * 2 * CM2,
      fourSides: ((W * H) + (L * H)) * 2 * CM2,
      fiveNoTop: ((W * H * 2) + (L * H * 2) + (L * W)) * CM2,
      threePanel: (L * H * CM2) + (W * H * CM2 * 2),
      stripTopBottom: (L + W) * CM * 2,
      stripBack: (L + H) * CM * 2,
      areaTopBottom: (L * W * CM2 * 2) + (L * 2 * 2 * CM2) + (W * 2 * 2 * CM2),
      areaBack: (L * H * CM2 * 2) + (L * 2 * 2 * CM2) + (H * 2 * 2 * CM2),
      frontM2: L * W * CM2
    };
    const lightTopBottom = a.areaTopBottom * C.board + a.stripTopBottom * C.light;
    const lightBack = a.areaBack * C.board + a.stripBack * C.light;
    const bodySimple = a.totalSix * C.board;
    // 透明盒：工厂底价固定取「雕刻」列
    const designCarve = (L * W * CM2) * C.print + (L * H * CM2) * C.print + (L * H * CM2) * C.carve;
    const frontPlate = a.frontM2 * C.boardThin;
    const backThinPanel = (L * H * CM2) * C.boardThin;
    return {
      none: bodySimple + designCarve,
      bottom: lightTopBottom + designCarve + a.fiveNoTop * C.board + frontPlate,
      topBottom: lightTopBottom * 2 + designCarve + a.fourSides * C.board + frontPlate,
      triple: lightTopBottom * 2 + lightBack + designCarve + a.threePanel * C.board + frontPlate + backThinPanel
    };
  }

  function priceOf(W, D, H, code, is12v) {
    const bases = factoryBase(W, D, H);
    const baseKey = { no: 'none', bottom: 'bottom', dual: 'topBottom', triple: 'triple' }[code];
    const priceRmb = applyRmbMarkup(bases[baseKey]);
    const hkd = calculateHkd(priceRmb);
    const flags = {
      no: [false, false, false],
      bottom: [false, true, false],
      dual: [true, true, false],
      triple: [true, true, true]
    }[code];
    const weight = calculateWeight(W, D, H, flags[0], flags[1], flags[2]);
    return { hkd, weight };
  }

  function outerSize(W, D, H, code, is12v) {
    if (is12v) {
      if (code === 'no') return { w: W + 2, d: D + 2, h: H + 1 };
      if (code === 'bottom') return { w: W + 2, d: D + 2, h: H + 2.5 };
      if (code === 'dual') return { w: W + 2, d: D + 2, h: H + 5 };
      if (code === 'triple') return { w: W + 2, d: D + 3, h: H + 5 };
    } else {
      if (W === 30 && D === 30) {
        if (code === 'no' || code === 'bottom') return { w: 30, d: 30, h: H + 2.5 };
        if (code === 'dual') return { w: 30, d: 30, h: H + 5 };
      } else if (FIVE_V_PAIRS.some(([w, d]) => w === W && d === D)) {
        if (code === 'no' || code === 'bottom') return { w: W + 2, d: D + 2, h: H + 2.5 };
        if (code === 'dual') return { w: W + 2, d: D + 2, h: H + 5 };
      }
    }
    return null;
  }
  const fmtOuter = (o) => o ? `${round1(o.w)}×${round1(o.d)}×${round1(o.h)} cm` : '—';
  function round1(n) { const r = Math.round(n * 10) / 10; return Math.abs(r - Math.round(r)) < 0.01 ? String(Math.round(r)) : r.toFixed(1); }

  /* ---------- UI state ---------- */
  function getCfgPick() {
    const el = document.querySelector('input[name="aowobox-tb-cfgpick"]:checked');
    return el ? el.value : 'none';
  }

  function getPower() {
    const el = document.querySelector('input[name="aowobox-tb-power"]:checked');
    return el ? el.value : '12v';
  }

  function getLightCfg() {
    const el = document.querySelector('input[name="aowobox-tb-lightcfg"]:checked');
    return el ? el.value : 'bottom';
  }

  function getColor() {
    const el = document.querySelector('input[name="aowobox-tb-color"]:checked');
    return el ? el.value : 'black';
  }

  const COLOR_I18N = { black: 'colBlack', white: 'colWhite', clear: 'colClear' };

  /* 燈光色盤（同 Blender 生圖 src/config/lights.py LIGHT_COLOR_HEX） */
  const LIGHT_PALETTE = [
    ['暖白', '#eced82'], ['白', '#f9f9f9'],
    ['紫藍', '#8d33f3'], ['冰藍', '#4fc3f7'], ['UV光', '#6b01f3'], ['紫紅', '#df34fa'],
    ['綠', '#01f92c'], ['草綠', '#c2fc0a'], ['黃', '#fce908'],
    ['紅', '#ec3841'], ['水紅', '#fd5243'], ['藍', '#2342f4']
  ];
  const LIGHT_HEX = Object.fromEntries(LIGHT_PALETTE);
  const LIGHT_NAME_I18N = {
    zhCN: { '紫藍': '紫蓝', '冰藍': '冰蓝', '紫紅': '紫红', '綠': '绿', '草綠': '草绿', '黃': '黄', '紅': '红', '水紅': '水红', '藍': '蓝' },
    en: { '紫藍': 'Purple', '冰藍': 'Ice Blue', 'UV光': 'UV', '紫紅': 'Magenta', '綠': 'Green', '草綠': 'Lime', '黃': 'Yellow', '白': 'White', '暖白': 'Warm White', '紅': 'Red', '水紅': 'Coral', '藍': 'Blue' }
  };
  const lcName = (tc) => (LIGHT_NAME_I18N[lang] && LIGHT_NAME_I18N[lang][tc]) || tc;
  const lightSel = { bottom: '白', top1: '暖白', top2: '白' };
  const lcDot = (tc) => '<i class="tb-lc-dot" style="background:' + LIGHT_HEX[tc] + '"></i>';

  function renderLightGrids() {
    [['bottom', 'aowobox-tb-grid-bottom'], ['top1', 'aowobox-tb-grid-top1'], ['top2', 'aowobox-tb-grid-top2']].forEach(([which, id]) => {
      const grid = document.getElementById(id);
      grid.innerHTML = '';
      LIGHT_PALETTE.forEach(([tc, hex]) => {
        const lab = document.createElement('label');
        lab.className = 'tb-lc-opt' + (lightSel[which] === tc ? ' on' : '');
        lab.innerHTML = '<input type="radio" name="aowobox-tb-lc-' + which + '" value="' + tc + '"' +
          (lightSel[which] === tc ? ' checked' : '') +
          '><i class="tb-lc-dot" style="background:' + hex + '"></i>' +
          '<span>' + lcName(tc) + '</span>';
        grid.appendChild(lab);
      });
    });
  }

  /* SVG 30° 三視示意圖（yaw 30° + 俯角 12°）
     幾何參照 src/blender_script.py：
     無燈 3mm 底板/頂蓋（兩側 overhang 1cm）；
     有燈厚燈板（pad 0.75cm，板厚 2.0/2.5cm）；底燈版頂部 3mm 透明蓋；
     頂底燈版頂部厚板＋頂光環（外圈邊緣/內圈朝內） */
  function drawPreview(W, D, H, cfgPick, lightCfg, panelColor) {
    const svg = document.getElementById('aowobox-tb-svg');
    const cap = document.getElementById('aowobox-tb-previewcap');
    if (!(W >= 1 && D >= 1 && H >= 1)) { svg.innerHTML = ''; cap.textContent = ''; return; }

    const lit = cfgPick === 'light';
    const plateT = (W > 20 || D > 20) ? 2.5 : 2.0;
    const acrylicT = 0.3, litPad = 0.75, noLitOver = 1.0;
    const baseT = lit ? plateT : acrylicT;
    const topT = lit ? (lightCfg === 'dual' ? plateT : acrylicT) : acrylicT;
    const half = lit ? litPad : noLitOver;              // 板四側外伸（對照 Blender：有燈 OUTER、無燈 W+OVERHANG）
    const x0 = -half, x1 = W + half, y0 = -half, y1 = D + half;
    const zB = -baseT, zTop = H + topT;

    // 投影：yaw／俯仰角（預設 yaw 23°、俯角 7°；滑桿已隱藏，保留供除錯）
    const _yawIn = document.getElementById('aowobox-tb-yaw');
    const _elIn = document.getElementById('aowobox-tb-elev');
    const yaw = (_yawIn ? +_yawIn.value : 23) * Math.PI / 180;
    const el = (_elIn ? +_elIn.value : 7) * Math.PI / 180;
    const cy = Math.cos(yaw), syy = Math.sin(yaw), ce = Math.cos(el), se = Math.sin(el);
    const P = (x, y, z) => [
      cy * x - syy * y,
      se * (syy * x + cy * y) - ce * z
    ];

    // 邊界自適應
    const corners = [
      [x0, y0, zB], [x1, y0, zB], [x1, y1, zB], [x0, y1, zB],
      [x0, y0, zTop], [x1, y0, zTop], [x1, y1, zTop], [x0, y1, zTop]
    ].map((c) => P(c[0], c[1], c[2]));
    const minX = Math.min(...corners.map((c) => c[0])), maxX = Math.max(...corners.map((c) => c[0]));
    const minY = Math.min(...corners.map((c) => c[1])), maxY = Math.max(...corners.map((c) => c[1]));
    const VW = 420, VH = 320, pad = 34;
    const sc = Math.min((VW - 2 * pad) / (maxX - minX), (VH - 2 * pad) / (maxY - minY));
    const ox = (VW - (maxX + minX) * sc) / 2, oy = (VH - (maxY + minY) * sc) / 2;
    const Q = (x, y, z) => { const p = P(x, y, z); return [p[0] * sc + ox, p[1] * sc + oy]; };
    const up = se < 0;  // 仰視（俯仰角為負）：可見面改為各板底面，繪製順序需反轉

    const poly3 = (pts, fill, stroke, sw, extra) =>
      '<polygon points="' + pts.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ') + '"' +
      ' fill="' + fill + '"' + (stroke ? ' stroke="' + stroke + '" stroke-width="' + sw + '" stroke-linejoin="round"' : '') +
      (extra || '') + '/>';
    const _clr = panelColor === 'clear';  // 透明底板：與頂板同為透明壓克力（不使用棋盤格）
    const plateFill = _clr ? 'rgba(170,205,250,0.22)' : (panelColor === 'white' ? '#e9eaec' : '#26282c');
    const plateEdge = _clr ? 'rgba(120,170,230,0.85)' : (panelColor === 'white' ? '#c9ced6' : '#111318');
    const plateFront = _clr ? 'rgba(150,190,230,0.14)' : (panelColor === 'white' ? '#d3d6db' : '#1a1c1f');
    const plateSide = _clr ? 'rgba(130,175,220,0.16)' : (panelColor === 'white' ? '#c2c6cc' : '#101214');
    const GLASS = 'rgba(170,205,250,0.10)', GLASS_EDGE = 'rgba(120,170,230,0.85)';
    const lidFill = 'rgba(170,205,250,0.22)';

    const botC = LIGHT_HEX[lightSel.bottom];
    const top1C = LIGHT_HEX[lightSel.top1], top2C = LIGHT_HEX[lightSel.top2];

    const slabTop = (xa, ya, xb, yb, zt) => poly3(
      [Q(xa, ya, zt), Q(xb, ya, zt), Q(xb, yb, zt), Q(xa, yb, zt)], plateFill, plateEdge, 1.2);
    const slabFront = (xa, ya, xb, zb, zt) => poly3(
      [Q(xa, ya, zt), Q(xb, ya, zt), Q(xb, ya, zb), Q(xa, ya, zb)], plateFront, plateEdge, 1);
    const slabRight = (xb, ya, yb, zb, zt) => poly3(
      [Q(xb, ya, zt), Q(xb, yb, zt), Q(xb, yb, zb), Q(xb, ya, zb)], plateSide, plateEdge, 1);
    const lidBox = (xa, ya, xb, yb, zb, zt) =>
      poly3([Q(xa, ya, zt), Q(xb, ya, zt), Q(xb, yb, zt), Q(xa, yb, zt)], lidFill, GLASS_EDGE, 1) +
      poly3([Q(xa, yb, zt), Q(xb, yb, zt), Q(xb, yb, zb), Q(xa, yb, zb)], 'rgba(150,190,230,0.14)', GLASS_EDGE, 0.8) +
      poly3([Q(xb, ya, zt), Q(xb, yb, zt), Q(xb, yb, zb), Q(xb, ya, zb)], 'rgba(130,175,220,0.16)', GLASS_EDGE, 0.8) +
      (up ? poly3([Q(xa, ya, zb), Q(xb, ya, zb), Q(xb, yb, zb), Q(xa, yb, zb)], lidFill, GLASS_EDGE, 1) : '');

    // LED 環（inset 矩形四邊）：近側強、遠側弱
    const ring3 = (xa, ya, xb, yb, z, color, w, alpha) => {
      const A = Q(xa, ya, z), B = Q(xb, ya, z), C = Q(xb, yb, z), D2 = Q(xa, yb, z);
      const seg = (p1, p2, op) => '<line x1="' + p1[0].toFixed(1) + '" y1="' + p1[1].toFixed(1) +
        '" x2="' + p2[0].toFixed(1) + '" y2="' + p2[1].toFixed(1) +
        '" stroke="' + color + '" stroke-opacity="' + op + '" stroke-width="' + w +
        '" stroke-linecap="round" filter="url(#tbGlow)"/>';
      return seg(D2, C, alpha) + seg(B, C, alpha) + seg(A, B, alpha * 0.6) + seg(A, D2, alpha * 0.6);
    };

    let out = '<defs>' +
      '<filter id="tbGlow" x="-80%" y="-80%" width="260%" height="260%">' +
      '<feGaussianBlur stdDeviation="5" result="b"/>' +
      '<feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '</defs>';

    // --- 底板厚盒（俯視：頂面可見；仰視：改畫底面，隱藏頂面先畫）---
    if (!up) {
      out += slabRight(x1, y0, y1, zB, 0);
      out += slabFront(x0, y1, x1, zB, 0);
      out += slabTop(x0, y0, x1, y1, 0);
      // 有燈：發光面是白色透光亞克力面板（非燈殼色），微帶燈色
      if (lit) {
        out += poly3([Q(0, 0, 0), Q(W, 0, 0), Q(W, D, 0), Q(0, D, 0)],
          '#f2f3f5', '#d9dde3', 0.8);
        out += poly3([Q(0, 0, 0), Q(W, 0, 0), Q(W, D, 0), Q(0, D, 0)],
          botC, null, 0, ' fill-opacity="0.20"');
      }
    } else {
      out += slabTop(x0, y0, x1, y1, 0);
      out += slabRight(x1, y0, y1, zB, 0);
      out += slabFront(x0, y1, x1, zB, 0);
      out += poly3([Q(x0, y0, zB), Q(x1, y0, zB), Q(x1, y1, zB), Q(x0, y1, zB)],
        plateSide, plateEdge, 1.2);
    }

    // --- 內腔背板（y=0）：無燈為透明壓克力；有燈帶極淡背光色 ---
    out += poly3([Q(0, 0, 0), Q(W, 0, 0), Q(W, 0, H), Q(0, 0, H)],
      lit ? 'rgba(243,246,251,0.25)' : GLASS, 'rgba(150,175,210,0.4)', 0.8);

    // --- 底燈：地板 LED 環＋地板暈光（亮度 ×2）---
    if (lit) {
      const i = 0.4;
      out += poly3([Q(i, i, 0.03), Q(W - i, i, 0.03), Q(W - i, D - i, 0.03), Q(i, D - i, 0.03)],
        botC, null, 0, ' fill-opacity="0.28"');
      out += ring3(i, i, W - i, D - i, 0.18, botC, 3.0, 1.0);
    }

    // --- 左壁（x=0，較遠，淡）---
    out += poly3([Q(0, 0, 0), Q(0, D, 0), Q(0, D, H), Q(0, 0, H)], GLASS, GLASS_EDGE, 0.7);
    // --- 右壁（x=W）---
    out += poly3([Q(W, 0, 0), Q(W, D, 0), Q(W, D, H), Q(W, 0, H)], GLASS, GLASS_EDGE, 0.9);
    // 右壁斜向反光
    out += poly3([Q(W, 0, H * 0.92), Q(W, D * 0.45, H * 0.92), Q(W, D * 0.45, H * 0.55), Q(W, 0, H * 0.75)],
      'rgba(255,255,255,0.16)', null, 0);

    // --- 前門壓克力（y=D）---
    out += poly3([Q(0, D, 0), Q(W, D, 0), Q(W, D, H), Q(0, D, H)],
      'rgba(180,212,250,0.07)', 'rgba(120,170,230,0.7)', 0.9);
    out += poly3([Q(W * 0.55, D, H), Q(W, D, H), Q(W, D, H * 0.5), Q(W * 0.8, D, H * 0.62)],
      'rgba(255,255,255,0.12)', null, 0);

    // --- 頂板 + 頂燈（頂底燈）：單環＋暈光，與底燈一致 ---
    if (lit && lightCfg === 'dual') {
      const ti = 0.4;  // 與底燈同 inset
      if (!up) {
        // 俯視：暈染→環→黑殼（前/右/頂）最後
        out += poly3([Q(ti, ti, H - 0.03), Q(W - ti, ti, H - 0.03), Q(W - ti, D - ti, H - 0.03), Q(ti, D - ti, H - 0.03)],
          top1C, null, 0, ' fill-opacity="0.28"');
        out += ring3(ti, ti, W - ti, D - ti, H - 0.18, top1C, 3.0, 1.0);
        out += slabRight(x1, y0, y1, H, H + topT);
        out += slabFront(x0, y1, x1, H, H + topT);
        out += slabTop(x0, y0, x1, y1, H + topT);
      } else {
        // 仰視：頂面（隱藏）先畫 → 環 → 暈染 → 前/右側最後
        out += slabTop(x0, y0, x1, y1, H + topT);
        out += ring3(ti, ti, W - ti, D - ti, H - 0.18, top1C, 3.0, 1.0);
        out += poly3([Q(ti, ti, H - 0.03), Q(W - ti, ti, H - 0.03), Q(W - ti, D - ti, H - 0.03), Q(ti, D - ti, H - 0.03)],
          top1C, null, 0, ' fill-opacity="0.28"');
        out += slabRight(x1, y0, y1, H, H + topT);
        out += slabFront(x0, y1, x1, H, H + topT);
      }
    } else {
      const lx0 = lit ? 0 : -noLitOver, lx1 = lit ? W : W + noLitOver;
      const ly0 = lit ? 0 : -noLitOver, ly1 = lit ? D : D + noLitOver; // 無燈蓋四側外伸
      out += lidBox(lx0, ly0, lx1, ly1, H, H + acrylicT);
    }

    svg.innerHTML = out;
    cap.textContent = W + '×' + D + '×' + H + ' cm';
  }

  function readDims() {
    return {
      W: parseInt(document.getElementById('aowobox-tb-w').value, 10),
      D: parseInt(document.getElementById('aowobox-tb-d').value, 10),
      H: parseInt(document.getElementById('aowobox-tb-h').value, 10)
    };
  }

  function refresh() {
    const cfgPick = getCfgPick();
    const { W, D, H } = readDims();
    const hint = document.getElementById('aowobox-tb-usbhint');
    const cta = document.getElementById('aowobox-tb-cta');
    const note = document.getElementById('aowobox-tb-previewnote');
    const powerCard = document.getElementById('aowobox-tb-powercard');
    note.classList.add('tb-hidden');

    const dimsOk = W >= 1 && D >= 1 && H >= 1 && W <= 200 && D <= 200 && H <= 200;
    const fiveOk = FIVE_V_PAIRS.some(([w, d]) => w === W && d === D);

    // 同步「配置」卡片高亮
    document.querySelectorAll('#aowobox-tb-configpick label').forEach((l) => {
      l.classList.toggle('on', l.dataset.val === cfgPick);
    });

    // 電源卡片：無燈時整卡隱藏；有燈時依底面尺寸決定 5V 是否可選
    powerCard.classList.toggle('tb-hidden', cfgPick !== 'light');
    const label5v = document.querySelector('#aowobox-tb-power label[data-val="5v"]');
    const input5v = label5v.querySelector('input');
    if (cfgPick === 'light' && !fiveOk) {
      label5v.classList.add('tb-hidden');
      input5v.disabled = true;
      if (input5v.checked) {
        document.querySelector('#aowobox-tb-power input[value="12v"]').checked = true;
      }
    } else {
      label5v.classList.remove('tb-hidden');
      input5v.disabled = false;
    }

    const power = cfgPick === 'light' ? getPower() : 'none';
    document.querySelectorAll('#aowobox-tb-power label').forEach((l) => {
      l.classList.toggle('on', l.dataset.val === power);
    });

    // 燈配置卡片：僅有燈時顯示（5V / 12V 均可選底燈或頂底燈）
    const lightCard = document.getElementById('aowobox-tb-lightcard');
    lightCard.classList.toggle('tb-hidden', cfgPick !== 'light');
    const lightCfg = getLightCfg();
    document.querySelectorAll('#aowobox-tb-lightcfg label').forEach((l) => {
      l.classList.toggle('on', l.dataset.val === lightCfg);
    });

    // 底板/燈板顏色：無燈可選黑/白/透明，有燈僅黑/白；預設黑色
    const clearOpt = document.getElementById('aowobox-tb-optclear');
    const clearInput = clearOpt.querySelector('input');
    if (cfgPick === 'light') {
      clearOpt.classList.add('tb-hidden');
      clearInput.disabled = true;
      if (clearInput.checked) {
        document.querySelector('#aowobox-tb-colorbody input[value="black"]').checked = true;
      }
    } else {
      clearOpt.classList.remove('tb-hidden');
      clearInput.disabled = false;
    }
    const color = getColor();
    document.querySelectorAll('#aowobox-tb-colorbody label').forEach((l) => {
      l.classList.toggle('on', l.dataset.val === color);
    });
    document.querySelector('#aowobox-tb-colorcard .tb-color-label').textContent =
      cfgPick === 'light' ? t('lightPanelColor') : t('baseColor');
    const curSwatch = document.getElementById('aowobox-tb-curswatch');
    curSwatch.className = 'tb-swatch ' + color;
    document.getElementById('aowobox-tb-curtext').textContent = t(COLOR_I18N[color]);
    document.querySelector('#aowobox-tb-colorcard .tb-color-def').style.display =
      color === 'black' ? '' : 'none';

    // 燈光顏色卡：僅有燈時顯示；頂燈（外圈/內圈）僅頂底燈配置時顯示
    const lcCard = document.getElementById('aowobox-tb-lightcolorcard');
    lcCard.classList.toggle('tb-hidden', cfgPick !== 'light');
    document.getElementById('aowobox-tb-toprow').classList.toggle('tb-hidden', lightCfg !== 'dual');
    let curHtml = t('lcB') + ' ' + lcDot(lightSel.bottom) + lcName(lightSel.bottom);
    if (lightCfg === 'dual') {
      curHtml += '<span class="tb-lc-cursep">／</span>' + t('lcT') + ' ' +
        lcDot(lightSel.top1) + lcName(lightSel.top1) + '＋' + lcDot(lightSel.top2) + lcName(lightSel.top2);
    }
    document.getElementById('aowobox-tb-lcurtext').innerHTML = curHtml;
    const lcDefault = lightSel.bottom === '白' &&
      (lightCfg !== 'dual' || (lightSel.top1 === '暖白' && lightSel.top2 === '白'));
    document.querySelector('#aowobox-tb-lightcolorcard .tb-color-def').style.display =
      lcDefault ? '' : 'none';

    hint.classList.remove('warn', 'err');
    if (!dimsOk) {
      hint.textContent = t('errDims'); hint.classList.add('err');
    } else if (cfgPick === 'light' && !fiveOk) {
      hint.textContent = t('usbHint12vOnly'); hint.classList.add('warn');
    } else if (cfgPick === 'light') {
      hint.textContent = t('usbHint');
    } else {
      hint.textContent = '';
    }

    if (!dimsOk) {
      drawPreview(0, 0, 0);
      document.getElementById('aowobox-tb-amount').textContent = '—';
      document.getElementById('aowobox-tb-inner').textContent = '—';
      document.getElementById('aowobox-tb-outer').textContent = '—';
      document.getElementById('aowobox-tb-weight').textContent = '—';
      cta.disabled = true;
      return;
    }

    // 計價：無燈走 12V 外尺寸規則的厚底版；有燈依燈配置 bottom/dual
    const is12v = power !== '5v';
    const code = power === 'none' ? 'no' : lightCfg;
    const q = priceOf(W, D, H, code, is12v);
    document.getElementById('aowobox-tb-amount').textContent = q.hkd.toLocaleString('en-US');
    document.getElementById('aowobox-tb-inner').textContent = W + '×' + D + '×' + H + ' cm';
    document.getElementById('aowobox-tb-outer').textContent = fmtOuter(outerSize(W, D, H, code, is12v));
    document.getElementById('aowobox-tb-weight').textContent = q.weight + ' kg';
    cta.disabled = false;
    drawPreview(W, D, H, cfgPick, lightCfg, color);
    cta.dataset.payload = JSON.stringify({
      power, W, D, H, code, is12v, color,
      lightCfg, lcBottom: lightSel.bottom, lcTop1: lightSel.top1, lcTop2: lightSel.top2,
      hkd: q.hkd, weight: q.weight
    });
  }

  /* ---------- Add to cart (SHOPLINE cart permalink) ---------- */
  function buildOrderNote(p) {
    const powerLabel = { none: '無燈', '5v': '5V USB', '12v': '12V DC' }[p.power];
    const cfgLabel = ({
      no: '無燈厚底版',
      bottom: p.is12v ? '底1燈版(DC)' : '底1燈版(USB)',
      dual: p.is12v ? '頂底2燈版(DC)' : '頂底2燈版(USB)',
      triple: '頂底背3燈版(DC)'
    })[p.code];
    const outer = fmtOuter(outerSize(p.W, p.D, p.H, p.code, p.is12v));
    const panelLabel = p.power === 'none' ? '底板' : '燈板';
    const colorLabel = { black: '黑色', white: '白色', clear: '透明' }[p.color] || '黑色';
    const lightColorTxt = p.power === 'none' ? '' :
      '｜燈色：底 ' + p.lcBottom + (p.lightCfg === 'dual' ? '；頂 ' + p.lcTop1 + '+' + p.lcTop2 : '');
    return 'AOWOBOX 透明展示盒訂製｜內尺寸 ' + p.W + '×' + p.D + '×' + p.H + ' cm' +
      '｜電源：' + powerLabel + '｜配置：' + cfgLabel + '｜' + panelLabel + '：' + colorLabel +
      lightColorTxt +
      '｜外尺寸約 ' + outer + '｜預估重量 ' + p.weight + 'kg' +
      '｜展示盒 HK$' + p.hkd + '（不含運，運費以結帳頁為準）';
  }

  /* ---------- Checkout (SHOPLINE storefront cart API) ---------- */
  function csrfToken() {
    const el = document.querySelector('meta[name="csrf-token"]');
    return el ? (el.getAttribute('content') || '') : '';
  }
  function cartRequest(path, options) {
    options = options || {};
    options.credentials = 'same-origin';
    options.headers = Object.assign({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-CSRF-Token': csrfToken()
    }, options.headers || {});
    return fetch('/api/merchants/' + CONFIG.MERCHANT_ID + path, options).then(function (resp) {
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      return resp.status === 204 ? null : resp.json();
    });
  }
  /* 回應格式：{result, data:{items:[...]}} */
  function cartItemsOf(data) {
    const d = data && data.data ? data.data : data;
    return (d && d.items) || [];
  }
  /* 清除前一次報價產生的計價單位列（DELETE 在本店會 302，改用 PUT quantity:0）；
     回傳購物車中「其他商品」的件數（數量加總）。 */
  function resetUnitItems() {
    return cartRequest('/cart', { method: 'GET' }).then(function (data) {
      const items = cartItemsOf(data);
      let otherQty = 0;
      const units = [];
      items.forEach(function (it) {
        if (!it) return;
        if (it.variation_id === CONFIG.UNIT_VARIATION_ID || it.product_id === CONFIG.UNIT_PRODUCT_ID) {
          units.push(it);
        } else {
          otherQty += Number(it.quantity) || 0;
        }
      });
      return units.reduce(function (chain, it) {
        const id = it.id || it._id;
        if (!id) return chain;
        return chain.then(function () {
          return cartRequest('/cart/items/' + id, {
            method: 'PUT',
            body: JSON.stringify({ item: { quantity: 0 }, value: 0 })
          }).catch(function () {});
        });
      }, Promise.resolve()).then(function () { return otherQty; });
    }).catch(function () { return 0; });
  }
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
        resolve();
      } catch (e) { reject(e); }
    });
  }
  let lastSpec = '';
  function showAddedPanel(spec, otherQty) {
    document.getElementById('aowobox-tb-added-title').textContent = t('addedTitle');
    document.getElementById('aowobox-tb-added-spec').textContent = spec;
    document.getElementById('aowobox-tb-added-hint').textContent = t('addedHint');
    document.getElementById('aowobox-tb-gocart').textContent = t('goCart');
    document.getElementById('aowobox-tb-gocheckout').textContent = t('goCheckout');
    document.getElementById('aowobox-tb-added-copy').textContent = t('copySpec2');
    const warn = document.getElementById('aowobox-tb-added-warn');
    if (otherQty > 0) {
      warn.textContent = t('otherWarn').replace('{n}', String(otherQty));
      warn.classList.remove('tb-hidden');
    } else {
      warn.classList.add('tb-hidden');
    }
    document.getElementById('aowobox-tb-previewnote').classList.add('tb-hidden');
    document.getElementById('aowobox-tb-added').classList.remove('tb-hidden');
  }

  /* ---------- 自動填寫結帳頁「訂製規格」欄位 ---------- */
  const SPEC_LS_KEY = 'aowo_pending_spec';
  const SPEC_FIELD_NAME = 'orderCustomFields.scmKey_6ac86e1123b66dcb1a5a223c';

  /* 報價頁：把規格存入 localStorage，結帳頁會自動讀取填入 */
  function saveSpecForCheckout(spec) {
    try {
      localStorage.setItem(SPEC_LS_KEY, spec);
      console.log('[aowo] spec saved to localStorage, length=' + spec.length);
      /* 驗證是否寫入成功 */
      const readBack = localStorage.getItem(SPEC_LS_KEY);
      console.log('[aowo] localStorage read back:', readBack ? 'OK, length=' + readBack.length : 'FAILED, null');
    } catch (e) {
      console.error('[aowo] localStorage error:', e);
      /* 備用：存入 cookie */
      document.cookie = SPEC_LS_KEY + '=' + encodeURIComponent(spec) + '; path=/; max-age=3600';
      console.log('[aowo] fallback to cookie');
    }
  }

  /* 結帳頁：輪詢等待欄位出現，用 React native setter 填入（React controlled component 需用原型 setter 才會更新 state） */
  function initSpecAutofill() {
    if (!/\/checkout/.test(location.pathname)) return;
    let spec = '';
    try { spec = localStorage.getItem(SPEC_LS_KEY) || ''; } catch (e) { return; }
    if (!spec) return;
    let tries = 0;
    const timer = setInterval(function () {
      const el = document.querySelector('input[name="' + SPEC_FIELD_NAME + '"]') ||
                 document.querySelector('[data-e2e-id*="custom_field"]');
      tries++;
      if (el) {
        clearInterval(timer);
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(el, spec);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('focus', { bubbles: true }));
        el.dispatchEvent(new Event('blur', { bubbles: true }));
      }
      if (tries > 50) clearInterval(timer);
    }, 300);
  }

  /* 頁面載入時：若是結帳頁，自動填入待寫入的規格 */
  if (/\/checkout/.test(location.pathname)) {
    initSpecAutofill();
  }
  function checkout() {
    const payload = JSON.parse(document.getElementById('aowobox-tb-cta').dataset.payload || 'null');
    if (!payload) return;
    const qty = Math.max(1, Math.round(payload.hkd / CONFIG.UNIT_PRICE_HKD));
    const spec = buildOrderNote(payload);
    lastSpec = spec;
    if (!ON_STORE) {
      const noteBox = document.getElementById('aowobox-tb-previewnote');
      noteBox.textContent = t('previewNote') + '\n' + spec;
      noteBox.classList.remove('tb-hidden');
      return;
    }
    const btn = document.getElementById('aowobox-tb-cta');
    btn.disabled = true;
    document.getElementById('aowobox-tb-added').classList.add('tb-hidden');
    let otherQty = 0;
    resetUnitItems().then(function (n) {
      otherQty = n;
      /* properties：若商品後台有定義同名「訂製規格」文字欄位，規格會掛在品項上；
         未定義時商店會忽略此欄位（不影響加購）。 */
      return cartRequest('/cart/items', {
        method: 'POST',
        body: JSON.stringify({
          item: {
            product_id: CONFIG.UNIT_PRODUCT_ID,
            quantity: qty,
            type: 'product',
            variation_id: CONFIG.UNIT_VARIATION_ID,
            properties: [{ name: '訂製規格', value: spec, type: 'text' }],
            blacklisted_delivery_option_ids: [],
            triggering_item_id: null
          },
          cart_options: { skip_calculate_order: true, is_cart_page: false },
          value: payload.hkd
        })
      });
    }).then(function () {
      btn.disabled = false;
      /* 把規格存入 localStorage，結帳頁會自動填入「訂製規格」欄位 */
      saveSpecForCheckout(spec);
      showAddedPanel(spec, otherQty);
    }).catch(function () {
      const noteBox = document.getElementById('aowobox-tb-previewnote');
      noteBox.textContent = t('checkoutError');
      noteBox.classList.remove('tb-hidden');
      btn.disabled = false;
    });
  }

  /* ---------- bind ---------- */
  document.querySelectorAll('input[name="aowobox-tb-cfgpick"]').forEach((el) => {
    el.addEventListener('change', refresh);
  });
  document.querySelectorAll('input[name="aowobox-tb-power"]').forEach((el) => {
    el.addEventListener('change', refresh);
  });
  document.querySelectorAll('input[name="aowobox-tb-lightcfg"]').forEach((el) => {
    el.addEventListener('change', refresh);
  });
  document.getElementById('aowobox-tb-colorhead').addEventListener('click', function () {
    document.getElementById('aowobox-tb-colorcard').classList.toggle('open');
  });
  document.querySelectorAll('input[name="aowobox-tb-color"]').forEach((el) => {
    el.addEventListener('change', function () { refresh(); });
  });
  document.getElementById('aowobox-tb-lighthead').addEventListener('click', function () {
    document.getElementById('aowobox-tb-lightcolorcard').classList.toggle('open');
  });
  [['bottom', 'aowobox-tb-grid-bottom'], ['top1', 'aowobox-tb-grid-top1'], ['top2', 'aowobox-tb-grid-top2']].forEach(([which, id]) => {
    document.getElementById(id).addEventListener('change', function (e) {
      if (e.target && e.target.value) {
        lightSel[which] = e.target.value;
        // 同步選框 .on（視覺邊框），否則選框會停在舊顏色
        this.querySelectorAll('.tb-lc-opt').forEach((l) => {
          l.classList.toggle('on', l.querySelector('input').checked);
        });
        refresh();
      }
    });
  });
  ['aowobox-tb-w', 'aowobox-tb-d', 'aowobox-tb-h'].forEach((id) => {
    document.getElementById(id).addEventListener('input', refresh);
  });
  // 示意圖視角滑桿：即時重繪
  ['aowobox-tb-yaw', 'aowobox-tb-elev'].forEach((id) => {
    document.getElementById(id).addEventListener('input', function () {
      document.getElementById(id + 'val').textContent = this.value + '°';
      refresh();
    });
  });
  document.getElementById('aowobox-tb-cta').addEventListener('click', checkout);
  document.getElementById('aowobox-tb-gocart').addEventListener('click', function () {
    window.location.href = '/cart';
  });
  document.getElementById('aowobox-tb-gocheckout').addEventListener('click', function () {
    window.location.href = '/checkout';
  });
  function bindCopy(btnId, getText) {
    document.getElementById(btnId).addEventListener('click', function () {
      const text = getText();
      if (!text) return;
      const btn = this; const orig = btn.textContent;
      copyText(text).then(function () {
        btn.textContent = '✓ ' + t('copied');
        setTimeout(function () { btn.textContent = orig; }, 1600);
      });
    });
  }
  bindCopy('aowobox-tb-added-copy', function () { return lastSpec; });
  bindCopy('aowobox-tb-copy', function () {
    const payload = JSON.parse(document.getElementById('aowobox-tb-cta').dataset.payload || 'null');
    return payload ? buildOrderNote(payload) : '';
  });

  applyLang();
})();
