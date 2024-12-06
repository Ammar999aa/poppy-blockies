import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TextureLoader } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import seedrandom from 'seedrandom';

const gridSizeSelect = document.getElementById('grid-size-select');
const colorCountSelect = document.getElementById('color-count-select');
const actionInput = document.getElementById('moves-input');
const seedInput = document.getElementById('seed-input');
const startButton = document.getElementById('start-button');

startButton.addEventListener('click', () => {
    const gridSize = parseInt(gridSizeSelect.value, 10);
    const colorCount = parseInt(colorCountSelect.value, 10);
    const seedValue = seedInput.value.trim() || Date.now().toString();
    const moveLimit = parseInt(actionInput.value, 10);

    actionCount = moveLimit;
    counterElement.textContent = `Actions: ${actionCount}`;

    if (gridSize > 0 && gridSize <= 20 && colorCount >= 2 && colorCount <= 7) {
        // Clear any existing blocks if needed
        blocks.forEach(block => scene.remove(block));
        blocks.length = 0;

        createBlockGrid(gridSize, colorCount, seedValue);
    } else {
        alert('Please enter a grid size between 1 and 20');
    }
});

const levelSelect = document.getElementById('level-select');
let levelType = levelSelect ? levelSelect.value : 'space';

const scene = new THREE.Scene();

const loader = new TextureLoader();
const bumpMap = loader.load('assets/wood_map.jpg');
const textMap = loader.load('assets/wood_texture.jpg');

if (levelType === 'rustic') {
    const skyboxLoader = new THREE.CubeTextureLoader();
    const skyboxTexture = skyboxLoader.load([
        'assets/field-skyboxes/sky/Daylight Box_Right.bmp',   // +x
        'assets/field-skyboxes/sky/Daylight Box_Left.bmp',    // -x
        'assets/field-skyboxes/sky/Daylight Box_Top.bmp',     // +y
        'assets/field-skyboxes/sky/Daylight Box_Bottom.bmp',  // -y
        'assets/field-skyboxes/sky/Daylight Box_Front.bmp',   // +z
        'assets/field-skyboxes/sky/Daylight Box_Back.bmp'     // -z
    ]);
    scene.background = skyboxTexture;
}

const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10, 15, 30);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();

// Lighting setup
const topLight = new THREE.PointLight(0xffffff, 3, 200);
topLight.position.set(0, 30, 0);
topLight.castShadow = true;
scene.add(topLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.2);
directionalLight2.position.set(-10, -20, -10);
directionalLight2.castShadow = true;
scene.add(directionalLight2);

const ambientLight = new THREE.AmbientLight(0x888888);
scene.add(ambientLight);
ambientLight.intensity = 2;

if (levelType === 'rustic') {
    topLight.color.set(0xffffff);
    directionalLight.color.set(0xfff4e0);
    ambientLight.color.set(0xaaa499);
    ambientLight.intensity = 1.5;
}

let clock = new THREE.Clock();

// Raycaster and mouse vector
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredBlock = null;

// Array to store blocks
const blocks = [];

// Predefine colors
const oak = 0xA1662F;
const birch = 0xefdbaa;
const redwood = 0x856425;
const somewood = 0xbf8f35;
const mahagony = 0xC04000;
const darkwood = 0x523e17;
const cedarwood = 0x9f4e35;
const red = 0xFF6F61;
const orange = 0xFFB347;
const yellow = 0xFFD700;
const green = 0x6DD47E;
const blue = 0x6EC1E4;
const purple = 0x9B51E0;
const pink = 0xF3A5B1;

// Precompute geometry & materials for cubes and frustums
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const rusticCubeMaterialBase = new THREE.MeshStandardMaterial({ map: textMap, bumpMap: bumpMap, bumpScale: 1.4 });
const spaceCubeMaterialBase = new THREE.MeshStandardMaterial({ color: 0xffffff });

