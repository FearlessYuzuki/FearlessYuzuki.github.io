// ========================================
// Komorebi — Main JavaScript
// 木漏れ日
// ========================================

document.addEventListener('DOMContentLoaded', function () {

  // ---- Clock ----
  var clockTime = document.getElementById('clock-time');
  var clockDate = document.getElementById('clock-date');

  function updateClock() {
    var now = new Date();
    var hours = String(now.getHours()).padStart(2, '0');
    var minutes = String(now.getMinutes()).padStart(2, '0');
    var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (clockTime) clockTime.textContent = hours + ':' + minutes;
    if (clockDate) clockDate.textContent = days[now.getDay()] + ' ' + months[now.getMonth()] + ' ' + now.getDate();
  }

  updateClock();
  setInterval(updateClock, 10000);

  // ---- Gallery Slider ----
  var galleryTrack = document.querySelector('.gallery-track');
  var galleryPrev = document.querySelector('.gallery-prev');
  var galleryNext = document.querySelector('.gallery-next');

  if (galleryTrack && galleryPrev && galleryNext) {
    var galleryPosition = 0;
    var itemWidth = 216; // 200px + 16px gap
    var visibleItems = Math.floor(galleryTrack.parentElement.offsetWidth / itemWidth);
    var maxPosition = Math.max(0, (galleryTrack.children.length - visibleItems) * itemWidth);

    function updateGallery() {
      galleryTrack.style.transform = 'translateX(-' + galleryPosition + 'px)';
    }

    galleryNext.addEventListener('click', function() {
      galleryPosition = Math.min(galleryPosition + itemWidth * 2, maxPosition);
      updateGallery();
    });

    galleryPrev.addEventListener('click', function() {
      galleryPosition = Math.max(galleryPosition - itemWidth * 2, 0);
      updateGallery();
    });

    // Auto-slide
    var galleryAutoSlide = setInterval(function() {
      if (galleryPosition >= maxPosition) {
        galleryPosition = 0;
      } else {
        galleryPosition += itemWidth;
      }
      updateGallery();
    }, 4000);

    // Pause on hover
    galleryTrack.addEventListener('mouseenter', function() {
      clearInterval(galleryAutoSlide);
    });

    galleryTrack.addEventListener('mouseleave', function() {
      galleryAutoSlide = setInterval(function() {
        if (galleryPosition >= maxPosition) {
          galleryPosition = 0;
        } else {
          galleryPosition += itemWidth;
        }
        updateGallery();
      }, 4000);
    });
  }

  // ---- Language Switcher ----
  var langOptions = document.querySelectorAll('.topbar-lang-option');
  var langCurrent = document.querySelector('.lang-current');

  if (langOptions.length && langCurrent) {
    // Detect current language from URL
    var currentPath = window.location.pathname;
    var currentLang = currentPath.indexOf('/zh-CN') === 0 ? 'zh-CN' : 'en';

    // Set active state
    langOptions.forEach(function(opt) {
      if (opt.dataset.lang === currentLang) {
        opt.classList.add('active');
      }
    });

    langCurrent.textContent = currentLang === 'zh-CN' ? 'CN' : 'EN';

    // Click toggle (hover only works on desktop; mobile has no hover)
    var langWrap = document.querySelector('.topbar-lang');
    var langToggle = document.querySelector('.topbar-lang-toggle');
    if (langWrap && langToggle) {
      langToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        langWrap.classList.toggle('open');
      });
      document.addEventListener('click', function (e) {
        if (!langWrap.contains(e.target)) langWrap.classList.remove('open');
      });
    }

    langOptions.forEach(function(option) {
      option.addEventListener('click', function(e) {
        e.preventDefault();
        var targetLang = this.dataset.lang;
        var path = window.location.pathname;

        localStorage.setItem('preferred-lang', targetLang);

        // Normalize target path: only add /zh-CN when switching INTO
        // Chinese, only strip it when switching OUT.
        var isZh = path.indexOf('/zh-CN') === 0;
        var targetPath;
        if (targetLang === 'zh-CN') {
          targetPath = isZh ? path : '/zh-CN' + (path === '/' ? '/' : path);
        } else {
          targetPath = isZh ? path.replace(/^\/zh-CN/, '') || '/' : path;
        }

        // If we're already on the target language, just reload
        if (targetPath === path) {
          window.location.reload();
          return;
        }

        // Use fetch to check if route exists, fallback to root
        fetch(targetPath, { method: 'HEAD' }).then(function(res) {
          if (res.ok) {
            window.location.href = targetPath;
          } else {
            // Fallback: go to language root
            window.location.href = targetLang === 'zh-CN' ? '/zh-CN/' : '/';
          }
        }).catch(function() {
          window.location.href = targetLang === 'zh-CN' ? '/zh-CN/' : '/';
        });
      });
    });
  }

  // ---- Theme Toggle (Day/Night) ----
  var themeToggle = document.querySelector('.theme-toggle');

  function getPreferredTheme() {
    var stored = localStorage.getItem('theme');
    if (stored) return stored;
    // Dark is the default theme — only an explicit stored choice overrides it
    return 'dark';
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  // Apply saved theme on load
  setTheme(getPreferredTheme());

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme') || 'dark';
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // ---- Terminal Tabs ----
  var terminalTabBtns = document.querySelectorAll('.terminal-tab-btn');
  var terminalTabs = document.querySelectorAll('.terminal-tab');

  if (terminalTabBtns.length) {
    terminalTabBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var targetTab = this.dataset.tab;

        // Update button states
        terminalTabBtns.forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');

        // Update tab content
        terminalTabs.forEach(function(tab) { tab.classList.remove('active'); });
        var target = document.getElementById('tab-' + targetTab);
        if (target) target.classList.add('active');
      });
    });
  }

  // ---- ISO Disc View Toggle ----
  var isoViewBtns = document.querySelectorAll('.iso-disc-view-btn');
  var isoViews = document.querySelectorAll('.iso-file-list, .iso-file-grid');

  if (isoViewBtns.length) {
    isoViewBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var targetView = this.dataset.view;

        // Update button states
        isoViewBtns.forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');

        // Update view content
        isoViews.forEach(function(v) { v.classList.remove('active'); });
        var target = document.getElementById('view-' + targetView);
        if (target) target.classList.add('active');
      });
    });
  }

  // ---- Scroll Animation (IntersectionObserver) ----
  var animateElements = document.querySelectorAll('.animate-in');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    animateElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: show all elements immediately
    animateElements.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // ---- Smooth scroll (Hyprland-style: easeOutQuint, ~500ms) ----
  function smoothScrollTo(targetY) {
    var startY = window.scrollY;
    var diff = targetY - startY;
    if (Math.abs(diff) < 2) return;
    var duration = 500;
    var startTime = null;

    function easeOutQuint(t) {
      return 1 - Math.pow(1 - t, 5);
    }

    function step(ts) {
      if (startTime === null) startTime = ts;
      var t = Math.min((ts - startTime) / duration, 1);
      window.scrollTo(0, startY + diff * easeOutQuint(t));
      if (t < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  // ---- Back to Top ----
  var backToTop = document.querySelector('.back-to-top');

  if (backToTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 300) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });

    backToTop.addEventListener('click', function () {
      smoothScrollTo(0);
    });
  }

  // ---- Search (local, over /search.json) ----
  var searchOverlay = document.getElementById('search-overlay');
  var searchInput = document.getElementById('search-input');
  var searchResults = document.getElementById('search-results');
  var searchEmpty = document.getElementById('search-empty');
  var searchCloseBtn = document.querySelector('.search-close');
  var searchIndex = null;
  var searchIndexLoaded = false;
  var searchEmptyText = searchEmpty ? searchEmpty.textContent : '';
  var searchFirstText = searchEmpty ? searchEmpty.getAttribute('data-first') || 'Loading index…' : '';

  // Use the in-language index so result links stay on the same language
  var searchIndexPath = window.location.pathname.indexOf('/zh-CN') === 0 ? '/zh-CN/search.json' : '/search.json';

  function loadSearchIndex() {
    if (searchIndexLoaded) return;
    searchIndexLoaded = true;
    fetch(searchIndexPath).then(function (res) {
      return res.json();
    }).then(function (data) {
      searchIndex = data || [];
      // Index arrived while the user was already typing — re-run
      var q = searchInput ? searchInput.value : '';
      if (q.trim()) runSearch(q);
    }).catch(function () {
      searchIndex = [];
    });
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function highlight(text, tokens) {
    var lower = text.toLowerCase();
    var out = '';
    var last = 0;
    tokens.forEach(function (t) {
      var idx = lower.indexOf(t, last);
      if (idx < 0) return;
      out += escapeHtml(text.slice(last, idx));
      out += '<mark>' + escapeHtml(text.slice(idx, idx + t.length)) + '</mark>';
      last = idx + t.length;
    });
    out += escapeHtml(text.slice(last));
    return out;
  }

  function runSearch(query) {
    if (!searchResults || !searchEmpty) return;
    searchResults.innerHTML = '';
    var q = (query || '').trim().toLowerCase();
    if (!q) {
      searchEmpty.style.display = 'none';
      return;
    }
    var tokens = q.split(/\s+/).filter(Boolean);

    if (!searchIndex) {
      // Index still loading — show the "first search" hint instead of
      // a misleading "no results"
      searchEmpty.style.display = 'block';
      searchEmpty.textContent = searchFirstText;
      return;
    }

    var hits = [];

    if (searchIndex) {
      searchIndex.forEach(function (p) {
        var title = (p.title || '').toLowerCase();
        var tags = (p.tags || []).join(' ').toLowerCase();
        var cats = (p.categories || []).join(' ').toLowerCase();
        var content = (p.content || '').toLowerCase();
        var score = 0;
        var matched = true;
        tokens.forEach(function (t) {
          if (title.indexOf(t) >= 0) score += 100;
          if (tags.indexOf(t) >= 0) score += 30;
          if (cats.indexOf(t) >= 0) score += 20;
          if (content.indexOf(t) >= 0) {
            score += 5;
          } else {
            matched = false;
          }
        });
        if (matched && score > 0) hits.push({ post: p, score: score, content: content });
      });
    }

    hits.sort(function (a, b) { return b.score - a.score; });
    hits = hits.slice(0, 20);

    if (!hits.length) {
      searchEmpty.style.display = 'block';
      searchEmpty.textContent = searchEmptyText;
      return;
    }
    searchEmpty.style.display = 'none';

    hits.forEach(function (hit) {
      var p = hit.post;
      var a = document.createElement('a');
      a.className = 'search-result-item';
      a.href = p.path;

      var ci = hit.content.indexOf(tokens[0]);
      var snippet;
      if (ci < 0) {
        snippet = (p.content || '').slice(0, 90);
      } else {
        var start = Math.max(0, ci - 40);
        snippet = (start > 0 ? '…' : '') + (p.content || '').slice(start, ci + 60) + '…';
      }

      var dateSpan = document.createElement('span');
      dateSpan.className = 'search-result-date';
      dateSpan.textContent = p.date || '';

      var body = document.createElement('span');
      body.className = 'search-result-body';

      var title = document.createElement('span');
      title.className = 'search-result-title';
      title.innerHTML = highlight(p.title || '', tokens);
      body.appendChild(title);

      if (p.categories && p.categories.length) {
        var cat = document.createElement('span');
        cat.className = 'search-result-cat';
        cat.textContent = p.categories[0];
        body.appendChild(cat);
      }

      var snip = document.createElement('span');
      snip.className = 'search-result-snippet';
      snip.innerHTML = highlight(snippet, tokens);
      body.appendChild(snip);

      a.appendChild(dateSpan);
      a.appendChild(body);
      searchResults.appendChild(a);
    });
  }

  function openSearch() {
    if (!searchOverlay) return;
    searchOverlay.classList.add('active');
    document.body.classList.add('search-open');
    loadSearchIndex();
    if (searchInput) {
      searchInput.value = '';
      runSearch('');
      searchInput.focus();
    }
  }

  function closeSearch() {
    if (!searchOverlay) return;
    searchOverlay.classList.remove('active');
    document.body.classList.remove('search-open');
  }

  // Topbar search icon
  var searchToggle = document.querySelector('.topbar-search-toggle');
  if (searchToggle) {
    searchToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      openSearch();
    });
  }

  // "Tag Search" nav item on the homepage terminal
  document.querySelectorAll('.terminal-nav-search').forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      openSearch();
    });
  });

  if (searchCloseBtn) {
    searchCloseBtn.addEventListener('click', closeSearch);
  }
  if (searchOverlay) {
    searchOverlay.addEventListener('click', function (e) {
      if (e.target === searchOverlay) closeSearch();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeSearch();
  });
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      runSearch(this.value);
    });
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var first = searchResults.querySelector('.search-result-item');
        if (first) window.location.href = first.getAttribute('href');
      }
    });
  }

  // ---- Code Copy Button ----
  var codeBlocks = document.querySelectorAll('pre');

  codeBlocks.forEach(function (block) {
    // Add copy button
    var copyBtn = document.createElement('button');
    copyBtn.className = 'code-copy';
    copyBtn.textContent = 'Copy';
    copyBtn.type = 'button';
    block.style.position = 'relative';
    block.appendChild(copyBtn);

    copyBtn.addEventListener('click', function () {
      var code = block.querySelector('code');
      var text = code ? code.textContent : block.textContent;

      function copied() {
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        setTimeout(function () {
          copyBtn.textContent = 'Copy';
          copyBtn.classList.remove('copied');
        }, 2000);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(copied);
      } else {
        // Fallback for non-secure contexts / older browsers
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand('copy');
          copied();
        } catch (e) { /* copy failed — leave the button as-is */ }
        document.body.removeChild(ta);
      }
    });
  });

  // ---- E-mail icon: centered modal with addresses (click outside /
  // close button / Escape to dismiss), instead of opening a mail client ----
  var emailLinks = document.querySelectorAll('a.social-link[href^="mailto:"]');
  var komorebiEmails = (window.komorebiConfig && window.komorebiConfig.emails) || [];

  if (emailLinks.length && komorebiEmails.length) {
    var emailModal = document.createElement('div');
    emailModal.className = 'email-modal';
    emailModal.setAttribute('role', 'dialog');
    emailModal.setAttribute('aria-modal', 'true');
    emailModal.setAttribute('aria-label', 'Email');

    var emailPanel = document.createElement('div');
    emailPanel.className = 'email-panel';

    // Window-style title bar with a close button
    var emailBar = document.createElement('div');
    emailBar.className = 'email-bar';
    emailBar.innerHTML =
      '<div class="window-dots"><span class="dot dot-close"></span><span class="dot dot-min"></span><span class="dot dot-max"></span></div>' +
      '<span class="email-title"><i class="fas fa-envelope"></i> Email</span>' +
      '<button type="button" class="email-close" aria-label="Close"><i class="fas fa-times"></i></button>';
    emailPanel.appendChild(emailBar);

    var emailList = document.createElement('div');
    emailList.className = 'email-list';
    komorebiEmails.forEach(function (addr) {
      var row = document.createElement('button');
      row.type = 'button';
      row.className = 'email-item';
      row.textContent = addr;
      row.addEventListener('click', function () {
        function copied() {
          row.textContent = addr + ' ✓';
          row.classList.add('copied');
          setTimeout(function () {
            row.textContent = addr;
            row.classList.remove('copied');
          }, 1500);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(addr).then(copied);
        } else {
          var ta = document.createElement('textarea');
          ta.value = addr;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); copied(); } catch (e) { /* ignore */ }
          document.body.removeChild(ta);
        }
      });
      emailList.appendChild(row);
    });
    emailPanel.appendChild(emailList);
    emailModal.appendChild(emailPanel);
    document.body.appendChild(emailModal);

    function openEmailModal() {
      emailModal.classList.add('active');
      document.body.classList.add('search-open');
    }
    function closeEmailModal() {
      emailModal.classList.remove('active');
      document.body.classList.remove('search-open');
    }

    emailLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        openEmailModal();
      });
    });

    emailModal.querySelector('.email-close').addEventListener('click', closeEmailModal);
    emailModal.addEventListener('click', function (e) {
      if (e.target === emailModal) closeEmailModal(); // backdrop click
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeEmailModal();
    });
  }

  // ---- Profile Card: GitHub repos ----
  var profileCard = document.getElementById('profile-card');
  var reposList = document.getElementById('profile-repos-list');

  if (profileCard && reposList) {
    var githubUser = profileCard.getAttribute('data-github');

    fetch('https://api.github.com/users/' + githubUser + '/repos?sort=updated&per_page=5&type=owner')
      .then(function (res) {
        if (!res.ok) throw new Error('GitHub API ' + res.status);
        return res.json();
      })
      .then(function (repos) {
        if (!repos || !repos.length) {
          reposList.innerHTML = '<li class="profile-repos-loading">暂无公开项目</li>';
          return;
        }
        reposList.innerHTML = '';
        repos.forEach(function (repo) {
          var li = document.createElement('li');
          var a = document.createElement('a');
          a.href = repo.html_url;
          a.target = '_blank';
          a.rel = 'noopener';

          var name = document.createElement('span');
          name.className = 'profile-repo-name';
          name.textContent = repo.name;

          var meta = document.createElement('span');
          meta.className = 'profile-repo-meta';
          var parts = [];
          if (repo.language) parts.push(repo.language);
          if (repo.stargazers_count > 0) parts.push('★ ' + repo.stargazers_count);
          meta.textContent = parts.join(' · ') || repo.updated_at.slice(0, 10);

          a.appendChild(name);
          a.appendChild(meta);
          li.appendChild(a);
          reposList.appendChild(li);
        });
      })
      .catch(function () {
        reposList.innerHTML = '<li class="profile-repos-loading"><a href="https://github.com/' + githubUser + '" target="_blank" rel="noopener">项目加载失败 · 打开 GitHub</a></li>';
      });
  }

  // ---- Profile Card: GitHub heatmap ----
  var heatmap = document.getElementById('profile-heatmap');

  if (profileCard && heatmap) {
    var githubUser = profileCard.getAttribute('data-github');

    function renderHeatmap(contributions) {
      var byDate = {};
      contributions.forEach(function (c) {
        byDate[c.date] = c.level;
      });

      var end = new Date();
      end.setHours(0, 0, 0, 0);
      var start = new Date(end);
      start.setDate(start.getDate() - 104);

      heatmap.innerHTML = '';
      var d = new Date(start);
      while (d <= end) {
        var key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        var lv = byDate[key] || 0;
        var cell = document.createElement('span');
        cell.className = 'heat-cell' + (lv ? ' l' + lv : '');
        heatmap.appendChild(cell);
        d.setDate(d.getDate() + 1);
      }
    }

    fetch('https://github-contributions-api.jogruber.de/v4/' + githubUser)
      .then(function (res) {
        if (!res.ok) throw new Error('contrib API ' + res.status);
        return res.json();
      })
      .then(function (json) {
        renderHeatmap(json.contributions || []);
      })
      .catch(function () {
        var img = document.createElement('img');
        img.src = 'https://ghchart.rshah.org/' + githubUser;
        img.alt = 'GitHub contributions';
        img.loading = 'lazy';
        img.className = 'profile-heatmap-fallback';
        heatmap.appendChild(img);
      });
  }

  // ---- Music Player ----
  var musicPlayer = document.getElementById('music-player');
  var playBtn = document.getElementById('music-player-play');
  var playIcon = document.getElementById('music-player-play-icon');
  var playerFrame = document.getElementById('music-player-frame');
  var musicCollapse = document.getElementById('music-player-collapse');

  function storageGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function storageSet(key, val) {
    try { localStorage.setItem(key, val); } catch (e) { /* ignore */ }
  }

  if (musicCollapse && musicPlayer) {
    musicCollapse.addEventListener('click', function (e) {
      e.stopPropagation();
      var collapsed = musicPlayer.classList.toggle('collapsed');
      storageSet('musicPlayerCollapsed', collapsed ? '1' : '0');
    });
  }

  if (musicPlayer) {
    var isMobile = window.matchMedia('(max-width: 768px)').matches || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      musicPlayer.classList.add('collapsed');
    } else if (storageGet('musicPlayerCollapsed') === '1') {
      musicPlayer.classList.add('collapsed');
    }
  }

  if (musicPlayer && playBtn && playIcon && playerFrame) {
    var songId = musicPlayer.getAttribute('data-song-id');
    var playing = false;

    function setPlaying(state) {
      playing = state;
      musicPlayer.classList.toggle('playing', playing);
      playIcon.className = playing ? 'fas fa-pause' : 'fas fa-play';
      if (playing) {
        playerFrame.innerHTML = '<iframe src="https://music.163.com/outchain/player?type=2&id=' + songId + '&auto=1&height=66" width="100%" height="66" frameborder="no" allow="autoplay"></iframe>';
      } else {
        playerFrame.innerHTML = '';
      }
    }

    playBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      setPlaying(!playing);
    });
  }

  // ---- Smooth scroll for TOC links ----
  var tocLinks = document.querySelectorAll('.toc-link');

  tocLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var targetId = this.getAttribute('href').substring(1);
      var target = document.getElementById(targetId);

      if (target) {
        var offset = 80; // header height
        var targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;

        smoothScrollTo(targetPosition);
      }
    });
  });

});
