(function () {
  'use strict';
  var meta = function (n) { var m = document.querySelector('meta[name="' + n + '"]'); return m ? m.content : ''; };
  var CSRF = meta('csrf'), UPLOAD = meta('upload-url'), MEDIA = meta('media-url');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // Sidebar (mobile)
  var sb = $('#sidebar');
  $$('[data-menu]').forEach(function (b) { b.addEventListener('click', function () { sb.classList.toggle('open'); }); });
  document.addEventListener('click', function (e) {
    if (sb && sb.classList.contains('open') && !sb.contains(e.target) && !e.target.closest('[data-menu]')) sb.classList.remove('open');
  });

  // Toast auto-hide
  var toast = $('.toast');
  if (toast) setTimeout(function () { toast.style.transition = 'opacity .4s'; toast.style.opacity = '0'; setTimeout(function () { toast.remove(); }, 400); }, 3500);

  // Clickable rows
  $$('tr[data-href]').forEach(function (tr) {
    tr.addEventListener('click', function (e) {
      if (e.target.closest('a,button,form,input,select,.drag')) return;
      location.href = tr.getAttribute('data-href');
    });
  });

  // Table search
  $$('[data-table-search]').forEach(function (inp) {
    var table = inp.closest('.card').querySelector('table');
    var run = function () {
      var q = inp.value.trim().toLowerCase();
      $$('tbody tr', table).forEach(function (tr) { tr.hidden = q && tr.textContent.toLowerCase().indexOf(q) === -1; });
    };
    inp.addEventListener('input', run);
    run();
  });

  // Drag to reorder
  $$('table[data-sortable]').forEach(function (table) {
    var tbody = $('tbody', table), dragging = null;
    tbody.addEventListener('dragstart', function (e) {
      dragging = e.target.closest('tr');
      if (!dragging) return;
      dragging.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setDragImage(dragging, 20, 20); } catch (err) {}
    });
    tbody.addEventListener('dragover', function (e) {
      if (!dragging) return;
      e.preventDefault();
      var tr = e.target.closest('tr');
      if (!tr || tr === dragging) return;
      var r = tr.getBoundingClientRect();
      tbody.insertBefore(dragging, e.clientY < r.top + r.height / 2 ? tr : tr.nextSibling);
    });
    tbody.addEventListener('dragend', function () {
      if (!dragging) return;
      dragging.classList.remove('dragging');
      dragging = null;
      var fd = new FormData();
      fd.append('_csrf', CSRF); fd.append('op', 'reorder');
      $$('tr', tbody).forEach(function (tr) { fd.append('ids[]', tr.getAttribute('data-id')); });
      fetch('?view=' + encodeURIComponent(table.getAttribute('data-view')), { method: 'POST', body: fd, credentials: 'same-origin' });
    });
  });

  // ---------- Image processing & upload ----------
  function resize(file, max) {
    return new Promise(function (resolve) {
      if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return resolve(file);
      var img = new Image(), u = URL.createObjectURL(file);
      img.onload = function () {
        URL.revokeObjectURL(u);
        var w = img.naturalWidth, h = img.naturalHeight, s = Math.min(1, max / Math.max(w, h));
        if (s === 1 && file.size < 500 * 1024) return resolve(file);
        var c = document.createElement('canvas');
        c.width = Math.round(w * s); c.height = Math.round(h * s);
        var ctx = c.getContext('2d');
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, c.width, c.height);
        c.toBlob(function (blob) {
          if (!blob || blob.type !== 'image/webp' || blob.size > file.size && s === 1) return resolve(file);
          resolve(new File([blob], file.name.replace(/\.\w+$/, '') + '.webp', { type: 'image/webp' }));
        }, 'image/webp', 0.86);
      };
      img.onerror = function () { URL.revokeObjectURL(u); resolve(file); };
      img.src = u;
    });
  }

  function upload(file, hint, onProgress) {
    return new Promise(function (resolve, reject) {
      var fd = new FormData();
      fd.append('_csrf', CSRF); fd.append('file', file); fd.append('hint', hint || file.name.replace(/\.\w+$/, ''));
      var x = new XMLHttpRequest();
      x.open('POST', UPLOAD);
      x.upload.onprogress = function (e) { if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total); };
      x.onload = function () {
        var r = {}; try { r = JSON.parse(x.responseText); } catch (e) {}
        if (x.status === 200 && r.path) resolve(r); else reject(r.error || 'Upload failed');
      };
      x.onerror = function () { reject('Network error'); };
      x.send(fd);
    });
  }

  function hintFor(el) {
    var id = el.getAttribute('data-hint');
    var src = id && document.getElementById(id);
    return src && src.value ? src.value : '';
  }

  // Library picker
  var modal = $('#lib-modal'), pickCb = null;
  function openLibrary(cb) {
    pickCb = cb;
    modal.hidden = false;
    var grid = $('[data-lib-grid]', modal);
    grid.innerHTML = '<p class="muted">Loading…</p>';
    fetch(MEDIA, { credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (list) {
      if (!list.length) { grid.innerHTML = '<p class="muted">No images uploaded yet.</p>'; return; }
      grid.innerHTML = '';
      list.forEach(function (f) {
        var fig = document.createElement('figure');
        fig.className = 'media-item';
        fig.innerHTML = '<img loading="lazy" alt=""><figcaption><span></span></figcaption>';
        fig.querySelector('img').src = f.url;
        fig.querySelector('span').textContent = f.name;
        fig.addEventListener('click', function () { modal.hidden = true; if (pickCb) pickCb(f); });
        grid.appendChild(fig);
      });
    });
  }
  if (modal) {
    modal.addEventListener('click', function (e) { if (e.target === modal || e.target.closest('[data-close-modal]')) modal.hidden = true; });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') modal.hidden = true; });
  }

  // Single image fields
  $$('[data-imgfield]').forEach(function (box) {
    var hidden = $('input[type=hidden]', box), file = $('input[type=file]', box), drop = $('.img-drop', box), img = $('img', drop), bar = $('.img-progress span', box);
    var max = parseInt(box.getAttribute('data-max'), 10) || 1600;
    var set = function (path, src) {
      hidden.value = path;
      img.src = src || ''; img.hidden = !src;
      box.classList.toggle('has', !!path);
      hidden.dispatchEvent(new Event('change', { bubbles: true }));
    };
    var handle = function (f) {
      if (!f || !/^image\//.test(f.type)) return alert('Please choose an image file.');
      box.classList.add('busy'); bar.style.width = '5%';
      var preview = URL.createObjectURL(f); img.src = preview; img.hidden = false; box.classList.add('has');
      resize(f, max).then(function (r) { return upload(r, hintFor(box), function (p) { bar.style.width = Math.max(5, p * 100) + '%'; }); })
        .then(function (r) { set(r.path, r.url); })
        .catch(function (err) { alert(err); set(hidden.value, hidden.value ? img.getAttribute('data-orig') : ''); })
        .then(function () { box.classList.remove('busy'); bar.style.width = '0'; URL.revokeObjectURL(preview); });
    };
    img.setAttribute('data-orig', img.getAttribute('src') || '');
    drop.addEventListener('click', function () { file.click(); });
    drop.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); file.click(); } });
    $('[data-img-upload]', box).addEventListener('click', function () { file.click(); });
    $('[data-img-remove]', box).addEventListener('click', function () { set('', ''); });
    $('[data-img-library]', box).addEventListener('click', function () { openLibrary(function (f) { set(f.path, f.url); }); });
    file.addEventListener('change', function () { handle(file.files[0]); file.value = ''; });
    ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('over'); }); });
    ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('over'); }); });
    drop.addEventListener('drop', function (e) { handle(e.dataTransfer.files[0]); });
  });

  // Gallery fields
  $$('[data-gallery]').forEach(function (box) {
    var hidden = $('input[type=hidden]', box), file = $('input[type=file]', box), items = $('.g-items', box);
    var sync = function () {
      hidden.value = $$('.g-item[data-path]', items).map(function (i) { return i.getAttribute('data-path'); }).join('\n');
      hidden.dispatchEvent(new Event('change', { bubbles: true }));
    };
    var add = function (path, url) {
      var s = document.createElement('span');
      s.className = 'g-item'; s.setAttribute('data-path', path);
      s.innerHTML = '<img alt=""><button type="button" aria-label="Remove">×</button>';
      s.querySelector('img').src = url;
      items.appendChild(s);
      return s;
    };
    items.addEventListener('click', function (e) { if (e.target.closest('button')) { e.target.closest('.g-item').remove(); sync(); } });
    $('[data-g-add]', box).addEventListener('click', function () { file.click(); });
    file.addEventListener('change', function () {
      Array.prototype.forEach.call(file.files, function (f) {
        var ph = document.createElement('span'); ph.className = 'g-item loading'; ph.textContent = 'Uploading…'; items.appendChild(ph);
        resize(f, 1600).then(function (r) { return upload(r, hintFor(box)); })
          .then(function (r) { items.replaceChild(add(r.path, r.url), ph); sync(); })
          .catch(function (err) { ph.remove(); alert(err); });
      });
      file.value = '';
    });
  });

  // Markdown toolbar
  $$('.md-tools').forEach(function (bar) {
    var ta = document.getElementById(bar.getAttribute('data-md-for'));
    var insert = function (before, after, placeholder) {
      var s = ta.selectionStart, e = ta.selectionEnd, sel = ta.value.slice(s, e) || placeholder || '';
      ta.setRangeText(before + sel + (after || ''), s, e, 'end');
      ta.focus();
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    };
    bar.addEventListener('click', function (ev) {
      var b = ev.target.closest('button'); if (!b) return;
      var t = b.getAttribute('data-md');
      if (t === '**' || t === '*') insert(t, t, 'text');
      else if (t === 'link') { var u = prompt('Link URL (https://…)'); if (u) insert('[', '](' + u + ')', 'link text'); }
      else if (t === 'img') {
        var choose = document.createElement('input'); choose.type = 'file'; choose.accept = 'image/*';
        choose.onchange = function () {
          var f = choose.files[0]; if (!f) return;
          resize(f, 1600).then(function (r) { return upload(r, 'article-image'); })
            .then(function (r) { insert('\n\n![', '](' + r.path + ')\n\n', 'image description'); })
            .catch(function (err) { alert(err); });
        };
        choose.click();
      } else {
        var s = ta.value.lastIndexOf('\n', ta.selectionStart - 1) + 1;
        ta.setRangeText(t, s, s, 'end'); ta.focus();
      }
    });
  });

  // Settings tabs
  $$('.settings-tabs').forEach(function (tabs) {
    var form = tabs.closest('form'), input = $('[data-tab-input]', form);
    tabs.addEventListener('click', function (e) {
      var b = e.target.closest('[data-tab]'); if (!b) return;
      var k = b.getAttribute('data-tab');
      $$('[data-tab]', tabs).forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
      $$('[data-panel]', form).forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== k; });
      input.value = k;
      history.replaceState(null, '', '?view=settings&tab=' + k);
    });
    // Reveal the panel holding an invalid field so the browser can focus it
    form.addEventListener('invalid', function (e) {
      var p = e.target.closest('[data-panel]');
      if (p && p.hidden) $('[data-tab="' + p.getAttribute('data-panel') + '"]', tabs).click();
    }, true);
  });

  // Unsaved changes guard
  $$('form[data-dirty-guard]').forEach(function (f) {
    var dirty = false;
    f.addEventListener('input', function () { dirty = true; });
    f.addEventListener('change', function () { dirty = true; });
    f.addEventListener('submit', function () { dirty = false; });
    window.addEventListener('beforeunload', function (e) { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
  });

  // Media library page upload
  var mInput = $('[data-media-upload]'), mDrop = $('[data-media-drop]');
  var bulk = function (files) {
    var list = Array.prototype.filter.call(files, function (f) { return /^image\//.test(f.type); });
    if (!list.length) return;
    if (mDrop) mDrop.querySelector('p').textContent = 'Uploading ' + list.length + ' image(s)…';
    Promise.all(list.map(function (f) { return resize(f, 1800).then(function (r) { return upload(r); }); }))
      .catch(function (err) { alert(err); })
      .then(function () { location.reload(); });
  };
  if (mInput) mInput.addEventListener('change', function () { bulk(mInput.files); });
  if (mDrop) {
    ['dragenter', 'dragover'].forEach(function (ev) { document.addEventListener(ev, function (e) { e.preventDefault(); mDrop.classList.add('over'); }); });
    ['dragleave', 'drop'].forEach(function (ev) { document.addEventListener(ev, function (e) { e.preventDefault(); if (ev === 'drop' || e.target === document.documentElement) mDrop.classList.remove('over'); }); });
    document.addEventListener('drop', function (e) { bulk(e.dataTransfer.files); });
  }
})();
