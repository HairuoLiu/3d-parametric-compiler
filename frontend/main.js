let scene, camera, renderer, mesh, controls;
let currentParams = {};

init();

async function init() {
  setupThree();

  const scadText = await loadScad();
  currentParams = extractParams(scadText);

  // ✅ fallback 防止空参数
  if (Object.keys(currentParams).length === 0) {
    currentParams = {
      diameter: 60,
      inner_diameter: 45,
      thickness: 10
    };
  }

  console.log("params:", currentParams);

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

  const diameter = Math.max(1, params.diameter || 60);
  const inner_diameter = Math.max(1, params.inner_diameter || 40);
  const thickness = Math.max(1, params.thickness || 10);

  const outerGeo = new THREE.CylinderGeometry(
    diameter / 2,
    diameter / 2,
    thickness,
    64
  );

  const innerGeo = new THREE.CylinderGeometry(
    inner_diameter / 2,
    inner_diameter / 2,
    thickness + 2,
    64
  );

  const material = new THREE.MeshNormalMaterial();

  const outerMesh = new THREE.Mesh(outerGeo, material);
  const innerMesh = new THREE.Mesh(innerGeo, material);

  innerMesh.scale.set(0.95, 1, 0.95);

  // 👉 用 Group 管理（导出更干净）
  mesh = new THREE.Group();
  mesh.add(outerMesh);
  mesh.add(innerMesh);

  scene.add(mesh);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function downloadSTL() {
  if (!mesh) {
    alert("No model to export");
    return;
  }

  const exporter = new THREE.STLExporter();

  // ⚠️ 导出整个 scene（更安全）
  const result = exporter.parse(scene);

  const blob = new Blob([result], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "lens_adapter.stl";
  link.click();

  URL.revokeObjectURL(url);
}