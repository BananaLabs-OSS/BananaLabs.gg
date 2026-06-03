// Banana Labs — theme toggle (persisted) + live GitHub projects (hardcoded fallback).
// No libraries.

// --- Theme toggle (persists to localStorage; <head> init script avoids flash) ---
function toggleTheme() {
  var r = document.documentElement;
  var next = r.dataset.theme === 'dark' ? 'light' : 'dark';
  r.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch (e) {}
}
window.toggleTheme = toggleTheme;

// --- Live projects from the GitHub org ---------------------------------------
// Reads the public, unauthenticated org repos endpoint (rate-limited ~60/hr,
// fine for a marketing page). On ANY failure — rate limit, network, empty —
// the hardcoded directory listing already rendered in index.html stays put.
(function () {
  var ORG = 'bananalabs-oss';
  var API = 'https://api.github.com/orgs/' + ORG + '/repos?per_page=100&sort=updated';

  // Repos worth surfacing, in shelf order, with the curated one-liners from the
  // mock. Live data fills in real descriptions/languages when available; these
  // are the fallback copy and the canonical ordering.
  var ORDER = ['bananagine', 'peel', 'pulp', 'bananaauth', 'potassium', 'fiber', 'bunch', 'hand'];

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Map a GitHub primary language to one of the styled chip classes.
  function langChip(lang) {
    if (!lang) return '';
    var l = lang.toLowerCase();
    var cls =
      l === 'go' ? 'go' :
      (l === 'webassembly' || l === 'wasm') ? 'wasm' : '';
    var label = l === 'webassembly' ? 'WASM' : lang;
    return '<span class="chip ' + (cls || '') + '">' + esc(label) + '</span>';
  }

  function rowHTML(name, desc, lang, url) {
    return '' +
      '<a class="proj" href="' + esc(url) + '">' +
        '<div class="pname"><span class="fld">▸</span>' + esc(name) + '</div>' +
        '<div class="pdesc">' + esc(desc) + '</div>' +
        '<div class="pmeta">' + langChip(lang) + '<span class="chip mit">MIT</span></div>' +
      '</a>';
  }

  function render(repos) {
    var list = document.getElementById('projects-list');
    if (!list) return;

    // Index by name, then walk ORDER first (curated), then append any extras.
    var byName = {};
    repos.forEach(function (r) { byName[r.name.toLowerCase()] = r; });

    var seen = {};
    var rows = [];

    ORDER.forEach(function (n) {
      var r = byName[n];
      if (!r) return;
      seen[n] = true;
      rows.push(rowHTML(r.name, r.description || '', r.language, r.html_url));
    });
    repos.forEach(function (r) {
      var n = r.name.toLowerCase();
      if (seen[n] || r.fork || r.archived || n.charAt(0) === '.') return;
      rows.push(rowHTML(r.name, r.description || '', r.language, r.html_url));
    });

    if (!rows.length) return; // keep the hardcoded fallback

    list.innerHTML = rows.join('');
    var count = document.getElementById('proj-count');
    if (count) count.textContent = '# ' + rows.length + ' repositories';
  }

  function load() {
    fetch(API, { headers: { 'Accept': 'application/vnd.github+json' } })
      .then(function (res) {
        if (!res.ok) throw new Error('github ' + res.status);
        return res.json();
      })
      .then(function (data) {
        if (Array.isArray(data) && data.length) render(data);
        // else: leave the hardcoded list in place
      })
      .catch(function () { /* fall back to the hardcoded listing in index.html */ });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
