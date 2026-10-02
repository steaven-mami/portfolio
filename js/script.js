const canvas = document.getElementById("bg");
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 6;

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // MOBILE : plafonné à 2


const geometry = new THREE.PlaneGeometry(80, 50, 200, 200);

const material = new THREE.ShaderMaterial({
  transparent: true,
  uniforms: {
    uTime: { value: 0 },
    uSpeed: { value: 1.8 },
    uColor: { value: new THREE.Vector3(1.0, 1.0, 1.0) },
    uAlpha: { value: 0.4 }
  },
  vertexShader: `
    uniform float uTime;
    uniform float uSpeed;
    varying float vHeight;
    void main(){
      vec3 pos = position;
      pos.y += (sin(pos.x*0.3 + uTime*0.4*uSpeed) * 0.7
              + cos(pos.x*0.2 + uTime*0.6*uSpeed) * 0.25);
      vHeight = pos.y;
      gl_Position = projectionMatrix*modelViewMatrix*vec4(pos,1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform float uAlpha;
    varying float vHeight;
    void main(){
      gl_FragColor = vec4(uColor, uAlpha);
    }
  `,
  side: THREE.DoubleSide
});

const plane = new THREE.Mesh(geometry, material);
plane.rotation.x = 0.3;
plane.rotation.z = -0.3;
plane.position.x = 22;
plane.position.y = 23;
scene.add(plane);

function animate(time) {
  requestAnimationFrame(animate);
  material.uniforms.uTime.value = time * 0.001;
  renderer.render(scene, camera);
}
animate();

// MOBILE : on ignore les resize dus à la barre d'adresse (seule la largeur compte)
let lastW = window.innerWidth;

