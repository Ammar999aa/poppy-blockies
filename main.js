import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';


const scene = new THREE.Scene();

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


let clock = new THREE.Clock();

// Raycaster and mouse vector
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredBlock = null;

// Array to store blocks
const blocks = [];

const red = 0xFF6F61
const orange = 0xFFB347
const yellow = 0xFFD700
const green = 0x6DD47E
const blue = 0x6EC1E4
const purple = 0x9B51E0
const pink = 0xF3A5B1

const particleCount = 10000 / 1.7; // Number of particles
const dummy = new THREE.Object3D();

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
const particleMesh = new THREE.InstancedMesh(particleGeometry, particleMaterial, particleCount);

// Add particles to the scene
scene.add(particleMesh);

// Generate random particle positions, rotations, and scales
const particles = [];
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

// Animate the particles
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



function createPyramidFrustum() {
    const height = 0.15;
    const topSize = 0.25; // Size of the top face
    const bottomSize = 0.5; // Size of the bottom face

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

    // Create the geometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    // Create a material with a shiny look and double-sided rendering
    const material = new THREE.MeshPhongMaterial({
        color: 0xffa07a, // Adjust the color as desired
        shininess: 80,
        specular: 0xffffff,
        side: THREE.DoubleSide // Render both sides of each face
    });

    // Create the mesh
    const frustum = new THREE.Mesh(geometry, material);
    frustum.castShadow = true;
    frustum.receiveShadow = true;

    return frustum;
}

// Function to create a grid of blocks with no gaps
function createBlockGrid(size) {
    const colors = [red, orange, yellow, green, blue, purple, pink];

    // Helper function to create a frustum and set its properties
    function createFrustumWithColor(color, rotation = [0, 0, 0], position = [0, 0, 0]) {
        const frustum = createPyramidFrustum();
        frustum.material.color.set(color);
        frustum.rotation.set(rotation[0], rotation[1], rotation[2]);
        frustum.position.set(position[0], position[1], position[2]);
        frustum.castShadow = true;
        frustum.receiveShadow = true;
        return frustum;
    }

    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            for (let z = 0; z < size; z++) {
                // Assign a random color to each block
                const randomColor = colors[Math.floor(Math.random() * colors.length)];

                // Create the central cube
                const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
                const cubeMaterial = new THREE.MeshPhongMaterial({ color: randomColor });
                const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
                cube.castShadow = true;
                cube.receiveShadow = true;

                // Create all the frustums and add them to a group
                const group = new THREE.Group();
                group.add(cube);

                // Define the rotations and positions for each frustum
                const frustumsData = [
                    { rotation: [0, 0, 0], position: [0, 0.5, 0] },
                    { rotation: [Math.PI, 0, 0], position: [0, -0.5, 0] },
                    { rotation: [Math.PI / 2, 0, 0], position: [0, 0, 0.5] },
                    { rotation: [-Math.PI / 2, 0, 0], position: [0, 0, -0.5] },
                    { rotation: [0, 0, -Math.PI / 2], position: [0.5, 0, 0] },
                    { rotation: [0, 0, Math.PI / 2], position: [-0.5, 0, 0] }
                ];

                // Create frustums using the helper function
                frustumsData.forEach(data => {
                    const frustum = createFrustumWithColor(randomColor, data.rotation, data.position);
                    group.add(frustum);
                });

                // Position the group in the 3D grid
                group.position.set(
                    x - (size / 2) + 0.5,
                    y - (size / 2) + 0.5,
                    z - (size / 2) + 0.5
                );

                // Store the color in the group's userData for later use
                group.userData.color = randomColor;

                // Add the group to the scene and blocks array
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

// Function to update the score
function updateScore(points) {
    score += points;
    scoreElement.textContent = `Score: ${score}`;
}

// Function to update the action counter
function updateCounter() {
    actionCount++;
    counterElement.textContent = `Actions: ${actionCount}`;
}

// Function to reset the game
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
    for (let i = 0; i < valid_moves.length; i++) {
        if (event.key === valid_moves[i] && hoveredBlock) {
            updateCounter();
        }
    }

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
        block.position.x === x &&
        block.position.y === y &&
        block.position.z === z
    );
}

function rotateVerticalSlice(coordinate, axis) {
    // Get all blocks in the slice that share the same coordinate based on the axis
    console.log(blocks)
    let sliceBlocks;
    if (axis === 'x') {
        sliceBlocks = blocks.filter(block => block.position.x === coordinate);
    } else if (axis === 'y') {
        sliceBlocks = blocks.filter(block => block.position.y === coordinate);
    } else if (axis === 'z') {
        sliceBlocks = blocks.filter(block => block.position.z === coordinate);
    }

    // Create a temporary group and add the slice blocks to it
    const tempGroup = new THREE.Group();
    sliceBlocks.forEach(block => tempGroup.add(block));
    scene.add(tempGroup);

    // Set up animation variables
    const duration = 1000; // Duration in milliseconds (1 second)
    const startTime = performance.now();
    const targetAngle = Math.PI; // Rotate 180 degrees

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
            sliceBlocks.forEach(block => {
                // Apply the group's transformation matrix to each block
                block.applyMatrix4(tempGroup.matrix);

                // Update the block's local rotation and position
                block.rotation.setFromRotationMatrix(tempGroup.matrix);
                block.position.setFromMatrixPosition(block.matrix);

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
    console.log(blocks)
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
