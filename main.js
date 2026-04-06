let scene, camera, renderer, mesh;

init();

function init() {
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

  const controls = new THREE.OrbitControls(camera, renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(1, 1, 1).normalize();
  scene.add(light);

  animate();
}

function generate() {
  const diameter = parseFloat(document.getElementById("diameter").value);
  const thickness = parseFloat(document.getElementById("thickness").value);

  const model = compileModel({ diameter, thickness });

  if (mesh) scene.remove(mesh);

  const geometry = new THREE.CylinderGeometry(
    model.diameter / 2,
    model.diameter / 2,
    model.thickness,
    64
  );

  const material = new THREE.MeshNormalMaterial();
  mesh = new THREE.Mesh(geometry, material);

  scene.add(mesh);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}