window.addEventListener("resize", () => {
  if (window.innerWidth === lastW) return;
  lastW = window.innerWidth;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

let blinkInterval = null;

function waveNormal() {
  clearInterval(blinkInterval);
  canvas.style.visibility = "visible";
  material.uniforms.uSpeed.value = 1.8;
  material.uniforms.uColor.value = new THREE.Vector3(1.0, 1.0, 1.0);
  material.uniforms.uAlpha.value = 0.4;
}

function waveAlert() {
  material.uniforms.uSpeed.value = 4.0;
  material.uniforms.uColor.value = new THREE.Vector3(1.0, 0.3, 0.0);
  material.uniforms.uAlpha.value = 0.6;
  blinkInterval = setInterval(() => {
    canvas.style.visibility = canvas.style.visibility === "hidden" ? "visible" : "hidden";
  }, 300);
}

const labels = document.querySelectorAll(".nav-label");
const arrowLeft = document.getElementById("arrow-left");
const arrowRight = document.getElementById("arrow-right");
const box = document.getElementById("content-box");
let language = "en";
const interfaceText = {
  en: { hello: "Hello, I'm", tabs: ["Skills", "About me", "Projects"], contact: "Contact me", comingSoon: "Coming soon.", idle: ["Hello...", "Anyone there?", "Yes", "No", "Phew !", "Enjoy your visit !", "Hm...", "Thanks for letting me know", "Hey !", "Over here !", "I'm here !"] },
  fr: { hello: "Bonjour, je suis", tabs: ["Compétences", "À propos", "Projets"], contact: "Me contacter", comingSoon: "Bientôt disponible.", idle: ["Bonjour...", "Il y a quelqu'un ?", "Oui", "Non", "Ouf !", "Bonne visite !", "Ah...", "Merci de me prévenir", "Hé !", "Je suis là !", "Je suis là !"] }
};
const languageButtons = document.querySelectorAll(".language-button");
const mobileLayout = window.matchMedia("(max-width: 900px)");

function updateTabLabels() {
  const tabLanguage = mobileLayout.matches ? "en" : language;
  labels.forEach((label, index) => {
    label.textContent = interfaceText[tabLanguage].tabs[index];
  });
}

function applyLanguage(nextLanguage) {
  language = nextLanguage;
  document.documentElement.lang = language;
  updateTabLabels();
  document.getElementById("contact-text").textContent = interfaceText[language].contact;
  languageButtons.forEach(button => button.classList.toggle("active", button.dataset.language === language));
  renderContent();
  restoreProfile();
}

mobileLayout.addEventListener("change", updateTabLabels);

languageButtons.forEach(button => {
  button.addEventListener("click", () => applyLanguage(button.dataset.language));
});

let current = 1;

function renderContent() {
  const sections = ["skills", "about", "projects"];
  const key = sections[current];

  if (key === "about") {
    box.innerHTML = content[language].about.map((paragraph, index) => `
      ${index > 0 ? "<hr>" : ""}
      <p style="animation: fadeText 0.8s ease forwards;">${paragraph}</p>
    `).join("");
    return;
  }

  if (key === "skills") {
    box.innerHTML = `
      <div class="skills">
        ${content[language].skills.map(group => `
          <h3 class="skills-title">${group.title} :</h3>
          <ul class="skills-list">
            ${group.items.map(item => `<li>${item}</li>`).join("")}
          </ul>
        `).join("")}
      </div>
    `;
    return;
  }

  if (key === "projects") {
    box.innerHTML = `<p style="opacity:0.4; animation: fadeText 0.8s ease forwards;">${interfaceText[language].comingSoon}</p>`;
    return;
  }
}

function updateNav() {
  labels.forEach((label) => {
    const index = parseInt(label.dataset.index);
    label.className = "nav-label " + (index === current ? "active" : "inactive");
  });
  renderContent();
}

arrowRight.addEventListener("click", () => {
  current = (current + 1) % labels.length;
  updateNav();
});

arrowLeft.addEventListener("click", () => {
  current = (current - 1 + labels.length) % labels.length;
  updateNav();
});

labels.forEach((label) => {
  label.addEventListener("click", () => {
    current = parseInt(label.dataset.index);
    updateNav();
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") {
    current = (current + 1) % labels.length;
    updateNav();
  }
  if (e.key === "ArrowLeft") {
    current = (current - 1 + labels.length) % labels.length;
    updateNav();
  }
  if (e.key === "ArrowDown") {
    box.scrollTop += 40;
  }
  if (e.key === "ArrowUp") {
    box.scrollTop -= 40;
  }
});

let photoClicks = 0;
let photoTimer = null;

document.querySelector("#profile img").addEventListener("click", () => {
  photoClicks++;
  clearTimeout(photoTimer);
  photoTimer = setTimeout(() => { photoClicks = 0; }, 600);

  if (photoClicks === 5) {
    photoClicks = 0;
    current = 1;
    updateNav();

    const aboutLabel = document.querySelector(".nav-label[data-index='1']");
    aboutLabel.style.transition = "transform 0.15s ease";
    aboutLabel.style.transform = "scale(1.4)";
    setTimeout(() => { aboutLabel.style.transform = "scale(1)"; }, 150);
    setTimeout(() => { aboutLabel.style.transform = "scale(1.4)"; }, 300);
    setTimeout(() => { aboutLabel.style.transform = "scale(1)"; }, 450);
    setTimeout(() => { aboutLabel.style.transform = ""; aboutLabel.style.transition = ""; }, 500);
  }
});

labels.forEach((label) => {
  const index = parseInt(label.dataset.index);
  label.className = "nav-label " + (index === current ? "active" : "inactive");
});

// --- IDLE ---

const helloEl = document.getElementById("hello");
const firstnameEl = document.getElementById("firstname");
const fullnameEl = document.getElementById("fullname");

const originalHello = { en: "Hello, I'm", fr: "Bonjour, je suis" };
const originalFirstname = "Mamizara";
const originalFullname = "Harena Valisoa Steaven";

function resetIdle() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(triggerIdle, 60000);
}

function restoreProfile() {
  helloEl.textContent = originalHello[language];
  firstnameEl.textContent = originalFirstname;
  fullnameEl.innerHTML = originalFullname;
  waveNormal();
}

function triggerIdle() {
  helloEl.textContent = interfaceText[language].idle[0];
  firstnameEl.textContent = interfaceText[language].idle[1];
  fullnameEl.innerHTML = `
    <span id="btn-yes" class="idle-btn">${interfaceText[language].idle[2]}</span>
    <span id="btn-no" class="idle-btn">${interfaceText[language].idle[3]}</span>
  `;

  document.getElementById("btn-yes").addEventListener("click", handleYes);
  document.getElementById("btn-no").addEventListener("click", handleNo);
}

function handleYes() {
  helloEl.textContent = interfaceText[language].idle[4];
  firstnameEl.textContent = interfaceText[language].idle[5];
  fullnameEl.innerHTML = "";
  setTimeout(() => {
    restoreProfile();
    resetIdle();
  }, 2000);
}

function handleNo() {
  waveAlert();
  helloEl.textContent = interfaceText[language].idle[6];
  firstnameEl.textContent = interfaceText[language].idle[7];
  fullnameEl.innerHTML = "";
  setTimeout(() => {
    helloEl.textContent = interfaceText[language].idle[8];
    firstnameEl.textContent = interfaceText[language].idle[9];
    fullnameEl.innerHTML = `
      <span id="btn-yes2" class="idle-btn">${interfaceText[language].idle[10]}</span>
    `;
    document.getElementById("btn-yes2").addEventListener("click", () => {
      handleYes();
    });
  }, 2000);
}

let idleTimer = setTimeout(triggerIdle, 60000);

// MOBILE : touchstart ajouté pour l'idle
["mousemove", "keydown", "click", "scroll", "touchstart"].forEach(evt => {
  document.addEventListener(evt, resetIdle);
});

// MOBILE : swipe gauche/droite pour changer d'onglet
let touchX = null, touchY = null;

document.addEventListener("touchstart", (e) => {
  touchX = e.touches[0].clientX;
  touchY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener("touchend", (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  const dy = e.changedTouches[0].clientY - touchY;
  touchX = null;
  if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
  current = dx < 0
    ? (current + 1) % labels.length
    : (current - 1 + labels.length) % labels.length;
  updateNav();
}, { passive: true });
