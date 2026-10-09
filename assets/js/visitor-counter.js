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
  const dailyStateKey = 'visitor-counter-daily-state';

  const renderTotalAndToday = (total) => {
    const value = Number(total);
    if (!Number.isFinite(value)) return;
    render(value, null);
    let state;
    try {
      state = JSON.parse(localStorage.getItem(dailyStateKey));
    } catch (_) {
      state = null;
    }
    if (!state || state.date !== today || !Number.isFinite(state.baseTotal) || state.baseTotal > value) {
      state = { date: today, baseTotal: value };
    }
    localStorage.setItem(dailyStateKey, JSON.stringify(state));
    render(null, value - state.baseTotal + 1);
  };

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
      renderTotalAndToday(data.site_pv);
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
  const nextMidnight = Date.UTC(
    Number(datePart('year')),
    Number(datePart('month')) - 1,
    Number(datePart('day')) + 1
  ) - 8 * 60 * 60 * 1000;
  window.setTimeout(() => {
    localStorage.removeItem(dailyStateKey);
    render(null, 0);
  }, Math.max(0, nextMidnight - Date.now()));
})();