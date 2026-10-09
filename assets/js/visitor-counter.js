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

  const markTodayUnavailable = () => {
    if (todayPv) todayPv.textContent = '暂不可用';
  };

  const fallback = () => {
    const callback = `BusuanziFallback_${Date.now()}`;
    const script = document.createElement('script');
    const timer = window.setTimeout(() => {
      script.remove();
      delete window[callback];
      render('暂不可用', null);
      markTodayUnavailable();
    }, 8000);

    window[callback] = (data) => {
      window.clearTimeout(timer);
      render(data.site_pv, null);
      markTodayUnavailable();
      script.remove();
      delete window[callback];
    };
    script.onerror = () => {
      window.clearTimeout(timer);
      render('暂不可用', null);
      markTodayUnavailable();
      script.remove();
      delete window[callback];
    };
    script.src = `https://busuanzi.ibruce.info/busuanzi?jsonpCallback=${callback}`;
    document.head.appendChild(script);
  };

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 4500);
  fetch('https://cdn.busuanzi.cc/api.php', {
    method: 'POST',
    body: JSON.stringify({ url: location.href, referrer: document.referrer }),
    signal: controller.signal
  })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((data) => {
      window.clearTimeout(timer);
      render(data.busuanzi_site_pv, data.busuanzi_today_pv);
      if (data.busuanzi_site_pv == null || data.busuanzi_today_pv == null) fallback();
    })
    .catch(() => {
      window.clearTimeout(timer);
      fallback();
    });
})();