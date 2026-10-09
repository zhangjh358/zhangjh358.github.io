(() => {
  const historicalPageViews = 1400;
  const sitePv = document.getElementById('busuanzi_site_pv');
  const todayPv = document.getElementById('busuanzi_today_pv');
  if (!sitePv && !todayPv) return;

  const render = (pv, today) => {
    if (sitePv && pv != null) {
      const value = Number(pv);
      sitePv.textContent = Number.isFinite(value) ? historicalPageViews + value : pv;
    }
    if (todayPv && today != null) todayPv.textContent = today;
  };

  const dateParts = new Intl.DateTimeFormat('en', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const datePart = (type) => dateParts.find((part) => part.type === type).value;
  const today = `${datePart('year')}-${datePart('month')}-${datePart('day')}`;
  const todayCacheKey = `daily-page-views-${today}`;
  const cachedToday = Number(sessionStorage.getItem(todayCacheKey));
  render(null, Number.isFinite(cachedToday) && cachedToday > 0 ? cachedToday + 1 : 1);

  const loadTotalPageViews = () => {
    const callback = `BusuanziFallback_${Date.now()}`;
    const script = document.createElement('script');
    const timer = window.setTimeout(() => {
      script.remove();
      delete window[callback];
      render('暂不可用', null);
    }, 3000);

    window[callback] = (data) => {
      window.clearTimeout(timer);
      render(data.site_pv, null);
      script.remove();
      delete window[callback];
    };
    script.onerror = () => {
      window.clearTimeout(timer);
      render('暂不可用', null);
      script.remove();
      delete window[callback];
    };
    script.src = `https://busuanzi.ibruce.info/busuanzi?jsonpCallback=${callback}`;
    document.head.appendChild(script);
  };

  loadTotalPageViews();
  fetch(`https://counterapi.com/api/zhangjh358.github.io/view/daily-${today}?noFormatting=true`)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((data) => {
      render(null, data.value);
      sessionStorage.setItem(todayCacheKey, data.value);
    })
    .catch(() => {});
})();