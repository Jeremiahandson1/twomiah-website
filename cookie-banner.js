(function() {
  if (localStorage.getItem('twomiah_cookie_consent')) return;

  var banner = document.createElement('div');
  banner.id = 'cookieBanner';
  banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:9999;background:#1A1A1A;border-top:1px solid rgba(255,255,255,0.08);padding:16px 32px;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;font-family:Barlow,sans-serif;font-size:13px;color:rgba(255,255,255,0.55);line-height:1.6;box-shadow:0 -4px 20px rgba(0,0,0,0.4)';

  banner.innerHTML = '<span>We use essential cookies to make our services work and analytics cookies to improve your experience. See our <a href="/cookies.html" style="color:#FF6D00;text-decoration:none">Cookie Policy</a> for details.</span>'
    + '<span style="display:flex;gap:10px;flex-shrink:0">'
    + '<button id="cookieReject" style="background:transparent;border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.6);padding:8px 18px;border-radius:3px;cursor:pointer;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;font-family:Barlow,sans-serif">Reject Non-Essential</button>'
    + '<button id="cookieAccept" style="background:#FF3D00;border:none;color:#fff;padding:8px 18px;border-radius:3px;cursor:pointer;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;font-family:Barlow,sans-serif">Accept All</button>'
    + '</span>';

  document.body.appendChild(banner);

  document.getElementById('cookieAccept').onclick = function() {
    localStorage.setItem('twomiah_cookie_consent', 'all');
    banner.remove();
  };
  document.getElementById('cookieReject').onclick = function() {
    localStorage.setItem('twomiah_cookie_consent', 'essential');
    banner.remove();
  };
})();
