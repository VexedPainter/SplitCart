/**
 * SplitCart – GSAP Scroll Animations & Interactions
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initAnimations() {
  // --- Navbar scroll effect ---
  ScrollTrigger.create({
    start: 'top -80',
    onUpdate: (self) => {
      const nav = document.getElementById('main-nav');
      if (nav) {
        nav.classList.toggle('scrolled', self.progress > 0);
      }
    },
  });

  // --- Hide scroll indicator on scroll ---
  gsap.to('#scroll-indicator', {
    opacity: 0,
    y: 20,
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: '20% top',
      scrub: true,
    },
  });

  // --- Feature Cards stagger ---
  gsap.utils.toArray('.feature-card').forEach((card, i) => {
    gsap.fromTo(card, 
      { opacity: 0, y: 60, rotateX: 8 },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        delay: i * 0.15,
      }
    );
  });

  // --- Step items stagger ---
  gsap.utils.toArray('.step-item').forEach((step, i) => {
    gsap.fromTo(step,
      { opacity: 0, y: 50, x: i % 2 === 0 ? -30 : 30 },
      {
        opacity: 1,
        y: 0,
        x: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: step,
          start: 'top 82%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    // Animate step number
    gsap.fromTo(step.querySelector('.step-number'),
      { opacity: 0, scale: 0.5 },
      {
        opacity: 0.2,
        scale: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: step,
          start: 'top 82%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  });

  // --- Section headers ---
  gsap.utils.toArray('.section-header').forEach((header) => {
    const elements = header.children;
    gsap.fromTo(elements,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: header,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  });

  // --- Moneyflow section ---
  gsap.fromTo('.moneyflow-stage',
    { opacity: 0, y: 60, scale: 0.95 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.moneyflow-stage',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    }
  );

  // --- CTA Section ---
  gsap.fromTo('.cta-content',
    { opacity: 0, y: 50 },
    {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.cta-section',
        start: 'top 75%',
        toggleActions: 'play none none reverse',
      },
    }
  );

  // --- Parallax background glow ---
  gsap.to('.cta-bg-glow', {
    y: -100,
    scrollTrigger: {
      trigger: '.cta-section',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1,
    },
  });

  // --- 3D Tilt cards ---
  initTiltCards();

  // --- Button glow pulse on hover ---
  initGlowPulse();

  // --- Animate chart bars ---
  initChartAnimation();
}

function initTiltCards() {
  const cards = document.querySelectorAll('.tilt-card');

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

      // Move glow
      const glow = card.querySelector('.card-glow');
      if (glow) {
        glow.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(0, 245, 212, 0.1) 0%, transparent 60%)`;
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      const glow = card.querySelector('.card-glow');
      if (glow) {
        glow.style.background = '';
      }
    });
  });
}

function initGlowPulse() {
  const buttons = document.querySelectorAll('.glow-btn');
  buttons.forEach((btn) => {
    btn.addEventListener('mouseenter', () => {
      gsap.fromTo(btn,
        { boxShadow: '0 0 0 0 rgba(108, 60, 224, 0.3)' },
        {
          boxShadow: '0 0 40px 10px rgba(108, 60, 224, 0.15), 0 0 80px 20px rgba(0, 245, 212, 0.1)',
          duration: 0.6,
          ease: 'power2.out',
        }
      );
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        boxShadow: '0 0 0 0 rgba(108, 60, 224, 0)',
        duration: 0.4,
      });
    });
  });
}

function initChartAnimation() {
  const bars = document.querySelectorAll('.chart-bar');
  bars.forEach((bar) => {
    const targetH = bar.style.getPropertyValue('--h');
    bar.style.setProperty('--h', '0%');
    
    ScrollTrigger.create({
      trigger: bar.closest('.feature-card'),
      start: 'top 80%',
      onEnter: () => {
        gsap.to(bar, {
          '--h': targetH,
          duration: 1,
          ease: 'power3.out',
          delay: Array.from(bars).indexOf(bar) * 0.1,
          onUpdate: function() {
            bar.style.height = bar.style.getPropertyValue('--h') || targetH;
          }
        });
      },
    });
  });
}
