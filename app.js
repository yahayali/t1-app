// ═══════════════════════════════════════════════════════════
// T_1 — حاسبة التصفير المبسطة
// الإصدار 32 — نسخة ويب
// ═══════════════════════════════════════════════════════════

const VERSION = "32";
const NUM_TRADES = 10;
const STORAGE_KEY = "T1_data_v32";

// ═══════════════════════════════════════════════════════════
// بيانات الرموز الثابتة (Offline) — مع أسعار افتراضية
// ═══════════════════════════════════════════════════════════
const SYMBOLS = {
  XAUUSD:     { price: 4000.000,  digits: 3, point: 0.001,   contract: 100,    volumeStep: 0.01, spread: 0.50, swapLong: -10.0, swapShort: 3.0, commission: 0.0, path: "Forex\\XAUUSD" },
  XAGUSD:     { price: 60.000,    digits: 3, point: 0.001,   contract: 5000,   volumeStep: 0.01, spread: 0.50, swapLong: -10.0, swapShort: 3.0, commission: 0.0, path: "Forex\\XAGUSD" },
  EURUSD:     { price: 1.15000,   digits: 5, point: 0.00001, contract: 100000, volumeStep: 0.01, spread: 0.00050, swapLong: -7.5, swapShort: 2.5, commission: 0.0, path: "Forex\\EURUSD" },
  GBPUSD:     { price: 1.35000,   digits: 5, point: 0.00001, contract: 100000, volumeStep: 0.01, spread: 0.00050, swapLong: -6.0, swapShort: 3.0, commission: 0.0, path: "Forex\\GBPUSD" },
  USDJPY:     { price: 155.000,   digits: 3, point: 0.001,   contract: 100000, volumeStep: 0.01, spread: 0.100, swapLong: -5.0, swapShort: 2.0, commission: 0.0, path: "Forex\\USDJPY" },
  BTCUSD:     { price: 60000.00,  digits: 2, point: 1.0,     contract: 1,      volumeStep: 0.01, spread: 50.00, swapLong: -20.0, swapShort: -20.0, commission: 0.0, path: "Crypto\\BTCUSD" },
  US500_x100: { price: 50000.00,  digits: 2, point: 0.01,    contract: 100,    volumeStep: 0.01, spread: 0.50, swapLong: -5.0, swapShort: -5.0, commission: 0.0, path: "Idx_Enlarge\\US500_x100" },
  USTEC_x100: { price: 30000.00,  digits: 2, point: 0.01,    contract: 100,    volumeStep: 0.01, spread: 0.89, swapLong: -581.6, swapShort: 0.0, commission: 0.0, path: "Pro\\Idx_Enlarge\\USTEC_x100" },
  USTEC:      { price: 30000.00,  digits: 2, point: 0.01,    contract: 1,      volumeStep: 0.01, spread: 0.89, swapLong: -5.0, swapShort: 0.0, commission: 0.0, path: "Idx\\USTEC" },
  USOIL:      { price: 90.00,     digits: 3, point: 0.001,   contract: 1000,   volumeStep: 0.01, spread: 0.014, swapLong: -8.0, swapShort: 4.0, commission: 0.0, path: "Energies\\USOIL" },
  NVDA:       { price: 230.00,    digits: 2, point: 0.01,    contract: 100,    volumeStep: 0.01, spread: 0.11, swapLong: -2.0, swapShort: 1.0, commission: 0.0, path: "Stocks\\NVDA" },
  TSLA:       { price: 380.00,    digits: 2, point: 0.01,    contract: 100,    volumeStep: 0.01, spread: 0.20, swapLong: -2.0, swapShort: 1.0, commission: 0.0, path: "Stocks\\TSLA" }
};

// قائمة العملات غير المقومة بالدولار (تحتاج تصحيح)
const NON_USD_PAIRS = ["USDJPY", "USDCAD", "USDCHF", "USDCNH", "USDSAR"];

// ═══════════════════════════════════════════════════════════
// دوال مساعدة — تحويل الأرقام إلى الإنجليزية دائمًا
// ═══════════════════════════════════════════════════════════
const $ = id => document.getElementById(id);
const str = id => $(id).value.trim();

