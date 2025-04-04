// Three.js 3D Military Object
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('military-3d-container').appendChild(renderer.domElement);

// Create 3D Rotating Military Badge
const geometry = new THREE.TorusKnotGeometry(3, 1, 100, 16);
const material = new THREE.MeshStandardMaterial({ color: 0x28a745, metalness: 0.7, roughness: 0.1 });
const badge = new THREE.Mesh(geometry, material);
scene.add(badge);

// Lighting
const light = new THREE.PointLight(0xffffff, 2, 100);
light.position.set(10, 10, 10);
scene.add(light);

// Camera Position
camera.position.z = 10;

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    badge.rotation.x += 0.01;
    badge.rotation.y += 0.01;
    renderer.render(scene, camera);
}

animate();