// Create the frustum geometry and UVs once
function createFrustumGeometry() {
    const bottomSize = 0.5;
    const woodHeight = 0.075;
    const woodTopSize = 0.45;
    const spaceHeight = 0.15;
    const spaceTopSize = 0.25;

    const height = (levelType === 'rustic') ? woodHeight : spaceHeight;
    const topSize = (levelType === 'rustic') ? woodTopSize : spaceTopSize;

    const vertices = [
        -bottomSize, 0, -bottomSize,
         bottomSize, 0, -bottomSize,
         bottomSize, 0,  bottomSize,
        -bottomSize, 0,  bottomSize,

        -topSize, height, -topSize,
         topSize, height, -topSize,
         topSize, height,  topSize,
        -topSize, height,  topSize
    ];

    const indices = [
        0, 2, 1, 0, 3, 2,
        4, 5, 6, 4, 6, 7,
        0, 1, 5, 0, 5, 4,
        1, 2, 6, 1, 6, 5,
        2, 3, 7, 2, 7, 6,
        3, 0, 4, 3, 4, 7
    ];

    const uvs = [
        // Bottom face
        0,0, 1,0, 1,1, 0,1,
        // Top face
        0.25,0.25, 0.75,0.25, 0.75,0.75, 0.25,0.75
    ];

    const geometry = new THREE.BufferGeometry();
    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute([
        0,0,1,0,1,1,0,1, // bottom
        0,0,1,0,1,1,0,1, // top
        0,0,1,0,1,1,0,1, // side - repeated pattern for simplicity
        0,0,1,0,1,1,0,1,
        0,0,1,0,1,1,0,1,
        0,0,1,0,1,1,0,1
    ], 2));
    geometry.computeVertexNormals();

    return geometry;
}

const frustumGeometry = createFrustumGeometry();
const frustumMaterial = levelType == 'rustic' ? new THREE.MeshPhongMaterial({
    color: 0xffa07a,
    shininess: 5,
    specular: 0xffffff,
    side: THREE.DoubleSide,
    bumpMap: bumpMap,
    map: textMap,
    bumpScale: 1.1,
}) : 
new THREE.MeshPhongMaterial({
    color: 0xffa07a,
    shininess: 80,
    specular: 0xffffff,
    side: THREE.DoubleSide});

// Particle Setup
let particleMesh
const particles = [];
const dummy = new THREE.Object3D();
if (levelType === 'space') {
    const particleCount = 10000 / 1.7; 
    const particleGeometry = new THREE.DodecahedronGeometry(0.1, 0);
    const particleMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x888888,
        metalness: 1.0,
        roughness: 0.2,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: 2,
    });
    particleMesh = new THREE.InstancedMesh(particleGeometry, particleMaterial, particleCount);
    scene.add(particleMesh);

    for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * 60 - 25;
        const y = Math.random() * 60 - 25;
        const z = Math.random() * 60 - 25;
        const scale = Math.random() * 0.1 + 0.07;

        particles.push({
            position: { x, y, z },
            scale,
            speed: Math.random() * 0.02 + 0.01,
            factor: Math.random() * 10 + 1,
        });
    }
} else if (levelType === 'rustic') {
    const pollenCount = 500; 
    const pollenGeometry = new THREE.SphereGeometry(0.05, 6, 6);
    const pollenMaterial = new THREE.MeshBasicMaterial({ color: 0xffdf9e });
    particleMesh = new THREE.InstancedMesh(pollenGeometry, pollenMaterial, pollenCount);
    scene.add(particleMesh);

    for (let i = 0; i < pollenCount; i++) {
        const x = Math.random() * 30 - 15;
        const y = Math.random() * 30 - 10;
        const z = Math.random() * 30 - 15;
        const scale = Math.random() * 0.1 + 0.05;

        particles.push({
            position: { x, y, z },
            scale,
            speed: Math.random() * 0.005 + 0.002,
            factor: Math.random() * 4 + 1,
        });
    }
}

function animateParticles() {
    particles.forEach((particle, i) => {
        const t = clock.getElapsedTime() * particle.speed;

        dummy.position.set(
            particle.position.x + 0.3 * Math.cos(t * particle.factor),
            particle.position.y + 0.3 * Math.sin(t * particle.factor),
            particle.position.z + 0.3 * Math.sin(t * particle.factor)
        );

        const scale = particle.scale * (1 + Math.sin(t) * 0.5);
        dummy.scale.set(scale, scale, scale);

        dummy.rotation.set(t * 2, t * 3, t * 4);
        dummy.updateMatrix();
        particleMesh.setMatrixAt(i, dummy.matrix);
    });

    particleMesh.instanceMatrix.needsUpdate = true;
}

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.5, 
    0.8, 
    0.9
);
composer.addPass(bloomPass);