// قراءة رقم من حقل وضمان أنه بالإنجليزية (تحويل الأرقام العربية إلى إنجليزية)
function toEnglishDigits(str) {
  return String(str)
    .replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d))
    .replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
}

function val(id) {
  const raw = toEnglishDigits($(id).value);
  const n = parseFloat(raw);
  return isNaN(n) ? 0 : n;
}

// تنسيق رقم بالإنجليزية دائمًا
function fmt(n, decimals = 2) {
  return Number(n).toFixed(decimals);
}

// هل الرمز من العملات غير المقومة بالدولار؟
function isNonUsdPair(symbolKey) {
  const upper = String(symbolKey).toUpperCase();
  return NON_USD_PAIRS.some(p => upper.includes(p));
}

// ═══════════════════════════════════════════════════════════
// تحديث بيانات الرمز التفصيلية والسعر الافتراضي
// ═══════════════════════════════════════════════════════════
function updateSymbolInfo() {
  const key = str("symbol").toUpperCase();
  const sym = SYMBOLS[key];
  if (!sym) return;

  $("infoDigits").textContent      = sym.digits;
  $("infoPoint").textContent       = sym.point;
  $("infoContract").textContent    = sym.contract.toFixed(1);
  $("infoVolumeStep").textContent  = sym.volumeStep;

  // تحديث السعر الحالي بالسعر الافتراضي للرمز
  $("price").value = sym.price.toFixed(sym.digits);
}

// ═══════════════════════════════════════════════════════════
// بناء بطاقات الصفقات
// ═══════════════════════════════════════════════════════════
const container = $("tradesContainer");

for (let i = 1; i <= NUM_TRADES; i++) {
  const card = document.createElement("div");
  card.className = "trade-card";
  card.dataset.index = i;
  card.innerHTML = `
    <div class="trade-header">
      <input type="checkbox" class="trade-check" id="check_${i}">
      <span class="trade-name">T_${i}</span>
      <span class="trade-toggle">▼</span>
    </div>
    <div class="trade-body">
      <div class="trade-grid">
        <div class="trade-field">
          <label>النوع</label>
          <select id="type_${i}">
            <option value="buy" selected>شراء</option>
            <option value="sell">بيع</option>
          </select>
        </div>
        <div class="trade-field">
          <label>اللوت</label>
          <input type="number" id="lot_${i}" value="1.00" step="0.01" inputmode="decimal">
        </div>
      </div>
      <div class="trade-field">
        <label>سعر الدخول</label>
        <input type="number" id="entry_${i}" value="30000.00" step="0.00001" inputmode="decimal">
      </div>

      <div class="close-section">
        <div class="close-title">الإغلاق 1 (اتركه فارغًا إن لم يُغلق)</div>
        <div class="close-grid">
          <div class="trade-field">
            <label>لوت الإغلاق</label>
            <input type="number" id="c1lot_${i}" placeholder="فارغ = كامل" step="0.01" inputmode="decimal">
          </div>
          <div class="trade-field">
            <label>سعر الإغلاق</label>
            <input type="number" id="c1price_${i}" placeholder="0.00" step="0.00001" inputmode="decimal">
          </div>
        </div>
        <div class="close-result" id="c1result_${i}">—</div>
        <button class="calc-btn" data-calc="${i}">حساب 1</button>
      </div>
    </div>
  `;
  container.appendChild(card);

  // فتح/إغلاق البطاقة
  card.querySelector(".trade-header").addEventListener("click", (e) => {
    if (e.target.type === "checkbox") return;
    card.classList.toggle("open");
  });

  // زر الحساب
  card.querySelector(`[data-calc="${i}"]`).addEventListener("click", () => calcClose1(i));
}

// ═══════════════════════════════════════════════════════════
// التبويبات
// ═══════════════════════════════════════════════════════════
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    tab.classList.add("active");
    $("tab-" + tab.dataset.tab).classList.add("active");
  });
});

// ═══════════════════════════════════════════════════════════
// تحديث بيانات الرمز عند التغيير
// ═══════════════════════════════════════════════════════════
$("symbol").addEventListener("change", updateSymbolInfo);

