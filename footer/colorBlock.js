import * as THREE from 'three';

let color = 0xFFFFFF

let camera, scene, renderer, block;

const group = new THREE.Group();

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

function createFrustumWithColor(color, rotation = [0, 0, 0], position = [0, 0, 0]) {
    const frustum = createPyramidFrustum();
    frustum.material.color.set(color);
    frustum.rotation.set(rotation[0], rotation[1], rotation[2]);
    frustum.position.set(position[0], position[1], position[2]);
    frustum.castShadow = true;
    frustum.receiveShadow = true;
    return frustum;
}

function initRotatingBlock() {
    // Create a new scene
    scene = new THREE.Scene();

    // Set up a camera
    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(1.5, 1.5, 1.5);
    camera.lookAt(0, 0, 0);

    // Set up a renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(70, 70); // Small canvas for overlay
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.bottom = '10px';
    renderer.domElement.style.right = '10px';
    renderer.domElement.style.zIndex = '1000'; // Overlay on top
    document.body.appendChild(renderer.domElement);

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

    // Create a block (cube) and add it to the scene
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ color: color });

    block = new THREE.Mesh(geometry, material);

    group.add(block);

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
        const frustum = createFrustumWithColor(color, data.rotation, data.position);
        group.add(frustum);
    });

    // scene.add(f)
    scene.add(group);

    animate();
}

function changeGroupColor(color) {
    // Loop through all children of the group
    group.children.forEach(child => {
        if (child.isMesh && child.material) {
            child.material.color.set(color);
        }
    });
}

function onKeyDown(event) {
    if (event.key === '1') {
        changeGroupColor(purple)
    } else if (event.key === '2') {
        changeGroupColor(red)
    } else if (event.key === '3') {
        changeGroupColor(orange)
    } else if (event.key === '4') {
        changeGroupColor(yellow)
    } else if (event.key === '5') {
        changeGroupColor(green)
    } else if (event.key === '6') {
        changeGroupColor(blue)
    } else if (event.key === '7') {
        changeGroupColor(pink)
    }
}

document.addEventListener('keydown', onKeyDown, false);

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate the block
    group.rotation.x += 0.01;
    group.rotation.y += 0.01;

    // Render the rotating block scene
    renderer.render(scene, camera);
}

// Initialize the rotating block scene
initRotatingBlock();