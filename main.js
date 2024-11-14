import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

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

const ambientLight = new THREE.AmbientLight(0x888888);
scene.add(ambientLight);

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
    const colors = [
        red, // Coral Red
        orange, // Sky Blue
        yellow, // Golden Yellow
        green, // Soft Orange
        blue, // Soft Purple
        purple, // Fresh Green
        pink  // Soft Pink
    ];
    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            for (let z = 0; z < size; z++) {
                const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);

                // Assign a random color to each block
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                const cubeMaterial = new THREE.MeshPhongMaterial({ color: randomColor });

                const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
                const edge1 = createPyramidFrustum();
                edge1.position.set(0, +0.5, 0)

                const edge2 = createPyramidFrustum();
                edge2.rotation.x = Math.PI;
                edge2.position.set(0, -0.5, 0)

                const edge3 = createPyramidFrustum();
                edge3.rotation.x = Math.PI / 2;
                edge3.position.set(0, 0, 0.5)

                const edge4 = createPyramidFrustum();
                edge4.rotation.x = -Math.PI / 2;
                edge4.position.set(0, 0, -0.5)

                const edge5 = createPyramidFrustum();
                edge5.rotation.z = -Math.PI / 2;
                edge5.position.set(+0.5, 0, 0)

                const edge6 = createPyramidFrustum();
                edge6.rotation.z = Math.PI / 2;
                edge6.position.set(-0.5, 0, 0)

                // Enable shadows for the cubes
                cube.castShadow = true;
                cube.receiveShadow = true;

                edge1.castShadow = true;
                edge1.receiveShadow = true;
                edge2.castShadow = true;
                edge2.receiveShadow = true;
                edge3.castShadow = true;
                edge3.receiveShadow = true;
                edge4.castShadow = true;
                edge4.receiveShadow = true;
                edge5.castShadow = true;
                edge5.receiveShadow = true;
                edge6.castShadow = true;
                edge6.receiveShadow = true;


                const group = new THREE.Group();
                group.add(cube);
                group.add(edge1);
                group.add(edge2);
                group.add(edge3);
                group.add(edge4);
                group.add(edge5);
                group.add(edge6);

                // Position the cube in a tightly packed 3D grid
                group.position.set(
                    x - (size / 2) + 0.5,
                    y - (size / 2) + 0.5,
                    z - (size / 2) + 0.5
                );

                let c = randomColor
                group.userData.color = c;
                edge1.material.color.set(c);
                edge2.material.color.set(c);
                edge3.material.color.set(c);
                edge4.material.color.set(c);
                edge5.material.color.set(c);
                edge6.material.color.set(c);
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
    // Change color to red when pressing '1'

    if (event.key === '1' && hoveredBlock) {
        changeGroupColor(hoveredBlock, purple);
        hoveredBlock.userData.color = purple;
        updateCounter();
    } else if (event.key === '2' && hoveredBlock) {
        changeGroupColor(hoveredBlock, red);
        hoveredBlock.userData.color = red;
        updateCounter();
    } else if (event.key === '3' && hoveredBlock) {
        changeGroupColor(hoveredBlock, orange);
        hoveredBlock.userData.color = orange;
        updateCounter();
    } else if (event.key === '4' && hoveredBlock) {
        changeGroupColor(hoveredBlock, yellow);
        hoveredBlock.userData.color = yellow;
        updateCounter();
    } else if (event.key === '5' && hoveredBlock) {
        changeGroupColor(hoveredBlock, green);
        hoveredBlock.userData.color = green;
        updateCounter();
    } else if (event.key === '6' && hoveredBlock) {
        changeGroupColor(hoveredBlock, blue);
        hoveredBlock.userData.color = blue;
        updateCounter();
    } else if (event.key === '7' && hoveredBlock) {
        changeGroupColor(hoveredBlock, pink);
        hoveredBlock.userData.color = pink;
        updateCounter();
    }

    // Remove the hovered block and its neighbors when pressing space bar
    if (event.key === ' ' && hoveredBlock) {
        const color = hoveredBlock.userData.color;
        removeBlockAndNeighbors(hoveredBlock, color);
        updateCounter();
    }

    // Rotate the slice when pressing 'a'
    if (event.key === 'a' && hoveredBlock) {
        // rotateSlice(hoveredBlock.position.x);
        rotateVerticalSlice(hoveredBlock.position.x, 'x');
        updateCounter(); // Increment counter for rotation
    }
    if (event.key === 's' && hoveredBlock) {
        // rotateSlice(hoveredBlock.position.x);
        rotateVerticalSlice(hoveredBlock.position.y, 'y');
        updateCounter(); // Increment counter for rotation
    }
    if (event.key === 'd' && hoveredBlock) {
        // rotateSlice(hoveredBlock.position.x);
        rotateVerticalSlice(hoveredBlock.position.z, 'z');
        updateCounter(); // Increment counter for rotation
    }
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
            console.log(hoveredBlock);
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
    // Get all blocks in the slice that share the same x-coordinate
    if (axis == 'x') {
        sliceBlocks = blocks.filter(block => block.position.x === coordinate);
    } else if (axis == 'y') {
        sliceBlocks = blocks.filter(block => block.position.y === coordinate);
    } else if (axis == 'z') {
        sliceBlocks = blocks.filter(block => block.position.z === coordinate);
    }

    // Perform a 90-degree rotation for each block in the slice
    sliceBlocks.forEach(block => {
        const { x, y, z } = block.position;

        // Apply a 90-degree rotation around the Y-axis (clockwise)
        block.position.set(
            axis == 'x' ? x : -x,
            axis == 'y' ? y : -y,
            axis == 'z' ? z : -z
        );
    });
}

animate();

function animate() {
    requestAnimationFrame(animate);

    // Check for hovered block
    updateHoveredBlock();

    // Animate the slice rotation if needed
    // animateRotation();

    // Render the scene
    renderer.render(scene, camera);
}
