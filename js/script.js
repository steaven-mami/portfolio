const canvas = document.getElementById("bg");
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 6;

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const geometry = new THREE.PlaneGeometry(38, 22, 200, 200);

const material = new THREE.ShaderMaterial({
  transparent: true,
  uniforms: {
    uTime: { value: 0 },
    uSpeed: { value: 1.0 },
    uColor: { value: new THREE.Vector3(0.5, 0.5, 0.5) },
    uAlpha: { value: 0.3 }
  },
  vertexShader: `
    uniform float uTime;
    uniform float uSpeed;
    varying float vHeight;
    void main(){
      vec3 pos = position;
      pos.z += (sin(pos.x*0.8 + uTime*0.4*uSpeed) * 1.5 
              + cos(pos.y*0.5 + uTime*0.5*uSpeed) * 1.5);
      vHeight = pos.z;
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
plane.rotation.x = 0.6;
plane.rotation.z = -0.3;
plane.position.x = 10;
plane.position.y = 12;
scene.add(plane);

function animate(time) {
  requestAnimationFrame(animate);
  material.uniforms.uTime.value = time * 0.001;
  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

let blinkInterval = null;

function waveNormal() {
  clearInterval(blinkInterval);
  canvas.style.visibility = "visible";
  material.uniforms.uSpeed.value = 1.0;
  material.uniforms.uColor.value = new THREE.Vector3(0.5, 0.5, 0.5);
  material.uniforms.uAlpha.value = 0.3;
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

let current = 1;

function renderContent() {
  const sections = ["skills", "about", "projects"];
  const key = sections[current];

  if (key === "about") {
    box.innerHTML = `
      <p style="animation: fadeText 0.8s ease forwards;">Computer Science student in my third year at Saâd Dahlab University of Blida, Algeria.</p>
      <hr>
      <p style="animation: fadeText 0.8s ease forwards;">Originally from Madagascar, I joined the university as a scholarship student — an opportunity I take very seriously.</p>
      <hr>
      <p style="animation: fadeText 0.8s ease forwards;">Passionate about software development, I believe coding is above all a creative act. My goal is to build software that has a real impact on people's lives — whether in web, mobile, or desktop development, with AI as a key tool.</p>
      <hr>
      <p style="animation: fadeText 0.8s ease forwards;">Outside of coding, I'm a big fan of video games and humor.</p>
    `;
    return;
  }

  if (key === "skills") {
    const s = content.skills;
    const maxLang = Math.max(s.languages.comfortable.length, s.languages.working.length);
    const rows = Array.from({length: maxLang}, (_, i) => `
      <tr>
        <td style="padding: 2px 30px 2px 0;">
          ${s.languages.comfortable[i] ? `<span style="margin-right:8px;">•</span>${s.languages.comfortable[i]}` : ""}
        </td>
        <td style="padding: 2px 0;">
          ${s.languages.working[i] ? `<span style="margin-right:8px;">•</span>${s.languages.working[i]}` : ""}
        </td>
      </tr>
    `).join("");

    box.innerHTML = `
      <div style="animation: fadeText 0.8s ease forwards;">
        <p style="font-size:30px; font-weight:bold; opacity:0.5; margin: 0 0 12px 0;">Languages</p>
        <div style="padding-left: 20px; margin-bottom: 30px;">
          <table style="width:100%; border-collapse:collapse;">
            <thead>
              <tr>
                <th style="text-align:left; padding: 0 30px 8px 0; opacity:0.7; font-weight:normal;">Comfortable with</th>
                <th style="text-align:left; padding: 0 0 8px 0; opacity:0.7; font-weight:normal;">Working knowledge</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <p style="font-size:30px; font-weight:bold; opacity:0.5; margin: 0 0 12px 0;">Tools & Tech</p>
        <div style="padding-left: 20px; margin-bottom: 30px; line-height:1.8;">
          ${s.tools.map(t => `<div><span style="margin-right:8px;">•</span>${t}</div>`).join("")}
        </div>
        <p style="font-size:30px; font-weight:bold; opacity:0.5; margin: 0 0 12px 0;">Currently Learning</p>
        <div style="padding-left: 20px; line-height:1.8;">
          ${s.learning.map(l => `<div><span style="margin-right:8px;">•</span>${l}</div>`).join("")}
        </div>
      </div>
    `;
    return;
  }

  if (key === "projects") {
    box.innerHTML = `<p style="opacity:0.4; animation: fadeText 0.8s ease forwards;">Coming soon.</p>`;
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

const originalHello = "Hello, I'm";
const originalFirstname = "Mamizara";
const originalFullname = "Harena Valisoa Steaven";

function resetIdle() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(triggerIdle, 60000);
}

function restoreProfile() {
  helloEl.textContent = originalHello;
  firstnameEl.textContent = originalFirstname;
  fullnameEl.innerHTML = originalFullname;
  waveNormal();
}

function triggerIdle() {
  helloEl.textContent = "Hello...";
  firstnameEl.textContent = "Anyone there?";
  fullnameEl.innerHTML = `
    <span id="btn-yes" style="cursor:pointer; border: 2px solid white; padding: 4px 16px; border-radius: 8px; margin-right: 10px; font-size: 30px;">Yes</span>
    <span id="btn-no" style="cursor:pointer; border: 2px solid white; padding: 4px 16px; border-radius: 8px; font-size: 30px;">No</span>
  `;

  document.getElementById("btn-yes").addEventListener("click", handleYes);
  document.getElementById("btn-no").addEventListener("click", handleNo);
}

function handleYes() {
  helloEl.textContent = "Phew !";
  firstnameEl.textContent = "Enjoy your visit !";
  fullnameEl.innerHTML = "";
  setTimeout(() => {
    restoreProfile();
    resetIdle();
  }, 2000);
}

function handleNo() {
  waveAlert();
  helloEl.textContent = "Hm...";
  firstnameEl.textContent = "Thanks for letting me know";
  fullnameEl.innerHTML = "";
  setTimeout(() => {
    helloEl.textContent = "Hey !";
    firstnameEl.textContent = "Over here !";
    fullnameEl.innerHTML = `
      <span id="btn-yes2" style="cursor:pointer; border: 2px solid white; padding: 4px 16px; border-radius: 8px; font-size: 30px;">I'm here !</span>
    `;
    document.getElementById("btn-yes2").addEventListener("click", () => {
      handleYes();
    });
  }, 2000);
}

let idleTimer = setTimeout(triggerIdle, 60000);

["mousemove", "keydown", "click", "scroll"].forEach(evt => {
  document.addEventListener(evt, resetIdle);
});
