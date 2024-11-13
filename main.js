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

                // Enable shadows for the cubes
                cube.castShadow = true;
                cube.receiveShadow = true;

                // Position the cube in a tightly packed 3D grid
                cube.position.set(
                    x - (size / 2) + 0.5,
                    y - (size / 2) + 0.5,
                    z - (size / 2) + 0.5
                );

                cube.userData.color = randomColor;
                scene.add(cube);
                blocks.push(cube);
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
let rotationGroup = null;
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

function onKeyDown(event) {
    // Change color to red when pressing '1'

    if (event.key === '1' && hoveredBlock) {
        hoveredBlock.material.color.set(purple);
        hoveredBlock.userData.color = purple;
        updateCounter();
    } else if (event.key === '2' && hoveredBlock) {
        hoveredBlock.material.color.set(red);
        hoveredBlock.userData.color = red;
        updateCounter();
    } else if (event.key === '3' && hoveredBlock) {
        hoveredBlock.material.color.set(orange);
        hoveredBlock.userData.color = orange;
        updateCounter();
    } else if (event.key === '4' && hoveredBlock) {
        hoveredBlock.material.color.set(yellow);
        hoveredBlock.userData.color = yellow;
        updateCounter();
    } else if (event.key === '5' && hoveredBlock) {
        hoveredBlock.material.color.set(green);
        hoveredBlock.userData.color = green;
        updateCounter();
    } else if (event.key === '6' && hoveredBlock) {
        hoveredBlock.material.color.set(blue);
        hoveredBlock.userData.color = blue;
        updateCounter();
    } else if (event.key === '7' && hoveredBlock) {
        hoveredBlock.material.color.set(pink);
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
    const intersects = raycaster.intersectObjects(blocks);

    if (intersects.length > 0) {
        hoveredBlock = intersects[0].object;
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
    let sliceBlocks = null;
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

// // Function to rotate a vertical slice
// function rotateSlice(xCoordinate) {
//     if (rotating) return; // Prevent overlapping rotations

//     rotating = true;

//     // Create a new group for rotation
//     rotationGroup = new THREE.Group();
//     scene.add(rotationGroup);

//     // Add all blocks with the same X-coordinate to the group
//     blocks.forEach(block => {
//         if (block.position.x === xCoordinate) {
//             rotationGroup.add(block);
//         }
//     });

//     // Animate the rotation
//     rotationAngle = 0;
//     targetAngle = Math.PI / 2; // 90 degrees
// }

// // Animate the rotation smoothly
// function animateRotation() {
//     if (rotating) {
//         const rotationSpeed = 0.05;
//         rotationAngle += rotationSpeed;

//         // Rotate the group around the X-axis
//         rotationGroup.rotation.x = rotationAngle;

//         if (rotationAngle >= targetAngle) {
//             // Finish rotation and clean up
//             rotationGroup.rotation.x = targetAngle;
//             rotating = false;
//             // scene.remove(rotationGroup);
//             // rotationGroup.children.forEach(block => scene.add(block));
//             rotationGroup = null;
//         }
//     }
// }

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
