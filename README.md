# Rush Hour Problem Solver

## Overview
This program solves the Rush Hour puzzle — a grid-based logic game where the objective is to move the primary vehicle (usually red) out of a traffic jam by sliding other vehicles out of the way. The program implements multiple pathfinding algorithms (Uniform Cost Search, Greedy Best First Search, A*, and Beam Search) to find the shortest sequence of moves to solve the puzzle.

![image](https://github.com/user-attachments/assets/471da0eb-4be6-4374-b070-db1a9e12397e)

The program includes both backend logic for solving the puzzle and a React-based frontend GUI that allows users to input puzzle configurations, select algorithms and heuristics, and visualize the solution step-by-step.

## Features
- Multiple search algorithms implementation (UCS, GBFS, A*, Beam Search)
- Several heuristic functions for informed search
- Interactive visualization of solutions
- Step-by-step playback with adjustable speed
- Support for custom puzzle configurations

## Requirements & Installation

- Node.js (version 16 or higher recommended)
- npm (Node package manager)

The project is split into two main parts:

- **Backend** (solver logic, written in JavaScript/Node.js)
- **Frontend** (React application for UI with animation capabilities)

### Installation Steps

1. Clone the repository or download the source code.

2. Navigate into the **backend** folder and install dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Navigate into the **frontend** folder and install dependencies:
   ```bash
   cd frontend/my-react-app
   npm install
   ```

### Compilation & Running

#### Backend
The backend is a Node.js application and does not require compilation. To start the backend server:

```bash
cd backend
npm run dev
```

This will run the backend in development mode, ready to receive puzzle configurations and solve them using the selected algorithm and heuristic.

#### Frontend
The frontend is a React application. To start the frontend development server:

```bash
cd frontend
npm run dev
```
This will launch the React app, which opens in your browser where you can interact with the UI to:

- Input puzzle board configurations
- Select pathfinding algorithm and heuristic
- Start the solver and visualize moves as an animation

## Usage

1. **Start the application**
   - Open the frontend app in your browser (usually at http://localhost:3000 or as specified by the React dev server)

2. **Configure puzzle**
   - Enter the puzzle board configuration in the specified format:
     - Number of rows and columns
     - Number of non-primary pieces
     - Grid layout with vehicle positions

3. **Select algorithm**
   - Choose one of the available search algorithms:
     - UCS (Uniform Cost Search)
     - GBFS (Greedy Best First Search)
     - A* (A-Star Search)
     - Beam Search

4. **Choose heuristic** (if applicable)
   - Select a heuristic function (disabled for UCS)
   - Different heuristics provide different performance characteristics

5. **Find solution**
   - Click the "Cari solusi" (Find solution) button to start solving
   - The solver will find the optimal path to solve the puzzle

6. **View and control animation**
   - Use the playback controls to:
     - Play/pause the solution animation
     - Adjust animation speed
     - Step through moves one by one
     - Restart the animation

## Input Format

The puzzle configuration should be provided in the following format:
- Input A, B
- Input N

```
..P...    # Grid representation
..P...    # P = Primary car (target)
AAB...    # A, B, C, etc. = Other vehicles
......
......    
  K       # K = Exit position outside of the grid   
```

## Authors

| Name               | Student ID | Institution                |
|--------------------|------------|----------------------------|
| Haegen Quinston    | 13523109   | Institut Teknologi Bandung |
| Steven Owen Liauw  | 13523103   | Institut Teknologi Bandung |

## License

This project is part of the Algorithm Strategies course assignment (Tucil 3 IF2211).