function createPyramidFrustum(space = false) {
    // Minimal change: now we just reuse the precomputed frustumGeometry and frustumMaterial
    const frustum = new THREE.Mesh(frustumGeometry, frustumMaterial);
    frustum.castShadow = true;
    frustum.receiveShadow = true;
    return frustum;
}

export function createBlockGrid(size, colorCount = 7, seed = Date.now().toString()) {
    const rng = seedrandom(seed);

    const colors = [red, orange, yellow, green, blue, purple, pink].slice(0, colorCount);
    const woodColors = [oak, darkwood, mahagony, cedarwood, redwood, birch, somewood].slice(0, colorCount);

    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            for (let z = 0; z < size; z++) {
                let chosenColor;
                let material;
                if (levelType === 'rustic') {
                    chosenColor = woodColors[Math.floor(rng() * woodColors.length)];
                    material = rusticCubeMaterialBase.clone();
                    material.color.set(chosenColor);
                } else {
                    chosenColor = colors[Math.floor(rng() * colors.length)];
                    material = spaceCubeMaterialBase.clone();
                    material.color.set(chosenColor);
                }

                // Use precomputed geometry
                const cube = new THREE.Mesh(cubeGeometry, material);
                cube.castShadow = true;
                cube.receiveShadow = true;

                const group = new THREE.Group();
                group.add(cube);

                if (levelType === 'rustic') {
                    const frustumsData = [
                        { rotation: [0, 0, 0], position: [0, 0.5, 0] },
                        { rotation: [Math.PI, 0, 0], position: [0, -0.5, 0] },
                        { rotation: [Math.PI / 2, 0, 0], position: [0, 0, 0.5] },
                        { rotation: [-Math.PI / 2, 0, 0], position: [0, 0, -0.5] },
                        { rotation: [0, 0, -Math.PI / 2], position: [0.5, 0, 0] },
                        { rotation: [0, 0, Math.PI / 2], position: [-0.5, 0, 0] }
                    ];
                    frustumsData.forEach(data => {
                        const frustum = createPyramidFrustum(false);
                        frustum.material = frustum.material.clone(); 
                        frustum.material.color.set(chosenColor);
                        frustum.rotation.set(...data.rotation);
                        frustum.position.set(...data.position);
                        group.add(frustum);
                    });
                }
                if (levelType === 'space') {
                    const frustumsData = [
                        { rotation: [0, 0, 0], position: [0, 0.5, 0] },
                        { rotation: [Math.PI, 0, 0], position: [0, -0.5, 0] },
                        { rotation: [Math.PI / 2, 0, 0], position: [0, 0, 0.5] },
                        { rotation: [-Math.PI / 2, 0, 0], position: [0, 0, -0.5] },
                        { rotation: [0, 0, -Math.PI / 2], position: [0.5, 0, 0] },
                        { rotation: [0, 0, Math.PI / 2], position: [-0.5, 0, 0] }
                    ];
                    frustumsData.forEach(data => {
                        const frustum = createPyramidFrustum(true);
                        frustum.material = frustum.material.clone(); 
                        frustum.rotation.set(...data.rotation);
                        frustum.position.set(...data.position);
                        frustum.material.color.set(chosenColor);
                        group.add(frustum);
                    });
                }

                group.position.set(
                    x - (size / 2) + 0.5,
                    y - (size / 2) + 0.5,
                    z - (size / 2) + 0.5
                );

                group.userData.color = chosenColor;
                scene.add(group);
                blocks.push(group);
            }
        }
    }
}

// This is just for the preview before the game begins
createBlockGrid(5);

