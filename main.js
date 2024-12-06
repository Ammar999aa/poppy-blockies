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
const textMap = loader.load('assets/wood_texture.jpg')


// I need to set the skybox at game-setup instead!
if (levelType === 'rustic') {
    console.log("deff rust")
    const skyboxLoader = new THREE.CubeTextureLoader();
    const skyboxTexture = skyboxLoader.load([
        'assets/field-skyboxes/sky_inter/xpos.png',
        'assets/field-skyboxes/sky_inter/xneg.png',
        'assets/field-skyboxes/sky_inter/ypos.png',
        'assets/field-skyboxes/sky_inter/yneg.png',
        'assets/field-skyboxes/sky_inter/zpos.png',
        'assets/field-skyboxes/sky_inter/zneg.png'
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

const oak = 0xA1662F
const birch = 0xefdbaa
const redwood = 0x856425
const somewood = 0xbf8f35
const mahagony = 0xC04000
const darkwood = 0x523e17
const cedarwood = 0x9f4e35
const red = 0xFF6F61
const orange = 0xFFB347
const yellow = 0xFFD700
const green = 0x6DD47E
const blue = 0x6EC1E4
const purple = 0x9B51E0
const pink = 0xF3A5B1

let particleMesh
const particles = [];
const dummy = new THREE.Object3D();
if (levelType === 'space') {
    const particleCount = 10000 / 1.7; // Number of particles

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

    // Add particles to the scene
    scene.add(particleMesh);
    // Generate random particle positions, rotations, and scales
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
}
else if (levelType === 'rustic') {
    const pollenCount = 500; // Much fewer than space
    const pollenGeometry = new THREE.SphereGeometry(0.05, 6, 6);
    const pollenMaterial = new THREE.MeshBasicMaterial({
        color: 0xffdf9e // a warm, pollen-like color
    });
    particleMesh = new THREE.InstancedMesh(pollenGeometry, pollenMaterial, pollenCount);
    scene.add(particleMesh);

    // Generate random pollen positions, subtle motion, less pronounced movement
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

        // Update position to oscillate
        dummy.position.set(
            particle.position.x + 0.3 * Math.cos(t * particle.factor),
            particle.position.y + 0.3 * Math.sin(t * particle.factor),
            particle.position.z + 0.3 * Math.sin(t * particle.factor)
        );

        // Update scale for pulsating effect
        const scale = particle.scale * (1 + Math.sin(t) * 0.5);
        dummy.scale.set(scale, scale, scale);

        // Update rotation for dynamic movement
        dummy.rotation.set(t * 2, t * 3, t * 4);

        // Update transformation matrix
        dummy.updateMatrix();
        particleMesh.setMatrixAt(i, dummy.matrix);
    });

    // Notify Three.js that the instanced mesh has updated
    particleMesh.instanceMatrix.needsUpdate = true;
}
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.5, // Intensity (Increase for stronger bloom)
    0.8, // Radius (Set to 0 for sharper highlights)
    0.9
);
composer.addPass(bloomPass);