// ═══════════════════════════════════════════════════════════
// حساب إغلاق 1 لصفقة واحدة
// ═══════════════════════════════════════════════════════════
function calcClose1(i) {
  const symKey = str("symbol").toUpperCase();
  const sym = SYMBOLS[symKey];
  if (!sym) return;

  const box = $(`c1result_${i}`);
  const type = $(`type_${i}`).value;
  const totalLot = val(`lot_${i}`);
  const entry = val(`entry_${i}`);
  const c1PriceStr = toEnglishDigits(str(`c1price_${i}`));
  const c1LotStr = toEnglishDigits(str(`c1lot_${i}`));

  if (!c1PriceStr) {
    box.innerHTML = `<span class="warning">أدخل سعر الإغلاق</span>`;
    return;
  }

  const c1Price = parseFloat(c1PriceStr);
  let c1Lot = c1LotStr ? parseFloat(c1LotStr) : totalLot;

  if (c1Lot <= 0 || c1Lot > totalLot) {
    box.innerHTML = `<span class="danger">لوت غير صحيح</span>`;
    return;
  }

  const diff = type === "buy" ? (c1Price - entry) : (entry - c1Price);
  let gross = diff * sym.contract * c1Lot;
  let spreadCost = sym.spread * c1Lot;

  // تصحيح العملات غير المقومة بالدولار
  if (isNonUsdPair(symKey)) {
    gross = gross / c1Price;
    spreadCost = spreadCost / c1Price;
  }

  const commission = (sym.commission || 0) * c1Lot * 2;
  const profit = gross - spreadCost - commission;
  const points = diff / sym.point;

  const color = profit > 0 ? "profit" : (profit < 0 ? "loss" : "");
  const sign = profit > 0 ? "+" : "";
  const pointSign = points > 0 ? "+" : "";

  box.innerHTML = `<span class="${color}">${pointSign}${points.toFixed(0)} نقطة
${sign}${profit.toFixed(2)} USD</span>`;
}

// ═══════════════════════════════════════════════════════════
// جمع بيانات الصفقات المحددة
// ═══════════════════════════════════════════════════════════
function collectSelectedTrades(sym, symKey, currentPrice) {
  const selected = [];
  let netPosition = 0;
  let totalBuy = 0, totalSell = 0;
  let sumBuy = 0, sumSell = 0;
  let totalFloating = 0, totalRealized = 0, totalNotional = 0;

  for (let i = 1; i <= NUM_TRADES; i++) {
    if (!$(`check_${i}`).checked) continue;

    const type = $(`type_${i}`).value;
    const origLot = val(`lot_${i}`);
    const entry = val(`entry_${i}`);
    let remaining = origLot;
    let realized = 0;
    const closeDetails = [];

    const c1PriceStr = toEnglishDigits(str(`c1price_${i}`));
    const c1LotStr = toEnglishDigits(str(`c1lot_${i}`));

    if (c1PriceStr) {
      const c1Price = parseFloat(c1PriceStr);
      const c1Lot = c1LotStr ? parseFloat(c1LotStr) : remaining;
      if (c1Lot > 0 && c1Lot <= remaining) {
        const diff = type === "buy" ? (c1Price - entry) : (entry - c1Price);
        let closeProfit = diff * sym.contract * c1Lot;

        // تصحيح العملات غير المقومة بالدولار
        if (isNonUsdPair(symKey)) {
          closeProfit = closeProfit / c1Price;
        }

        // خصم السبريد والعمولة على الجزء المغلق
        let spreadCost = sym.spread * c1Lot;
        if (isNonUsdPair(symKey)) {
          spreadCost = spreadCost / c1Price;
        }
        const commission = (sym.commission || 0) * c1Lot * 2;
        closeProfit = closeProfit - spreadCost - commission;

        realized += closeProfit;
        remaining -= c1Lot;
        closeDetails.push({
          type: "إغلاق 1" + (c1Lot >= origLot ? " (كامل)" : " (جزئي)"),
          lot: c1Lot,
          price: c1Price,
          profit: closeProfit
        });
      }
    }

    if (remaining <= 0) {
      selected.push({
        type, lot: 0, origLot, entry, exit: 0,
        pl: 0, realized, closed: true, notional: 0, index: i,
        closeDetails
      });
      totalRealized += realized;
      continue;
    }

    let diff;
    if (type === "buy") {
      diff = currentPrice - entry;
      netPosition += remaining;
      totalBuy += remaining;
      sumBuy += remaining * entry;
    } else {
      diff = entry - currentPrice;
      netPosition -= remaining;
      totalSell += remaining;
      sumSell += remaining * entry;
    }

    let gross = diff * sym.contract * remaining;
    let spreadCost = sym.spread * remaining;

    // تصحيح العملات غير المقومة بالدولار
    if (isNonUsdPair(symKey)) {
      gross = gross / currentPrice;
      spreadCost = spreadCost / currentPrice;
    }

    const commission = (sym.commission || 0) * remaining * 2;
    const pl = gross - spreadCost - commission;
    const notional = sym.contract * remaining * entry;

    totalFloating += pl;
    totalRealized += realized;
    totalNotional += notional;

    selected.push({
      type, lot: remaining, origLot, entry,
      exit: currentPrice, pl, realized, closed: false,
      notional, index: i, closeDetails
    });
  }

  return {
    selected, netPosition, totalBuy, totalSell,
    sumBuy, sumSell, totalFloating, totalRealized,
    totalNotional
  };
}

