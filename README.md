# 🖋️ PixelPen
> A precision Bézier curve tool for pixel art enthusiasts.

PixelPen is a minimalist creative environment designed to solve one of the hardest tasks in pixel art: drawing smooth, consistent curves. Instead of placing pixels one by one, you manipulate a vector curve that dynamically snaps to a 32x32 grid.

## ✨ Features
* **Vector-to-Pixel Conversion**: Real-time preview of how your Bézier curve translates to a pixelated grid.
* **Intelligent "Thinning" Algorithm**: Custom logic to prevent "double pixels" (jaggies) on diagonals, ensuring a clean 1px-wide aesthetic.
* **Dynamic Thickness**: Adjust your stroke width on the fly using the mouse wheel.
* **Atelier UI**: A warm, wood-and-paper themed interface designed for focus and creativity.
* **Instant Baking**: Commit your vector path to the canvas with a single click to layer your designs.

## 🛠️ Controls
| Action | Input |
| :--- | :--- |
| **Move Points** | Click and Drag handles |
| **Adjust Thickness** | Mouse Wheel Up/Down |
| **Change Color** | Color Swatch in the Sidebar |
| **Commit Curve** | Click the "Draw" button |
| **Reset Canvas** | Click the "Clear" button |

## 🚀 Getting Started
Since this is a pure front-end project, no installation is required.

1. Clone the repository.
2. Open index.html in any modern web browser.
3. Start shaping your pixels!

## 🧬 Technical Overview
The tool uses a Cubic Bézier formula to calculate the path:
B(t) = (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃

The script samples this curve at high frequency and maps the coordinates to a discrete grid. It then calculates the distance of each sample point to the center of the nearest pixel cell to determine the most "accurate" pixel to light up.

---
Created with care for the pixel art community.
