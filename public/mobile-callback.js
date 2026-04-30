(function () {
  var logEl = document.getElementById('log');
  var statusEl = document.getElementById('status');

  function log(msg) {
    if (logEl) logEl.textContent += msg + '\n';
  }
  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg;
  }

  // Catch any error happening in this script (or anywhere on the page)
  window.addEventListener('error', function (event) {
    setStatus('❌ JS error — voir log');
    log('window.onerror: ' + (event && event.message ? event.message : 'unknown'));
  });

  setStatus('Script chargé, traitement...');
  log('Script bootstrapped at ' + new Date().toISOString());

  try {
    var href = window.location.href;
    var hash = window.location.hash;
    var search = window.location.search;

    log('href: ' + href);
    log('hash length: ' + hash.length);
    log('search: ' + search);
    log('UA: ' + navigator.userAgent);

    if (search && search.indexOf('error') !== -1) {
      setStatus('❌ Twitch a renvoyé une erreur — voir log ci-dessous.');
      return;
    }

    var payload = '';
    if (hash && hash.indexOf('access_token') !== -1) {
      payload = hash.charAt(0) === '#' ? hash.substring(1) : hash;
    } else if (search && search.indexOf('access_token') !== -1) {
      payload = search.charAt(0) === '?' ? search.substring(1) : search;
    }

    if (!payload) {
      setStatus("❌ Aucun access_token dans l'URL");
      log('ERROR: no access_token found');
      return;
    }

    var customSchemeUrl = 'com.streamquest.app://callback?' + payload;
    var isAndroid = /Android/i.test(navigator.userAgent);
    // Android intent:// URL with explicit package — most reliable through Chrome Custom Tabs
    var intentUrl =
      'intent://callback?' +
      payload +
      '#Intent;scheme=com.streamquest.app;package=com.streamquest.app;end';

    var primary = isAndroid ? intentUrl : customSchemeUrl;
    log('Primary redirect (truncated): ' + primary.substring(0, 120) + '...');

    var link = document.getElementById('open-link');
    if (link) {
      link.href = customSchemeUrl;
      link.style.display = 'inline-block';
    }
    setStatus('Ouverture de StreamQuest...');

    // Auto-redirect attempt
    window.location.href = primary;

    setTimeout(function () {
      setStatus("Si l'app ne s'est pas ouverte, tape sur le bouton ci-dessous :");
      log('Auto-redirect timeout — fallback shown.');
    }, 2500);
  } catch (e) {
    setStatus('❌ Erreur JS — voir log ci-dessous.');
    log('JS ERROR: ' + (e && e.message ? e.message : String(e)));
  }
})();
