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
  var langOptions = document.querySelectorAll('.lang-option');
  var langCurrent = document.querySelector('.lang-current');

  if (langOptions.length && langCurrent) {
    // Detect current language from URL
    var currentPath = window.location.pathname;
    var currentLang = currentPath.startsWith('/zh-CN') ? 'zh-CN' : 'en';

    // Set active state
    langOptions.forEach(function(opt) {
      if (opt.dataset.lang === currentLang) {
        opt.classList.add('active');
      }
    });

    langCurrent.textContent = currentLang === 'zh-CN' ? 'CN' : 'EN';

    langOptions.forEach(function(option) {
      option.addEventListener('click', function(e) {
        e.preventDefault();
        var targetLang = this.dataset.lang;
        var path = window.location.pathname;

        // Store preference
        localStorage.setItem('preferred-lang', targetLang);

        if (targetLang === 'zh-CN') {
          // Switch to Chinese: add /zh-CN prefix
          if (!path.startsWith('/zh-CN')) {
            window.location.href = '/zh-CN' + path;
          }
        } else {
          // Switch to English: remove /zh-CN prefix
          if (path.startsWith('/zh-CN')) {
            var newPath = path.replace('/zh-CN', '') || '/';
            window.location.href = newPath;
          }
        }
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

  // ---- Mobile Menu Toggle ----
  var navToggle = document.querySelector('.nav-toggle');
  var navMenu = document.querySelector('.nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // Close menu on click outside
    document.addEventListener('click', function (e) {
      if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
      }
    });
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
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ---- Header Scroll Effect ----
  var header = document.querySelector('.site-header');

  if (header) {
    var lastScroll = 0;

    window.addEventListener('scroll', function () {
      var currentScroll = window.scrollY;

      if (currentScroll > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      lastScroll = currentScroll;
    });
  }

  // ---- Search Toggle ----
  var searchToggle = document.querySelector('.search-toggle');
  var searchBox = document.querySelector('.search-box');
  var searchInput = document.getElementById('search-input');

  if (searchToggle && searchBox) {
    searchToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      searchBox.classList.toggle('active');
      if (searchBox.classList.contains('active') && searchInput) {
        searchInput.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (!searchBox.contains(e.target) && !searchToggle.contains(e.target)) {
        searchBox.classList.remove('active');
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
    block.style.position = 'relative';
    block.appendChild(copyBtn);

    copyBtn.addEventListener('click', function () {
      var code = block.querySelector('code');
      var text = code ? code.textContent : block.textContent;

      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function () {
          copyBtn.textContent = 'Copied!';
          copyBtn.classList.add('copied');
          setTimeout(function () {
            copyBtn.textContent = 'Copy';
            copyBtn.classList.remove('copied');
          }, 2000);
        });
      }
    });
  });

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

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

});
