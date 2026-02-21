(function() {
  var stored = localStorage.getItem('theme');
  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  var dark = stored === 'dark' || (!stored && prefersDark);
  document.documentElement.classList.toggle('dark', dark);
})();
