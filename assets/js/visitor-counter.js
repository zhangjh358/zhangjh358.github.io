(() => {
  const historicalPageViews = 1400;
  const sitePv = document.getElementById('busuanzi_site_pv');
  const siteUv = document.getElementById('busuanzi_site_uv');
  if (!sitePv && !siteUv) return;

  const render = (pv, uv) => {
    if (sitePv && pv != null) sitePv.textContent = historicalPageViews + Number(pv);
    if (siteUv && uv != null) siteUv.textContent = uv;
  };

  const fallback = () => {
    const callback = `BusuanziFallback_${Date.now()}`;
    const script = document.createElement('script');
    const timer = window.setTimeout(() => {
      script.remove();
      delete window[callback];
      render('暂不可用', '暂不可用');
    }, 8000);

    window[callback] = (data) => {
      window.clearTimeout(timer);
      render(data.site_pv, data.site_uv);
      script.remove();
      delete window[callback];
    };
    script.onerror = () => {
      window.clearTimeout(timer);
      render('暂不可用', '暂不可用');
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
      render(data.busuanzi_site_pv, data.busuanzi_site_uv);
      if (data.busuanzi_site_pv == null || data.busuanzi_site_uv == null) fallback();
    })
    .catch(() => {
      window.clearTimeout(timer);
      fallback();
    });
})();