// Event listeners
window.addEventListener('resize', onWindowResize, false);
document.addEventListener('keydown', onKeyDown, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

let score = 0;
let actionCount = 0;

const scoreElement = document.getElementById('score');
const counterElement = document.getElementById('counter');
const resetButton = document.getElementById('reset-button');

resetButton.addEventListener('click', resetGame);

// Variables for rotating a slice
let isRotating = false;

function checkGameConditions() {
    if (blocks.length <= 0) {
        showWinScreen();
        return;
    }
    if (actionCount <= 0) {
        showLoseScreen();
        return;
    }
}

function showWinScreen() {
    const winScreen = document.getElementById('win-screen');
    winScreen.classList.remove('hidden');
}

function showLoseScreen() {
    const loseScreen = document.getElementById('lose-screen');
    loseScreen.classList.remove('hidden');
}

document.getElementById('restart-button-win').addEventListener('click', restartGame);
document.getElementById('restart-button-lose').addEventListener('click', restartGame);

function updateScore(points) {
    score += points;
    scoreElement.textContent = `Score: ${score}`;
}

function restartGame() {
    location.reload();
}

function updateCounter() {
    actionCount--;
    counterElement.textContent = `Actions: ${actionCount}`;
    checkGameConditions();
}

function resetGame() {
    score = 0;
    actionCount = 0;
    scoreElement.textContent = 'Score: 0';
    counterElement.textContent = 'Actions: 0';
}

function changeGroupColor(group, color) {
    group.children.forEach(child => {
        if (child.isMesh && child.material) {
            child.material.color.set(color);
        }
    });
}

function onKeyDown(event) {
    let valid_moves = ['1', '2', '3', '4', '5', '6', '7', ' ', 'a', 's', 'd'];

    let position;
    let col;

    if (hoveredBlock) {
        position = hoveredBlock.position.clone();
        col = hoveredBlock.children[0].material.color;
    }

    if (hoveredBlock) {
        if (event.key === '1') {
            changeGroupColor(hoveredBlock, purple);
            hoveredBlock.userData.color = purple;
        } else if (event.key === '2') {
            changeGroupColor(hoveredBlock, red);
            hoveredBlock.userData.color = red;
        } else if (event.key === '3') {
            changeGroupColor(hoveredBlock, orange);
            hoveredBlock.userData.color = orange;
        } else if (event.key === '4') {
            changeGroupColor(hoveredBlock, yellow);
            hoveredBlock.userData.color = yellow;
        } else if (event.key === '5') {
            changeGroupColor(hoveredBlock, green);
            hoveredBlock.userData.color = green;
        } else if (event.key === '6') {
            changeGroupColor(hoveredBlock, blue);
            hoveredBlock.userData.color = blue;
        } else if (event.key === '7') {
            changeGroupColor(hoveredBlock, pink);
            hoveredBlock.userData.color = pink;
        }

        if (event.key === ' ') {
            const color = hoveredBlock.userData.color;
            removeBlockAndNeighbors(hoveredBlock, color);
            createParticleEffect(position, col);
        }

        if (event.key === 'a') {
            rotateVerticalSlice(hoveredBlock.position.x, 'x');
        }
        if (event.key === 's') {
            rotateVerticalSlice(hoveredBlock.position.y, 'y');
        }
        if (event.key === 'd') {
            rotateVerticalSlice(hoveredBlock.position.z, 'z');
        }

        for (let i = 0; i < valid_moves.length; i++) {
            if (event.key === valid_moves[i] && hoveredBlock) {
                updateCounter();
            }
        }
    }
}

function createParticleEffect(position, col) {
    const particleCount = 200;
    const particlesGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        const x = position.x + (Math.random() - 0.5) * 2;
        const y = position.y + (Math.random() - 0.5) * 2;
        const z = position.z + (Math.random() - 0.5) * 2;
        particlePositions[i * 3] = x;
        particlePositions[i * 3 + 1] = y;
        particlePositions[i * 3 + 2] = z;

        particleVelocities[i * 3] = (Math.random() - 0.5) * 0.1;
        particleVelocities[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
        particleVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particlesGeo.setAttribute('velocity', new THREE.BufferAttribute(particleVelocities, 3));

    const particleMaterial = new THREE.PointsMaterial({
        color: col,
        size: 0.15,
        transparent: true,
        opacity: 0.8,
    });

    const particleSystem = new THREE.Points(particlesGeo, particleMaterial);
    scene.add(particleSystem);

    let particleLifetime = 1.0;
    function animateParticlesFade() {
        particleLifetime -= 0.02;
        particleMaterial.opacity = Math.max(0, particleLifetime);

        const positions = particlesGeo.attributes.position.array;
        const velocities = particlesGeo.attributes.velocity.array;

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] += velocities[i * 3];
            positions[i * 3 + 1] += velocities[i * 3 + 1];
            positions[i * 3 + 2] += velocities[i * 3 + 2];
        }

        particlesGeo.attributes.position.needsUpdate = true;

        if (particleLifetime > 0) {
            requestAnimationFrame(animateParticlesFade);
        } else {
            scene.remove(particleSystem);
        }
    }
    animateParticlesFade();
}

