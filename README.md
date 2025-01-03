## POPPY BLOCKIES

This is our project for UCLA's CS174A Computer Graphics class, taught by Asish Law Fall 2024.

## **Overview**  
Poppy Blockies is a visually immersive 3D puzzle game created for UCLA's CS174A Computer Graphics class. The goal of the game is to strategically destroy a block grid in the fewest moves possible. Players can pop, color, and rotate blocks to solve progressively challenging levels.  

The project focuses on combining strategic gameplay with advanced visual effects, offering an engaging and dynamic experience.  

---

## **Features**  
### **Gameplay**  
- **Pop Blocks**: Destroy a block and its adjacent same-colored blocks with the `space` key.  
- **Color Blocks**: Use keys `1` through `7` to recolor blocks with vibrant colors.  
- **Rotate Slices**: Rotate slices of the grid using `a`, `s`, and `d` for the x, y, and z axes respectively.  

### **Visual Highlights**  
- **GPU-Accelerated Particle Effects**: Simulates realistic block destruction with smooth and engaging visuals.  
- **Shader-Driven Grass Animation**: A lush, living environment with swaying grass, adding depth to the gameplay.  
- **Skybox Environments**: Two distinct themes—Rustic and Space—for varied player experiences.  
- **Bump Mapping**: Enhances textures for realism, particularly in wood and metallic surfaces.  
- **Dynamic Lighting and Shadows**: Adapts to player actions, creating a more immersive world.  

---

## **How to Play**  
1. **Select Level Configuration**:  
   - Choose a theme (Rustic or Space).  
   - Set grid size, number of colors, and move limits.  
2. **Interact with the Game**:  
   - Hover over blocks and use controls to pop, color, or rotate.  
3. **Win or Lose**:  
   - Win by destroying all blocks within the allowed moves.  
   - Lose if you run out of moves.  

---

## **Controls**  
- **Popping Blocks**: `space`  
- **Coloring Blocks**:  
  - `1`: Purple  
  - `2`: Red  
  - `3`: Orange  
  - `4`: Yellow  
  - `5`: Green  
  - `6`: Blue  
  - `7`: Pink  
- **Rotating Slices**:  
  - `a`: Rotate along the x-axis  
  - `s`: Rotate along the y-axis  
  - `d`: Rotate along the z-axis  
- **Toggle Commentator**: `p`  
- **Toggle Controls Menu**: `i`  

---

## **Technical Details**  
- Developed using **Three.js**.  
- Utilized advanced shaders for animations and effects.  
- Optimized rendering with precomputed geometries and materials to maintain performance.  
- Implemented feedback-driven improvements to enhance user experience and gameplay mechanics.  

---

## **Challenges and Solutions**  
### **Performance Optimization**  
Rendering particles and grass animations posed challenges. We optimized performance by precomputing geometries and leveraging GPU acceleration.  

### **Cube Rotation Issues**  
Rotations were initially unstable. Revisiting foundational concepts from lectures helped stabilize transformations for smoother gameplay.  

---

## **Lessons Learned**  
- Importance of performance optimization in real-time rendering.  
- Balancing gameplay mechanics with visually engaging environments.  
- Iterative development through feedback.  

---

## **How to Run**  
1. Clone the repository and navigate to the directory:  
   ```bash
   git clone https://github.com/yourusername/poppy-blockies.git
   cd poppy-blockies
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run in your browser:
  ```bash
  npx vite
  ```

## **Authors**  
- **Ammar Almarzooq**  
  - Email: [ammar@example.com](mailto:ammar.hm2012@gmail.com)  
  - GitHub: [github.com/ammar-almarzooq](https://github.com/Ammar999aa)  

- **Abdullah Almanei**  
  - Email: [abdullah@example.com](mailto:abdullah.m.almanei@gmail.com)  
  - GitHub: [github.com/abdullah-almanei](https://github.com/abdullahalmanei)  

---

## **Acknowledgments**  
This project was developed as part of UCLA's CS174A Computer Graphics class.  

Special thanks to:  
- **Benet Oriol Sabat** (TA) for guidance throughout the project.  
- **Our peers** for their thoughtful feedback and suggestions, which greatly influenced the final design and features.  