// ═══════════════════════════════════════════════════════════
// حساب Net Margin الكامل
// ═══════════════════════════════════════════════════════════
function calculateNetMargin() {
  const symbolKey = str("symbol").toUpperCase();
  const sym = SYMBOLS[symbolKey];
  if (!sym) { alert("رمز غير معروف"); return; }

  const balance = val("balance");
  const leverage = val("leverage");
  const stopOutPct = val("stopOut") / 100;
  const currentPrice = val("price");
  const digits = sym.digits;
  const balanceMode = $("balanceMode") ? $("balanceMode").value : "balance";

  // جمع البيانات
  const data = collectSelectedTrades(sym, symbolKey, currentPrice);
  const {
    selected, netPosition, totalBuy, totalSell,
    sumBuy, sumSell, totalFloating, totalRealized, totalNotional
  } = data;

  if (selected.length === 0) {
    alert("حدد صفقة واحدة على الأقل");
    return;
  }

  const totalLot = totalBuy + totalSell;
  const avgBuy = totalBuy > 0 ? sumBuy / totalBuy : 0;
  const avgSell = totalSell > 0 ? sumSell / totalSell : 0;
  const avgEntry = totalLot > 0 ? (sumBuy + sumSell) / totalLot : currentPrice;

  const netLot = Math.abs(netPosition);
  let totalMargin = 0;
  if (netLot > 0) {
    if (symbolKey.toUpperCase().startsWith("USD")) {
      totalMargin = (sym.contract * netLot) / leverage;
    } else {
      totalMargin = (sym.contract * netLot * avgEntry) / leverage;
    }
  }

  // اختيار طريقة الحساب: رصيد / EQ / FM
  let adjustedEquity, newBalance, modeText;
  if (balanceMode === "equity") {
    adjustedEquity = balance;
    newBalance = adjustedEquity - totalFloating;
    modeText = "حقوق الملكية (Equity)";
  } else if (balanceMode === "fm") {
    adjustedEquity = balance + totalMargin + totalRealized;
    newBalance = adjustedEquity - totalFloating;
    modeText = "Free Margin (FM)";
  } else {
    newBalance = balance + totalRealized;
    adjustedEquity = newBalance + totalFloating;
    modeText = "الرصيد (Balance)";
  }

  const equityAtSO = totalMargin * stopOutPct;
  const freeMargin = adjustedEquity - totalMargin;
  const marginLevel = totalMargin > 0 ? (adjustedEquity / totalMargin) * 100 : 0;

  // حالة الهامش (عتبات الإصدار 32)
  let statusColor, statusText, marginColor;
  if (marginLevel >= 300) { statusColor = "safe"; statusText = "آمن"; marginColor = "🟢"; }
  else if (marginLevel >= 200) { statusColor = "safe"; statusText = "متوسط"; marginColor = "🟡"; }
  else if (marginLevel >= 150) { statusColor = "warning"; statusText = "خطر"; marginColor = "🟠"; }
  else if (marginLevel >= 100) { statusColor = "danger"; statusText = "خطر شديد"; marginColor = "🔴"; }
  else { statusColor = "danger"; statusText = "تصفير"; marginColor = "⚫"; }

  // قيمة النقطة لكل لوت (مع تصحيح العملات)
  let pointValuePerLot = sym.contract * sym.point;
  if (isNonUsdPair(symbolKey)) {
    pointValuePerLot = pointValuePerLot / currentPrice;
  }

  // سعر التصفير
  let liqPrice = currentPrice, pointsToSO = 0, directionText = "", changeText = "", maxLoss = 0, totalPointValue = 0;
  if (netPosition > 0) {
    totalPointValue = pointValuePerLot * Math.abs(netPosition);
    maxLoss = adjustedEquity - equityAtSO;
    if (totalPointValue > 0) {
      pointsToSO = maxLoss / totalPointValue;
      liqPrice = currentPrice - pointsToSO * sym.point;
    } else {
      liqPrice = avgEntry;
      pointsToSO = 0;
    }
    directionText = "صافي شراء";
    changeText = "انخفاض السعر المطلوب حتى التصفير";
  } else if (netPosition < 0) {
    totalPointValue = pointValuePerLot * Math.abs(netPosition);
    maxLoss = adjustedEquity - equityAtSO;
    if (totalPointValue > 0) {
      pointsToSO = maxLoss / totalPointValue;
      liqPrice = currentPrice + pointsToSO * sym.point;
    } else {
      liqPrice = avgEntry;
      pointsToSO = 0;
    }
    directionText = "صافي بيع";
    changeText = "ارتفاع السعر المطلوب حتى التصفير";
  } else {
    liqPrice = avgEntry;
    pointsToSO = Infinity;
    directionText = "مركز محايد";
    changeText = "لن يتم التصفير";
    totalPointValue = 0;
    maxLoss = 0;
  }

  const liqDisplay = (liqPrice < 0 || !isFinite(liqPrice))
    ? "لا يمكن التصفير (الرصيد كافٍ)"
    : liqPrice.toFixed(digits);

  // سعر التعادل
  let breakEven = currentPrice;
  if (netPosition !== 0) {
    const buyValue = selected.filter(t => t.type === "buy" && !t.closed)
      .reduce((s, t) => s + t.lot * t.entry, 0);
    const sellValue = selected.filter(t => t.type === "sell" && !t.closed)
      .reduce((s, t) => s + t.lot * t.entry, 0);
    breakEven = (buyValue - sellValue) / netPosition;
  }

  const distanceToBE = currentPrice - breakEven;
  const distanceToBEPoints = sym.point !== 0 ? distanceToBE / sym.point : 0;

  let distanceToLiq = 0;
  if (netPosition > 0) distanceToLiq = currentPrice - liqPrice;
  else if (netPosition < 0) distanceToLiq = liqPrice - currentPrice;
  const distanceToLiqPoints = sym.point !== 0 ? distanceToLiq / sym.point : 0;

  let safetyRatio = 0;
  if (liqPrice !== 0 && distanceToLiq >= 0 && Math.abs(liqPrice) > 0) {
    safetyRatio = (distanceToLiq / Math.abs(liqPrice)) * 100;
  }

  // بناء النص
  let out = "";
  out += `══════════════════════════════════════════\n`;
  out += `  حساب Net Margin - T_1 (الإصدار ${VERSION})\n`;
  out += `══════════════════════════════════════════\n`;
  out += `${marginColor} مستوى الهامش : ${marginLevel.toFixed(1)}%  (${statusText})\n`;
  out += `★★★ سعر التصفير : ${liqDisplay} ★★★\n`;
  out += `──────────────────────────────────────────\n`;
  out += `الرمز          : ${symbolKey}\n`;
  out += `السعر الحالي   : ${currentPrice.toFixed(digits)}\n`;
  out += `طريقة الحساب   : ${modeText}\n`;
  out += `الرصيد         : ${balance.toFixed(2)} USD\n`;
  out += `الخسارة العائمة: ${totalFloating >= 0 ? "+" : ""}${totalFloating.toFixed(2)} USD\n`;
  out += `الربح المحقق   : ${totalRealized >= 0 ? "+" : ""}${totalRealized.toFixed(2)} USD\n`;
  out += `──────────────────────────────────────────\n`;
  out += `حقوق الملكية   : ${adjustedEquity.toFixed(2)} USD\n`;
  out += `الرافعة        : 1:${leverage.toFixed(0)}\n`;
  out += `نسبة Stop Out  : ${(stopOutPct * 100).toFixed(0)}%\n`;
  out += `الهامش المستخدم: ${totalMargin.toFixed(2)} USD\n`;
  out += `الهامش الحر    : ${freeMargin.toFixed(2)} USD\n`;
  out += `الرصيد الجديد  : ${newBalance.toFixed(2)} USD\n`;
  out += `القيمة الأصلية : ${totalNotional.toFixed(2)} USD\n`;
  out += `──────────────────────────────────────────\n`;
  out += `التحليل الكمي:\n`;
  out += `صافي المركز    : ${netPosition >= 0 ? "+" : ""}${netPosition.toFixed(2)} لوت (${directionText})\n`;
  out += `⚖️ سعر التعادل : ${breakEven.toFixed(digits)}\n`;
  out += `إجمالي الشراء  : ${totalBuy.toFixed(2)} (متوسط ${avgBuy.toFixed(digits)})\n`;
  out += `إجمالي البيع   : ${totalSell.toFixed(2)} (متوسط ${avgSell.toFixed(digits)})\n`;
  out += `متوسط الدخول   : ${avgEntry.toFixed(digits)}\n`;
  out += `──────────────────────────────────────────\n`;
  out += `تفاصيل الصفقات (${selected.length}):\n`;
  out += `──────────────────────────────────────────\n`;
  selected.forEach(t => {
    if (t.closed) {
      out += `[مغلقة] T_${t.index} | ${t.origLot.toFixed(2)} لوت | ربح محقق: ${t.realized >= 0 ? "+" : ""}${t.realized.toFixed(2)}\n`;
    } else {
      const typeAr = t.type === "buy" ? "شراء" : "بيع";
      out += `[${typeAr}] T_${t.index} | ${t.lot.toFixed(2)} لوت\n`;
      out += `         ${t.entry.toFixed(digits)} -> ${t.exit.toFixed(digits)}\n`;
      out += `         الربح: ${t.pl >= 0 ? "+" : ""}${t.pl.toFixed(2)} | القيمة: ${t.notional.toFixed(2)}\n`;
    }
    if (t.closeDetails && t.closeDetails.length) {
      t.closeDetails.forEach(c => {
        out += `      └─ ${c.type}: ${c.lot.toFixed(2)} @ ${c.price.toFixed(digits)} | ${c.profit >= 0 ? "+" : ""}${c.profit.toFixed(2)}\n`;
      });
    }
  });
  out += `──────────────────────────────────────────\n`;
  if (totalRealized !== 0) {
    out += `💰 إجمالي الربح المحقق : ${totalRealized >= 0 ? "+" : ""}${totalRealized.toFixed(2)} USD\n`;
  }
  out += `📊 مؤشرات المخاطر:\n`;
  const liqInd = distanceToLiqPoints > 10000 ? "🟢" : (distanceToLiqPoints > 5000 ? "🟡" : "🔴");
  const beInd = distanceToBEPoints > 1000 ? "🟢" : (distanceToBEPoints > 500 ? "🟡" : "🟠");
  out += `${liqInd} المسافة إلى التصفير : ${Math.abs(distanceToLiqPoints).toFixed(0)} نقطة\n`;
  out += `🟢 نسبة الأمان : ${safetyRatio.toFixed(1)}%\n`;
  out += `${beInd} المسافة إلى التعادل : ${distanceToBEPoints.toFixed(0)} نقطة\n`;
  out += `──────────────────────────────────────────\n`;
  out += `حساب التصفير:\n`;
  out += `حقوق الملكية عند SO : ${equityAtSO.toFixed(2)} USD\n`;
  out += `الخسارة القصوى      : ${maxLoss.toFixed(2)} USD\n`;
  out += `${changeText} : ${Math.abs(pointsToSO * sym.point).toFixed(2)} USD\n`;
  out += `عدد النقاط حتى التصفير : ${isFinite(pointsToSO) ? Math.abs(pointsToSO).toFixed(0) : "∞"} نقطة\n`;
  out += `══════════════════════════════════════════\n`;

  const box = $("resultBox");
  box.textContent = out;
  box.className = statusColor;

  // الانتقال لتبويب النتيجة
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
  document.querySelector('[data-tab="result"]').classList.add("active");
  $("tab-result").classList.add("active");
}

