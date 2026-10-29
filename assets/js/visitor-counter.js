(() => {
  const historicalPageViews = 1400;
  const namespace = 'zhangjh358-github-io';
  const sitePv = document.getElementById('busuanzi_site_pv');
  const todayPv = document.getElementById('busuanzi_today_pv');
  if (!sitePv && !todayPv) return;

  const dateParts = new Intl.DateTimeFormat('en', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const datePart = (type) => dateParts.find((part) => part.type === type).value;
  const today = `${datePart('year')}-${datePart('month')}-${datePart('day')}`;
  const totalCacheKey = 'visitor-counter-total';
  const dailyCacheKey = `visitor-counter-daily-${today}`;

  const readCache = (key) => {
    const raw = localStorage.getItem(key);
    if (raw == null) return null;
    const value = Number(raw);
    return Number.isFinite(value) && value >= 0 ? value : null;
  };
  const showTotal = (value) => {
    if (sitePv) sitePv.textContent = historicalPageViews + value;
  };
  const showToday = (value) => {
    if (todayPv) todayPv.textContent = value;
  };
  const cachedTotal = readCache(totalCacheKey);
  const cachedToday = readCache(dailyCacheKey);
  if (cachedTotal != null) showTotal(cachedTotal);
  if (cachedToday != null) showToday(cachedToday);

  const requestCounter = (url) => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 3500);
    return fetch(`${url}?t=${Date.now()}-${Math.random()}`, {
      cache: 'no-store',
      signal: controller.signal
    }).then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    }).then((data) => Number(data.value))
      .finally(() => window.clearTimeout(timer));
  };

  const increment = (key) => {
    const urls = [
      `https://abacus.jasoncameron.dev/hit/${namespace}/${key}`,
      `https://countapi.mileshilliard.com/api/v1/hit/${namespace}_${key}`
    ];
    return new Promise((resolve, reject) => {
      let failures = 0;
      urls.forEach((url) => requestCounter(url).then(resolve).catch((error) => {
        failures += 1;
        if (failures === urls.length) reject(error);
      }));
    });
  };

  increment('site-total').then((value) => {
    if (!Number.isFinite(value)) throw new Error('Invalid total count');
    const nextValue = Math.max(value, cachedTotal ?? 0);
    localStorage.setItem(totalCacheKey, nextValue);
    showTotal(nextValue);
  }).catch(() => {
    if (cachedTotal == null && sitePv) sitePv.textContent = '暂不可用';
  });

  increment(`site-daily-${today}`).then((value) => {
    if (!Number.isFinite(value)) throw new Error('Invalid daily count');
    const nextValue = Math.max(value, cachedToday ?? 0);
    localStorage.setItem(dailyCacheKey, nextValue);
    showToday(nextValue);
  }).catch(() => {
    if (cachedToday == null && todayPv) todayPv.textContent = '暂不可用';
  });

  const nextMidnight = Date.UTC(
    Number(datePart('year')),
    Number(datePart('month')) - 1,
    Number(datePart('day')) + 1
  ) - 8 * 60 * 60 * 1000;
  window.setTimeout(() => {
    localStorage.removeItem(dailyCacheKey);
    showToday(0);
  }, Math.max(0, nextMidnight - Date.now()));
})();
