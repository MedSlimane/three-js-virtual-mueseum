# Virtual Medical Museum

An interactive 3D virtual museum experience showcasing medical equipment and biological models, built with React and Three.js.

![Virtual Museum Screenshot](https://via.placeholder.com/800x400?text=Virtual+Museum+Screenshot)

## 📋 Overview

This project is a virtual museum that allows users to explore medical models in a 3D environment. The museum features various medical exhibits including:

- Operating Room
- DNA Lab Machine
- Human DNA Structure
- HIV Virus (Sectioned)
- Laparoscopic Trocar
- Medical Monitoring Equipment
- Medical Syringe
- Sci-Fi MRI Scanner
- Sphygmomanometer (Blood Pressure Monitor)

Users can navigate through the museum in first-person or orbit mode, manipulate the position and scale of the exhibited models, and view detailed information about each item.

## 🚀 Technologies

- [React](https://reactjs.org/) (v19)
- [Three.js](https://threejs.org/) (v0.175.0)
- [React Three Fiber](https://github.com/pmndrs/react-three-fiber) (v9)
- [React Three Drei](https://github.com/pmndrs/drei) (v10)
- [TypeScript](https://www.typescriptlang.org/) (v5.8.3)
- [Vite](https://vitejs.dev/) (v6.2.6)

## 🔧 Installation

1. Clone the repository

   ```bash
   git clone https://github.com/MedSlimane/three-js-virtual-mueseum.git
   cd muesuem
   ```

1. Install dependencies

   ```bash
   npm install
   ```

1. Start the development server

   ```bash
   npm run dev
   ```

1. Open your browser and navigate to `http://localhost:5173`

## 🎮 Controls

- **Keyboard Shortcuts**:
  - `1`: Switch to translate mode (move objects)
  - `2`: Switch to scale mode (resize objects)
  - `R`: Reset object position and scale
  - `F`: Toggle between orbit and first-person control modes
  - `M`: Toggle menu visibility

- **Navigation**:
  - **Orbit Mode**: Click and drag to rotate the view, scroll to zoom
  - **First-Person Mode**: Use WASD keys to move, mouse to look around

## 🛠️ Building for Production

To build the project for production, run:

```bash
npm run build
```

The built files will be in the `dist` directory. You can preview the production build with:

```bash
npm run preview
```

## 📦 Project Structure

```text
public/               # Static 3D model files (.glb)
src/
  components/         # React components
    Museum.tsx        # Main museum environment
    MuseumCanvas.tsx  # Canvas setup with controls
    Controls.tsx      # User interface controls
    InfoPanel.tsx     # Information display
    *Mini.tsx         # Individual exhibit components
  assets/             # Additional assets
  App.tsx             # Main application component
  main.tsx            # Entry point
```

## 🧩 Features

- Interactive 3D environment with realistic lighting and shadows
- Multiple control modes (orbit and first-person)
- Position and scale adjustment for all models
- Subtle rotation animation for some models (e.g., HIV Virus, Syringe)
- Persistent model positioning using localStorage
- Coordinate display for precise positioning
- Debug mode with performance stats and axis helpers
- Responsive design

## 📝 License

[ISC License](LICENSE)

## 📸 Credits

3D Models sourced from various free and open-source repositories. Specific attributions for each model are available in the model metadata.