// ═══════════════════════════════════════════════════════════
// أزرار التحديد
// ═══════════════════════════════════════════════════════════
$("selectAll").addEventListener("click", () => {
  for (let i = 1; i <= NUM_TRADES; i++) $(`check_${i}`).checked = true;
});

$("deselectAll").addEventListener("click", () => {
  for (let i = 1; i <= NUM_TRADES; i++) $(`check_${i}`).checked = false;
});

// أزرار الحساب
$("calcBtn").addEventListener("click", calculateNetMargin);
$("calcBtn2").addEventListener("click", calculateNetMargin);

// ═══════════════════════════════════════════════════════════
// الحفظ والتحميل (localStorage — يعمل Offline)
// ═══════════════════════════════════════════════════════════
$("saveBtn").addEventListener("click", () => {
  const data = {
    version: VERSION,
    time: new Date().toISOString(),
    general: {
      symbol: str("symbol"),
      price: str("price"),
      balance: str("balance"),
      leverage: str("leverage"),
      stopOut: str("stopOut"),
      balanceMode: $("balanceMode") ? $("balanceMode").value : "balance"
    },
    trades: []
  };

  for (let i = 1; i <= NUM_TRADES; i++) {
    data.trades.push({
      index: i,
      type: $(`type_${i}`).value,
      lot: $(`lot_${i}`).value,
      entry: $(`entry_${i}`).value,
      c1lot: $(`c1lot_${i}`).value,
      c1price: $(`c1price_${i}`).value,
      checked: $(`check_${i}`).checked
    });
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  alert("تم الحفظ على الجهاز");
});

$("loadBtn").addEventListener("click", () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) { alert("لا يوجد بيانات محفوظة"); return; }

  try {
    const data = JSON.parse(raw);
    const g = data.general || {};
    $("symbol").value = g.symbol || "USTEC";
    $("price").value = g.price || "30000.00";
    $("balance").value = g.balance || "20000";
    $("leverage").value = g.leverage || "100";
    $("stopOut").value = g.stopOut || "50";
    if ($("balanceMode") && g.balanceMode) $("balanceMode").value = g.balanceMode;

    (data.trades || []).forEach(t => {
      const i = t.index;
      if (i < 1 || i > NUM_TRADES) return;
      $(`type_${i}`).value = t.type || "buy";
      $(`lot_${i}`).value = t.lot || "1.00";
      $(`entry_${i}`).value = t.entry || "30000.00";
      $(`c1lot_${i}`).value = t.c1lot || "";
      $(`c1price_${i}`).value = t.c1price || "";
      $(`check_${i}`).checked = t.checked || false;
    });

    updateSymbolInfo();
    alert("تم التحميل");
  } catch (e) {
    alert("فشل التحميل");
  }
});

// ═══════════════════════════════════════════════════════════
// Service Worker (للعمل Offline)
// ═══════════════════════════════════════════════════════════
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js")
    .catch(err => console.log("SW registration failed:", err));
}

// ═══════════════════════════════════════════════════════════
// التشغيل الأولي
// ═══════════════════════════════════════════════════════════
updateSymbolInfo();