function updateHoveredBlock() {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(blocks, true);

    if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object.parent && object.parent.isGroup) {
            hoveredBlock = object.parent; 
        } else {
            hoveredBlock = object;
        }
    } else {
        hoveredBlock = null;
    }
}

document.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

function removeBlockAndNeighbors(block, color) {
    if (!block) return;

    const index = blocks.indexOf(block);
    if (index === -1) return;

    scene.remove(block);
    blocks.splice(index, 1);

    const { x, y, z } = block.position;

    const neighbors = [
        getBlockAt(x + 1, y, z),
        getBlockAt(x - 1, y, z),
        getBlockAt(x, y + 1, z),
        getBlockAt(x, y - 1, z),
        getBlockAt(x, y, z + 1),
        getBlockAt(x, y, z - 1)
    ];

    neighbors.forEach(neighbor => {
        if (neighbor && neighbor.userData.color === color) {
            removeBlockAndNeighbors(neighbor, color);
        }
    });
}

function getBlockAt(x, y, z) {
    return blocks.find(block =>
        Math.round(block.position.x) === Math.round(x) &&
        Math.round(block.position.y) === Math.round(y) &&
        Math.round(block.position.z) === Math.round(z)
    );
}

let rotating = false;

function rotateVerticalSlice(coordinate, axis) {
    if (rotating) return;
    rotating = true;

    let sliceBlocks;
    if (axis === 'x') {
        sliceBlocks = blocks.filter(block => Math.round(block.position.x) === Math.round(coordinate));
    } else if (axis === 'y') {
        sliceBlocks = blocks.filter(block => Math.round(block.position.y) === Math.round(coordinate));
    } else if (axis === 'z') {
        sliceBlocks = blocks.filter(block => Math.round(block.position.z) === Math.round(coordinate));
    }

    const tempGroup = new THREE.Group();
    sliceBlocks.forEach(block => tempGroup.add(block));
    scene.add(tempGroup);

    const duration = 600;
    const startTime = performance.now();
    const targetAngle = Math.PI/2;

    function animateRotation() {
        const elapsedTime = performance.now() - startTime;
        const t = Math.min(elapsedTime / duration, 1);
        const currentAngle = targetAngle * t;

        if (axis === 'x') {
            tempGroup.rotation.x = currentAngle;
        } else if (axis === 'y') {
            tempGroup.rotation.y = currentAngle;
        } else if (axis === 'z') {
            tempGroup.rotation.z = currentAngle;
        }

        renderer.render(scene, camera);

        if (t < 1) {
            requestAnimationFrame(animateRotation);
        } else {
            rotating = false;
            sliceBlocks.forEach(block => {
                const worldPosition = new THREE.Vector3();
                block.getWorldPosition(worldPosition);
                block.position.copy(worldPosition);

                const worldQuaternion = new THREE.Quaternion();
                block.getWorldQuaternion(worldQuaternion);
                block.quaternion.copy(worldQuaternion);

                tempGroup.remove(block);
                scene.add(block);
            });
            scene.remove(tempGroup);
            updateBlocksArray();
        }
    }

    animateRotation();
}

function updateBlocksArray() {
    blocks.forEach(block => {
        block.updateMatrixWorld();
        block.position.setFromMatrixPosition(block.matrixWorld);
        block.rotation.setFromRotationMatrix(block.matrixWorld);
    });
}

animate();

function animate() {
    requestAnimationFrame(animate);

    updateHoveredBlock();
    animateParticles();
    composer.render();
}
