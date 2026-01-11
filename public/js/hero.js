// Auto-advancing hero carousel + Typewriter effect
// Runs after DOMContentLoaded

document.addEventListener('DOMContentLoaded', function () {
  const images = [
    'https://www.retiregenie.com/wp-content/uploads/2023/06/5.jpg',
    'https://www.agewellsg.gov.sg/images/what%20is%20age%20well.jpg',
    'https://mtalvernia.sg/wp-content/uploads/2017/02/geriatric.jpg',
    'https://mtalvernia.sg/wp-content/uploads/2021/10/All-About-Orthogeriatrics-1.jpg'
  ];

  const slider = document.querySelector('.hero-slider');
  const overlay = document.querySelector('.hero-overlay');
  const INTERVAL_MS = 6000; // time per slide

  if (slider && images.length) {
    images.forEach((src, i) => {
      const el = document.createElement('div');
      el.className = 'hero-slide';
      el.style.backgroundImage = `url('${src}')`;
      if (i === 0) el.classList.add('active');
      slider.appendChild(el);
    });

    const slides = Array.from(slider.querySelectorAll('.hero-slide'));
    let current = 0;
    let slideTimer = null;

    function showNextSlide() {
      slides[current].classList.remove('active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('active');
    }

    function startSlides() {
      if (slideTimer) return;
      slideTimer = setInterval(showNextSlide, INTERVAL_MS);
    }

    function stopSlides() {
      if (!slideTimer) return;
      clearInterval(slideTimer);
      slideTimer = null;
    }

    // start auto-sliding
    startSlides();
  }

  // Smoother typewriter using requestAnimationFrame; pauses carousel during typing
  function typeWriter(el, text, msPerChar = 45, cb) {
    if (!el) return;
    stopSlides();
    el.textContent = '';
    el.classList.add('typewriter-caret');
    el.style.visibility = 'visible';
    let startTime = null;
    let pos = 0;
    let rafId = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const expected = Math.floor(elapsed / msPerChar);
      if (expected > pos) {
        const nextPos = Math.min(text.length, expected);
        el.textContent = text.slice(0, nextPos);
        pos = nextPos;
      }
      if (pos < text.length) {
        rafId = requestAnimationFrame(step);
      } else {
        el.classList.remove('typewriter-caret');
        if (cb) setTimeout(cb, 400);
        // resume slides shortly after typing completes
        setTimeout(() => { startSlides(); }, 800);
      }
    }

    rafId = requestAnimationFrame(step);
    // return a cancel function if caller wants to cancel
    return () => { if (rafId) cancelAnimationFrame(rafId); };
  }

  const titleInner = document.querySelector('.hero-title-inner');

  if (titleInner) {
    const titleText = titleInner.dataset.text || titleInner.textContent.trim();
    // make visible and start typing (only the headline)
    titleInner.style.visibility = 'visible';
    titleInner.textContent = '';
    typeWriter(titleInner, titleText, 45);
  }

});