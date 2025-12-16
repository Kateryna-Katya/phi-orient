document.addEventListener("DOMContentLoaded", () => {
  // 1. Init Core Libraries
  lucide.createIcons();

  // Lenis: Smooth Scroll
  const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
  });

  function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  gsap.registerPlugin(ScrollTrigger);

  // 2. Mobile Menu Logic
  const burger = document.querySelector('.header__burger');
  const nav = document.querySelector('.header__nav');
  const navLinks = document.querySelectorAll('.header__link');

  if (burger) {
      burger.addEventListener('click', () => {
          nav.classList.toggle('is-open');
          burger.classList.toggle('is-active');

          const spans = burger.querySelectorAll('span');
          if (nav.classList.contains('is-open')) {
              gsap.to(spans[0], { rotation: 45, y: 6, duration: 0.3 });
              gsap.to(spans[1], { rotation: -45, y: -6, duration: 0.3 });
          } else {
              gsap.to(spans, { rotation: 0, y: 0, duration: 0.3 });
          }
      });
  }

  navLinks.forEach(link => {
      link.addEventListener('click', () => {
          if (nav.classList.contains('is-open')) {
              nav.classList.remove('is-open');
              burger.classList.remove('is-active');
              const spans = burger.querySelectorAll('span');
              gsap.to(spans, { rotation: 0, y: 0, duration: 0.3 });
          }
      });
  });

  // 3. Animations

  // Hero Animation
  const heroTimeline = gsap.timeline();
  heroTimeline
      .from(".hero__label", { y: 20, opacity: 0, duration: 0.8, ease: "power3.out" })
      .from(".hero__title", { y: 30, opacity: 0, duration: 0.8 }, "-=0.6")
      .from(".hero__desc", { y: 20, opacity: 0, duration: 0.8 }, "-=0.6")
      .from(".hero__btns", { y: 20, opacity: 0, duration: 0.8 }, "-=0.6")
      .from(".hero__visual", { scale: 0.8, opacity: 0, duration: 1.2 }, "-=0.8");

  // Scroll Animations (Generic Fade Up/Down/Left/Right)
  const fadeElements = document.querySelectorAll('[data-animate]');

  fadeElements.forEach(el => {
      const type = el.getAttribute('data-animate');
      // Получаем задержку из атрибута data-delay, преобразуем в число, если null/undefined, то 0
      const delay = parseFloat(el.getAttribute('data-delay')) || 0;

      let initialVars = { opacity: 0, duration: 0.8, ease: "power3.out", delay: delay };

      if (type === 'fade-up') initialVars.y = 50;
      if (type === 'fade-right') initialVars.x = -50;
      if (type === 'fade-left') initialVars.x = 50;
      if (type === 'scale-up') initialVars.scale = 0.9;

      // Убеждаемся, что анимация запускается только один раз, когда элемент входит в видимость
      gsap.from(el, {
          ...initialVars,
          scrollTrigger: {
              trigger: el,
              start: "top 85%",
              once: true, // Анимация происходит только один раз
          }
      });
  });

  // Специальная анимация для карточек (секция #solutions)
  const solutionCards = document.querySelectorAll('#solutions .card');

  solutionCards.forEach((card, index) => {
      gsap.from(card, {
          y: 50,
          opacity: 0,
          duration: 0.8,
          delay: index * 0.1, // Последовательная задержка
          ease: "power3.out",
          scrollTrigger: {
              trigger: "#solutions",
              start: "top 80%",
              once: true,
          }
      });
  });


  // 4. FAQ Accordion
  const accordions = document.querySelectorAll('.accordion__item');
  accordions.forEach(item => {
      const trigger = item.querySelector('.accordion__trigger');
      const content = item.querySelector('.accordion__content');
      const icon = trigger.querySelector('i');

      trigger.addEventListener('click', () => {
          const isOpen = content.style.maxHeight;

          // Close all others
          accordions.forEach(otherItem => {
              const otherContent = otherItem.querySelector('.accordion__content');
              if (otherContent !== content) {
                  otherContent.style.maxHeight = null;
                  gsap.to(otherItem.querySelector('i'), { rotation: 0, duration: 0.3 });
              }
          });

          if (!isOpen || isOpen === '0px') {
              content.style.maxHeight = content.scrollHeight + "px";
              gsap.to(icon, { rotation: 180, duration: 0.3 });
          } else {
              content.style.maxHeight = null;
              gsap.to(icon, { rotation: 0, duration: 0.3 });
          }
      });
  });

  // 5. Contact Form Logic & Validation
  const form = document.getElementById('contactForm');
  const phoneInput = document.getElementById('phone');
  const phoneError = document.getElementById('phoneError');
  const captchaInput = document.getElementById('captchaInput');
  const captchaLabel = document.getElementById('captchaLabel');
  const formStatus = document.getElementById('formStatus');

  // Phone Validation (Only digits)
  phoneInput.addEventListener('input', (e) => {
      const val = e.target.value;
      if (!/^\d*$/.test(val)) {
          phoneError.style.display = 'block';
          phoneInput.classList.add('input-error');
      } else {
          phoneError.style.display = 'none';
          phoneInput.classList.remove('input-error');
      }
  });

  // Math Captcha Logic
  let num1 = Math.floor(Math.random() * 10) + 1;
  let num2 = Math.floor(Math.random() * 10) + 1;
  let correctCaptcha = num1 + num2;
  captchaLabel.innerText = `Сколько будет ${num1} + ${num2}?`;

  const refreshCaptcha = () => {
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      correctCaptcha = num1 + num2;
      captchaLabel.innerText = `Сколько будет ${num1} + ${num2}?`;
      captchaInput.value = '';
  }

  form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Final Phone Check
      if (!/^\d+$/.test(phoneInput.value)) {
          formStatus.innerText = "Пожалуйста, введите корректный номер телефона (только цифры).";
          formStatus.className = "form-status status-error";
          return;
      }

      // Captcha Check
      if (parseInt(captchaInput.value) !== correctCaptcha) {
          formStatus.innerText = "Ошибка капчи. Посчитайте пример заново.";
          formStatus.className = "form-status status-error";
          refreshCaptcha();
          return;
      }

      // All checks passed
      formStatus.innerText = "";
      formStatus.className = "form-status";

      // Simulate AJAX
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.innerText;
      btn.innerText = "Отправка...";
      btn.disabled = true;

      setTimeout(() => {
          btn.innerText = "Отправлено!";
          formStatus.innerText = "Спасибо! Мы свяжемся с вами в ближайшее время.";
          formStatus.className = "form-status status-success";
          form.reset();

          refreshCaptcha();

          setTimeout(() => {
              btn.innerText = originalText;
              btn.disabled = false;
              formStatus.innerText = "";
              formStatus.className = "form-status";
          }, 3000);
      }, 1500);
  });

  // 6. Cookie Popup
  const cookiePopup = document.getElementById('cookiePopup');
  const acceptCookie = document.getElementById('acceptCookie');

  if (!localStorage.getItem('cookiesAccepted')) {
      setTimeout(() => {
          cookiePopup.classList.add('is-visible');
      }, 2000);
  }

  acceptCookie.addEventListener('click', () => {
      localStorage.setItem('cookiesAccepted', 'true');
      cookiePopup.classList.remove('is-visible');
  });
});