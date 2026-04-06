let scene, camera, renderer, mesh, controls;
let currentParams = {};

init();

async function init() {
  setupThree();

  const scadText = await loadScad();
  currentParams = extractParams(scadText);

  generateUI(currentParams);
  renderModel(currentParams);
}

function setupThree() {
  const container = document.getElementById("viewer");

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 100;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(1, 1, 1);
  scene.add(light);

  animate();
}

function generateUI(params) {
  const panel = document.getElementById("panel");
  panel.innerHTML = "";

  for (let key in params) {
    const label = document.createElement("label");
    label.innerText = key;

    const input = document.createElement("input");
    input.id = key;
    input.value = params[key];

    panel.appendChild(label);
    panel.appendChild(input);
  }

  const btn = document.createElement("button");
  btn.innerText = "Generate";
  btn.onclick = () => {
    const updated = updateParamsFromUI(params);
    renderModel(updated);
  };

  panel.appendChild(btn);
}

function renderModel(params) {
  if (mesh) scene.remove(mesh);

  const outer = new THREE.CylinderGeometry(
    params.diameter / 2,
    params.diameter / 2,
    params.thickness,
    64
  );

  const inner = new THREE.CylinderGeometry(
    params.inner_diameter / 2,
    params.inner_diameter / 2,
    params.thickness + 2,
    64
  );

  // 简化版：用缩放模拟空心（避免CSG复杂度）
  const material = new THREE.MeshNormalMaterial({ wireframe: false });

  const outerMesh = new THREE.Mesh(outer, material);
  const innerMesh = new THREE.Mesh(inner, material);

  innerMesh.scale.set(0.95, 1, 0.95);

  scene.add(outerMesh);
  scene.add(innerMesh);

  mesh = outerMesh;
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}