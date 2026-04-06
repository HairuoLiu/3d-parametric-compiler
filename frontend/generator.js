const BACKEND_URL = "https://你的-backend-url"; // 👈 部署后替换！

const urlParams = new URLSearchParams(window.location.search);
const file = urlParams.get("file");

let params = {
  diameter: 60,
  inner_diameter: 45,
  thickness: 10
};

let scene, camera, renderer, controls, mesh, currentBlob;

initUI();
init3D();

function initUI() {
  const panel = document.getElementById("panel");

  for (let key in params) {
    const input = document.createElement("input");
    input.id = key;
    input.value = params[key];

    panel.appendChild(document.createTextNode(key));
    panel.appendChild(input);
    panel.appendChild(document.createElement("br"));
  }
}

function init3D() {
  const container = document.getElementById("viewer");

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, 600/400, 0.1, 1000);
  camera.position.z = 100;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(600, 400);
  container.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);

  scene.add(new THREE.DirectionalLight(0xffffff, 1));

  animate();
}

function generate() {
  let updated = {};
  for (let key in params) {
    updated[key] = document.getElementById(key).value;
  }

  fetch(`${BACKEND_URL}/generate`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ template: file, params: updated })
  })
  .then(res => res.blob())
  .then(blob => {
    currentBlob = blob;
    previewSTL(blob);
  });
}

function previewSTL(blob) {
  const loader = new THREE.STLLoader();
  const url = URL.createObjectURL(blob);

  loader.load(url, geometry => {
    if (mesh) scene.remove(mesh);

    mesh = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());
    scene.add(mesh);
  });
}

function download() {
  if (!currentBlob) return alert("Generate first");

  const url = URL.createObjectURL(currentBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "model.stl";
  a.click();
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}