/**
 * SplitCart – Main Entry Point
 * Initializes all modules: 3D scene, animations, particles, money flow
 */
import './style.css';
import { initHeroScene } from './scene.js';
import { initAnimations } from './animations.js';
import { initParticles } from './particles.js';
import { initMoneyFlow } from './moneyflow.js';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize ambient particle background
  initParticles();

  // Initialize Three.js hero scene (floating 3D groceries)
  initHeroScene();

  // Initialize GSAP scroll animations & interactions
  initAnimations();

  // Initialize money flow settlement visualization
  initMoneyFlow();

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});
