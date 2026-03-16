/**
 * SplitCart – Three.js Hero Scene
 * Floating 3D grocery objects with soft lighting, rotation, and mouse parallax
 */
import * as THREE from 'three';

export function initHeroScene() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 12;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x4444ff, 0.6);
  scene.add(ambientLight);

  const purpleLight = new THREE.PointLight(0x6c3ce0, 2, 30);
  purpleLight.position.set(-5, 5, 5);
  scene.add(purpleLight);

  const tealLight = new THREE.PointLight(0x00f5d4, 1.8, 30);
  tealLight.position.set(5, -3, 6);
  scene.add(tealLight);

  const pinkLight = new THREE.PointLight(0xff6b9d, 1, 20);
  pinkLight.position.set(0, 4, 3);
  scene.add(pinkLight);

  // Materials
  const glassMat = (color) => new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0.1,
    roughness: 0.15,
    transmission: 0.3,
    thickness: 1.5,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    envMapIntensity: 0.5
  });

  const solidMat = (color) => new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0.2,
    roughness: 0.3,
    clearcoat: 0.5,
  });

  // Floating grocery objects
  const objects = [];

  // Milk Carton
  const milkGroup = new THREE.Group();
  const milkBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 1.2, 0.8),
    solidMat(0xf0f0f8)
  );
  const milkTop = new THREE.Mesh(
    new THREE.ConeGeometry(0.56, 0.4, 4),
    solidMat(0x22cc88)
  );
  milkTop.position.y = 0.8;
  milkTop.rotation.y = Math.PI / 4;
  const milkLabel = new THREE.Mesh(
    new THREE.BoxGeometry(0.82, 0.5, 0.82),
    solidMat(0x22cc88)
  );
  milkLabel.position.y = -0.15;
  milkGroup.add(milkBody, milkTop, milkLabel);
  milkGroup.position.set(4.5, 1.5, -2);
  milkGroup.userData = { baseY: 1.5, speed: 0.8, amp: 0.3, rotSpeed: 0.3 };
  scene.add(milkGroup);
  objects.push(milkGroup);

  // Apple (sphere)
  const apple = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    solidMat(0xff4444)
  );
  const appleStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.04, 0.15, 8),
    solidMat(0x8B4513)
  );
  appleStem.position.y = 0.48;
  const appleGroup = new THREE.Group();
  appleGroup.add(apple, appleStem);
  appleGroup.position.set(-3, 2, -1);
  appleGroup.userData = { baseY: 2, speed: 1.1, amp: 0.35, rotSpeed: 0.5 };
  scene.add(appleGroup);
  objects.push(appleGroup);

  // Orange
  const orange = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 32, 32),
    solidMat(0xff9500)
  );
  const orangeGroup = new THREE.Group();
  orangeGroup.add(orange);
  orangeGroup.position.set(3, -1.5, 0);
  orangeGroup.userData = { baseY: -1.5, speed: 0.9, amp: 0.25, rotSpeed: 0.4 };
  scene.add(orangeGroup);
  objects.push(orangeGroup);

  // Coin 1
  const coinGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.08, 32);
  const coinMat = new THREE.MeshPhysicalMaterial({
    color: 0xffd700,
    metalness: 0.9,
    roughness: 0.1,
    clearcoat: 1,
  });
  const coin1 = new THREE.Mesh(coinGeo, coinMat);
  coin1.position.set(-4.5, -0.5, 1);
  coin1.rotation.x = Math.PI / 6;
  coin1.userData = { baseY: -0.5, speed: 1.3, amp: 0.2, rotSpeed: 0.7 };
  scene.add(coin1);
  objects.push(coin1);

  // Coin 2
  const coin2 = new THREE.Mesh(coinGeo.clone(), coinMat.clone());
  coin2.position.set(2, 3, -1.5);
  coin2.rotation.z = Math.PI / 4;
  coin2.userData = { baseY: 3, speed: 0.7, amp: 0.3, rotSpeed: 0.6 };
  scene.add(coin2);
  objects.push(coin2);

  // Receipt (thin plane)
  const receiptMat = new THREE.MeshPhysicalMaterial({
    color: 0xfafaf0,
    metalness: 0,
    roughness: 0.6,
    side: THREE.DoubleSide,
    clearcoat: 0.2,
  });
  const receipt = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 1.4, 0.02),
    receiptMat
  );
  // Small "text" lines on receipt
  const receiptLineGeo = new THREE.BoxGeometry(0.4, 0.04, 0.025);
  const receiptLineMat = solidMat(0xccccbb);
  for (let i = 0; i < 4; i++) {
    const line = new THREE.Mesh(receiptLineGeo, receiptLineMat);
    line.position.set(0, 0.4 - i * 0.22, 0.01);
    receipt.add(line);
  }
  receipt.position.set(-2, -2, 0.5);
  receipt.rotation.z = 0.2;
  receipt.userData = { baseY: -2, speed: 0.6, amp: 0.35, rotSpeed: 0.25 };
  scene.add(receipt);
  objects.push(receipt);

  // Shopping Bag
  const bagGroup = new THREE.Group();
  const bagBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 1, 0.6),
    solidMat(0x8B5CF6)
  );
  // bag handles
  const handleGeo = new THREE.TorusGeometry(0.2, 0.03, 8, 16, Math.PI);
  const handleMat = solidMat(0x7C3AED);
  const handle1 = new THREE.Mesh(handleGeo, handleMat);
  handle1.position.set(-0.15, 0.5, 0);
  handle1.rotation.z = 0;
  const handle2 = new THREE.Mesh(handleGeo, handleMat);
  handle2.position.set(0.15, 0.5, 0);
  bagGroup.add(bagBody, handle1, handle2);
  bagGroup.position.set(5, -2, -1);
  bagGroup.userData = { baseY: -2, speed: 0.75, amp: 0.28, rotSpeed: 0.35 };
  scene.add(bagGroup);
  objects.push(bagGroup);

  // Banana
  const bananaGeo = new THREE.TorusGeometry(0.6, 0.12, 12, 24, Math.PI * 0.6);
  const bananaMat = solidMat(0xFFE135);
  const banana = new THREE.Mesh(bananaGeo, bananaMat);
  banana.position.set(-5, 1.5, -1.5);
  banana.rotation.z = Math.PI / 3;
  banana.userData = { baseY: 1.5, speed: 0.95, amp: 0.25, rotSpeed: 0.45 };
  scene.add(banana);
  objects.push(banana);

  // Avocado (elongated sphere)
  const avocado = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 32, 32),
    solidMat(0x3a5a1c)
  );
  avocado.scale.y = 1.3;
  avocado.position.set(-1, 3.5, -2);
  avocado.userData = { baseY: 3.5, speed: 1.05, amp: 0.22, rotSpeed: 0.55 };
  scene.add(avocado);
  objects.push(avocado);

  // Small floating particles (tiny spheres)
  const particleGroup = new THREE.Group();
  const pGeo = new THREE.SphereGeometry(0.03, 8, 8);
  for (let i = 0; i < 60; i++) {
    const pMat = new THREE.MeshBasicMaterial({
      color: [0x6c3ce0, 0x00f5d4, 0xff6b9d, 0xffd700][Math.floor(Math.random() * 4)],
      transparent: true,
      opacity: 0.4 + Math.random() * 0.4,
    });
    const particle = new THREE.Mesh(pGeo, pMat);
    particle.position.set(
      (Math.random() - 0.5) * 16,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 8
    );
    particle.userData = {
      baseY: particle.position.y,
      speed: 0.5 + Math.random() * 1.5,
      amp: 0.1 + Math.random() * 0.3,
    };
    particleGroup.add(particle);
  }
  scene.add(particleGroup);

  // Mouse tracking
  const mouse = { x: 0, y: 0 };
  const targetMouse = { x: 0, y: 0 };

  window.addEventListener('mousemove', (e) => {
    targetMouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Scroll tracking
  let scrollProgress = 0;

  window.addEventListener('scroll', () => {
    const heroSection = document.getElementById('hero');
    if (heroSection) {
      const rect = heroSection.getBoundingClientRect();
      scrollProgress = Math.max(0, Math.min(1, -rect.top / rect.height));
    }
  });

  // Animation loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Smooth mouse
    mouse.x += (targetMouse.x - mouse.x) * 0.05;
    mouse.y += (targetMouse.y - mouse.y) * 0.05;

    // Animate objects
    objects.forEach((obj) => {
      const d = obj.userData;
      obj.position.y = d.baseY + Math.sin(t * d.speed) * d.amp;
      obj.rotation.y += d.rotSpeed * 0.005;
      obj.rotation.x += d.rotSpeed * 0.002;

      // Mouse parallax
      obj.position.x += (mouse.x * 0.3 - (obj.position.x - obj.position.x)) * 0.01;
    });

    // Animate small particles
    particleGroup.children.forEach((p) => {
      p.position.y = p.userData.baseY + Math.sin(t * p.userData.speed + p.position.x) * p.userData.amp;
    });

    // Scene-wide parallax based on mouse
    scene.rotation.y = mouse.x * 0.03;
    scene.rotation.x = mouse.y * 0.02;

    // Scroll: fade objects
    const scale = 1 - scrollProgress * 0.5;
    const opacity = 1 - scrollProgress;
    objects.forEach((obj) => {
      obj.scale.setScalar(Math.max(0.01, scale));
    });
    particleGroup.children.forEach((p) => {
      p.material.opacity = Math.max(0, opacity * (0.4 + Math.random() * 0.01));
    });

    renderer.render(scene, camera);
  }

  animate();

  // Resize  
  function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  window.addEventListener('resize', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
    renderer.dispose();
  };
}