function createPyramidFrustum(space = false) {
    const spaceHeight = 0.15;
    const spaceTopSize = 0.25; // Size of the top face
    const bottomSize = 0.5; // Size of the bottom face

    const woodHeight = 0.075
    const woodTopSize = 0.45 
    let height, topSize;
    if(space){ height = spaceHeight; topSize = spaceTopSize;}
    else {height = woodHeight; topSize = woodTopSize}


    // Define the vertices for a frustum (truncated pyramid)
    const vertices = [
        // Bottom face (square)
        -bottomSize, 0, -bottomSize, // 0
        bottomSize, 0, -bottomSize, // 1
        bottomSize, 0, bottomSize, // 2
        -bottomSize, 0, bottomSize, // 3

        // Top face (smaller square)
        -topSize, height, -topSize, // 4
        topSize, height, -topSize, // 5
        topSize, height, topSize, // 6
        -topSize, height, topSize  // 7
    ];

    // Define the faces (two triangles per side)
    const indices = [
        // Bottom face (ensure correct winding order)
        0, 2, 1, 0, 3, 2,

        // Top face (ensure correct winding order)
        4, 5, 6, 4, 6, 7,

        // Sides (correct winding order)
        0, 1, 5, 0, 5, 4, // Front side
        1, 2, 6, 1, 6, 5, // Right side
        2, 3, 7, 2, 7, 6, // Back side
        3, 0, 4, 3, 4, 7  // Left side
    ];
    const uvs = [
        // Bottom face UVs (mapped as a square)
        0, 0,  // Vertex 0
        1, 0,  // Vertex 1
        1, 1,  // Vertex 2
        0, 1,  // Vertex 3

        // Top face UVs (mapped as a square)
        0.25, 0.25,  // Vertex 4
        0.75, 0.25,  // Vertex 5
        0.75, 0.75,  // Vertex 6
        0.25, 0.75,  // Vertex 7

        // Side faces UVs (mapped as rectangles, one per side)
        // Front side
        0, 0, 1, 0, 1, 1, 0, 1,
        // Right side
        0, 0, 1, 0, 1, 1, 0, 1,
        // Back side
        0, 0, 1, 0, 1, 1, 0, 1,
        // Left side
        0, 0, 1, 0, 1, 1, 0, 1
    ];

    // Create the geometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); // Add UVs
    geometry.computeVertexNormals();

    // Create a material with a shiny look and double-sided rendering
    const material = new THREE.MeshPhongMaterial({
        color: 0xffa07a, // Adjust the color as desired
        shininess: 5,
        specular: 0xffffff,
        side: THREE.DoubleSide, // Render both sides of each face
        bumpMap: bumpMap,
        map: textMap,
        bumpScale: 1.1,
    });

    // Create the mesh
    const frustum = new THREE.Mesh(geometry, material);
    frustum.castShadow = true;
    frustum.receiveShadow = true;

    return frustum;
}

// Function to create a grid of blocks with no gaps
export function createBlockGrid(size, colorCount = 7, seed = Date.now().toString()) {
    const rng = seedrandom(seed);

    // For rustic level, we use woodColors and textures
    const colors = [red, orange, yellow, green, blue, purple, pink].slice(0, colorCount);
    const woodColors = [oak, darkwood, mahagony, cedarwood, redwood, birch, somewood].slice(0, colorCount);

    function createFrustumWithColor(color, rotation = [0, 0, 0], position = [0, 0, 0], space = false) {
        const frustum = createPyramidFrustum(space);
        frustum.material.color.set(color);
        frustum.rotation.set(...rotation);
        frustum.position.set(...position);
        return frustum;
    }

    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            for (let z = 0; z < size; z++) {
                let chosenColor;
                let material;
                if (levelType === 'rustic') {
                    // Use wood colors and texture maps
                    chosenColor = woodColors[Math.floor(rng() * woodColors.length)];
                    material = new THREE.MeshStandardMaterial({ 
                        color: chosenColor, 
                        map: textMap, 
                        bumpMap: bumpMap, 
                        bumpScale: 1.4 
                    });
                } else {
                    // Space level with plain colors
                    chosenColor = colors[Math.floor(rng() * colors.length)];
                    material = new THREE.MeshStandardMaterial({ color: chosenColor });
                }

                const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
                const cube = new THREE.Mesh(cubeGeometry, material);
                cube.castShadow = true;
                cube.receiveShadow = true;

                const group = new THREE.Group();
                group.add(cube);

                if (levelType === 'rustic') {
                    // Add the frustums in rustic mode
                    const frustumsData = [
                        { rotation: [0, 0, 0], position: [0, 0.5, 0] },
                        { rotation: [Math.PI, 0, 0], position: [0, -0.5, 0] },
                        { rotation: [Math.PI / 2, 0, 0], position: [0, 0, 0.5] },
                        { rotation: [-Math.PI / 2, 0, 0], position: [0, 0, -0.5] },
                        { rotation: [0, 0, -Math.PI / 2], position: [0.5, 0, 0] },
                        { rotation: [0, 0, Math.PI / 2], position: [-0.5, 0, 0] }
                    ];
                    frustumsData.forEach(data => {
                        const frustum = createFrustumWithColor(chosenColor, data.rotation, data.position);
                        group.add(frustum);
                    });
                }
                if (levelType === 'space') {
                    // Add the frustums in rustic mode
                    const frustumsData = [
                        { rotation: [0, 0, 0], position: [0, 0.5, 0] },
                        { rotation: [Math.PI, 0, 0], position: [0, -0.5, 0] },
                        { rotation: [Math.PI / 2, 0, 0], position: [0, 0, 0.5] },
                        { rotation: [-Math.PI / 2, 0, 0], position: [0, 0, -0.5] },
                        { rotation: [0, 0, -Math.PI / 2], position: [0.5, 0, 0] },
                        { rotation: [0, 0, Math.PI / 2], position: [-0.5, 0, 0] }
                    ];
                    frustumsData.forEach(data => {
                        const frustum = createFrustumWithColor(chosenColor, data.rotation, data.position, true);
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
let rotating = false;
let sliceBlocks = null;
let rotationAngle = 0;
let targetAngle = Math.PI / 2; // 90 degrees

function checkGameConditions() {
    // Win condition: all blocks are popped
    if (blocks.length <= 0) {
        showWinScreen();
        return;
    }

    // Lose condition: no moves left and blocks remain
    if (actionCount <= 0) {
        showLoseScreen();
        return;
    }
}

function showWinScreen() {
    const winScreen = document.getElementById('win-screen');
    winScreen.classList.remove('hidden'); // Show the win screen
}

function showLoseScreen() {
    const loseScreen = document.getElementById('lose-screen');
    loseScreen.classList.remove('hidden'); // Show the lose screen
}

document.getElementById('restart-button-win').addEventListener('click', restartGame);
document.getElementById('restart-button-lose').addEventListener('click', restartGame);

// Function to update the score
function updateScore(points) {
    score += points;
    scoreElement.textContent = `Score: ${score}`;
}

// Not to be confused with the currently unused resetGame function
function restartGame() {
    location.reload(); // Reload the page to reset the game
}

// Function to update the action counter
function updateCounter() {
    actionCount--;
    counterElement.textContent = `Actions: ${actionCount}`;

    checkGameConditions();
}

// Not to be confused with restartGame
function resetGame() {
    score = 0;
    actionCount = 0;
    scoreElement.textContent = 'Score: 0';
    counterElement.textContent = 'Actions: 0';
}

function changeGroupColor(group, color) {
    // Loop through all children of the group
    group.children.forEach(child => {
        if (child.isMesh && child.material) {
            child.material.color.set(color);
        }
    });
}

function onKeyDown(event) {
    // Determine if the counter should increment
    let valid_moves = ['1', '2', '3', '4', '5', '6', '7', ' ', 'a', 's', 'd']

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

        // Remove the hovered block and its neighbors when pressing space bar
        if (event.key === ' ') {
            const color = hoveredBlock.userData.color;
            console.log(color.toString(16))
            removeBlockAndNeighbors(hoveredBlock, color);
            createParticleEffect(position, col);
        }

        // Rotate the slice when pressing 'a'
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
    const particleCount = 200; // Number of particles
    const particles = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = new Float32Array(particleCount * 3); // Store velocities

    for (let i = 0; i < particleCount; i++) {
        // Set initial random positions for each particle around the cube's position
        const x = position.x + (Math.random() - 0.5) * 2;
        const y = position.y + (Math.random() - 0.5) * 2;
        const z = position.z + (Math.random() - 0.5) * 2;
        particlePositions[i * 3] = x;
        particlePositions[i * 3 + 1] = y;
        particlePositions[i * 3 + 2] = z;

        // Set a random velocity for each particle
        particleVelocities[i * 3] = (Math.random() - 0.5) * 0.1; // x velocity
        particleVelocities[i * 3 + 1] = (Math.random() - 0.5) * 0.1; // y velocity
        particleVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1; // z velocity
    }

    particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particles.setAttribute('velocity', new THREE.BufferAttribute(particleVelocities, 3));

    const particleMaterial = new THREE.PointsMaterial({
        color: col, // Particle color 
        size: 0.15,       // Size of each particle
        transparent: true,
        opacity: 0.8,
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    // Animate the particles to move and fade out
    let particleLifetime = 1.0;
    function animateParticles() {
        particleLifetime -= 0.02;
        particleMaterial.opacity = Math.max(0, particleLifetime); // Reduce opacity over time

        // Update particle positions based on velocity
        const positions = particles.attributes.position.array;
        const velocities = particles.attributes.velocity.array;

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] += velocities[i * 3];       // x position += x velocity
            positions[i * 3 + 1] += velocities[i * 3 + 1]; // y position += y velocity
            positions[i * 3 + 2] += velocities[i * 3 + 2]; // z position += z velocity
        }

        particles.attributes.position.needsUpdate = true; // Inform Three.js to update the positions

        if (particleLifetime > 0) {
            requestAnimationFrame(animateParticles);
        } else {
            scene.remove(particleSystem); // Remove the particle system once faded out
        }
    }
    animateParticles();
}

// Update the raycaster to detect hovered block
function updateHoveredBlock() {
    raycaster.setFromCamera(mouse, camera);

    // Use `true` as the second parameter to check children of groups
    const intersects = raycaster.intersectObjects(blocks, true);

    if (intersects.length > 0) {
        const object = intersects[0].object;

        // Check if the intersected object is part of a group
        if (object.parent && object.parent.isGroup) {
            hoveredBlock = object.parent; // Set hoveredBlock to the entire group
        } else {
            hoveredBlock = object;
        }
    } else {
        hoveredBlock = null;
    }
}

// Track mouse movements
document.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Recursive function to remove a block and its neighbors of the same color
function removeBlockAndNeighbors(block, color) {
    if (!block) return;

    const index = blocks.indexOf(block);
    if (index === -1) return;

    // Remove the block from the scene and the blocks array
    scene.remove(block);
    blocks.splice(index, 1);

    const { x, y, z } = block.position;

    // Check adjacent blocks (6 directions)
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

// Function to find a block at a given position
function getBlockAt(x, y, z) {
    return blocks.find(block =>
        Math.round(block.position.x) === Math.round(x) &&
        Math.round(block.position.y) === Math.round(y) &&
        Math.round(block.position.z) === Math.round(z)
    );
}

let isRotating = false;

function rotateVerticalSlice(coordinate, axis) {
    // Get all blocks in the slice that share the same coordinate based on the axis
    // if already running
    if (isRotating) return;
    isRotating = true;

    let sliceBlocks;
    if (axis === 'x') {
        sliceBlocks = blocks.filter(block => Math.round(block.position.x) === Math.round(coordinate));
    } else if (axis === 'y') {
        sliceBlocks = blocks.filter(block => Math.round(block.position.y) === Math.round(coordinate));
    } else if (axis === 'z') {
        sliceBlocks = blocks.filter(block => Math.round(block.position.z) === Math.round(coordinate));
    }

    // Create a temporary group and add the slice blocks to it
    const tempGroup = new THREE.Group();
    sliceBlocks.forEach(block => tempGroup.add(block));
    scene.add(tempGroup);

    // Set up animation variables
    const duration = 600; // Duration in milliseconds (1 second)
    const startTime = performance.now();
    const targetAngle = Math.PI/2; // Rotate 180 degrees

    function animateRotation() {
        const elapsedTime = performance.now() - startTime;
        const t = Math.min(elapsedTime / duration, 1); // Calculate normalized time (0 to 1)

        // Interpolate the rotation angle
        const currentAngle = targetAngle * t;

        // Apply rotation to the group
        if (axis === 'x') {
            tempGroup.rotation.x = currentAngle;
        } else if (axis === 'y') {
            tempGroup.rotation.y = currentAngle;
        } else if (axis === 'z') {
            tempGroup.rotation.z = currentAngle;
        }

        // Render the updated scene
        renderer.render(scene, camera);

        // Continue the animation until complete
        if (t < 1) {
            requestAnimationFrame(animateRotation);
        } else {
            // After animation, bake the group's transformation into each block
            isRotating = false;
            sliceBlocks.forEach(block => {
                const worldPosition = new THREE.Vector3();
                block.getWorldPosition(worldPosition);
                block.position.copy(worldPosition);

                const worldQuaternion = new THREE.Quaternion();
                block.getWorldQuaternion(worldQuaternion);
                block.quaternion.copy(worldQuaternion);

                // Remove block from group and re-add to scene
                tempGroup.remove(block);
                scene.add(block);
            });

            // Remove the group from the scene
            scene.remove(tempGroup);

            // Update the `blocks` array to reflect the new positions and rotations
            updateBlocksArray();
        }
    }

    animateRotation();
}

// Function to update the `blocks` array
function updateBlocksArray() {
    blocks.forEach(block => {
        block.updateMatrixWorld(); // Ensure the block's world matrix is updated
        block.position.setFromMatrixPosition(block.matrixWorld);
        block.rotation.setFromRotationMatrix(block.matrixWorld);
    });
}


animate();

function animate() {
    requestAnimationFrame(animate);

    // Check for hovered block
    updateHoveredBlock();

    animateParticles();

    // Animate the slice rotation if needed
    // animateRotation();

    // Render the scene
    composer.render();

}
