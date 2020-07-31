import React, { useState, useCallback, useRef, useEffect } from "react";
import produce, { current } from "immer";
import "./App.css";

function App() {
  const [speed, setSpeed] = useState(1000);
  const [size, setSize] = useState(13);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const speedRef = useRef(speed);

  speedRef.current = speed;

  let [count, setCount] = useState(0);
  const emptyGrid = () => {
    const rows = [];
    for (let i = 0; i < numRows; i++) {
      rows.push(Array.from(Array(numCols), () => 0));
    }
    return rows;
  };
  const numRows = 40; // change dimension
  const numCols = 60;
  const operations = [
    [0, 1],
    [0, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
    [-1, -1],
    [1, 0],
    [-1, 0],
  ];

  const [grid, setGrid] = useState(() => {
    return emptyGrid();
  });

  const [running, setRunning] = useState(false);

  const runRef = useRef(running);
  runRef.current = running;

  const runSim = useCallback(() => {
    if (!runRef.current) {
      return;
    }
    setGrid((g) => {
      return produce(g, (gridCopy) => {
        for (let i = 0; i < numRows; i++) {
          for (let k = 0; k < numCols; k++) {
            let neighbors = 0;
            operations.forEach(([x, y]) => {
              const newI = i + x;
              const newk = k + y;
              if (newI >= 0 && newI < numRows && newk >= 0 && newk < numCols) {
                neighbors += g[newI][newk];
              }
            });
            if (neighbors < 2 || neighbors > 3) {
              gridCopy[i][k] = 0;
            } else if (g[i][k] === 0 && neighbors === 3) {
              gridCopy[i][k] = 1;
            }
          }
        }
      });
    });
    setCount((count) => count + 1);
    setTimeout(runSim, speedRef.current); // function to change time
  }, []);

  return (
    <>
      <div className="rules">
        <h3>Rules:</h3>
        <p>
          Any live cell with fewer than two live neighbours dies, as if by
          underpopulation.
        </p>
        <p>
          Any live cell with two or three live neighbours lives on to the next
          generation.
        </p>
        <p>
          Any live cell with more than three live neighbours dies, as if by
          overpopulation.
        </p>

        <p>
          Any dead cell with exactly three live neighbours becomes a live cell,
          as if by reproduction.
        </p>
      </div>
      <div className="ctrls">
        <button
          onClick={() => {
            setRunning(!running);
            if (!running) {
              runRef.current = true;
              runSim();
            }
          }}
        >
          {running ? "stop" : "start"}
        </button>
        <button
          onClick={() => {
            setGrid(emptyGrid());
            setCount((count *= 0));
            setRunning(false);
          }}
        >
          clear
        </button>

        <button
          onClick={() => {
            const rows = [];
            for (let i = 0; i < numRows; i++) {
              rows.push(
                Array.from(Array(numCols), () => (Math.random() > 0.5 ? 1 : 0))
              );
            }
            setGrid(rows);
          }}
        >
          random
        </button>

        <button
          onClick={() => {
            setSpeed(speed + 100);
          }}
        >
          slower
        </button>
        <button
          onClick={() => {
            setSpeed(speed - 100);
          }}
        >
          faster
        </button>
        <button
          onClick={() => {
            setSize(13);
          }}
        >
          smaller
        </button>
        <button
          onClick={() => {
            setSize(15);
          }}
        >
          bigger
        </button>

        <span>
          {speedRef.current <= 0
            ? "Maximum Speed"
            : `${speedRef.current}ms/generation`}
        </span>

        <span>{`generation ${count}`}</span>
      </div>
      <div
        className="grid"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${numCols}, ${size}px)`,
        }}
      >
        {grid.map((rows, i) =>
          rows.map((col, k) => (
            <div
              key={`${i}-${k}`}
              onClick={() => {
                const newGrid = produce(grid, (gridCopy) => {
                  gridCopy[i][k] = gridCopy[i][k] ? 0 : 1;
                });
                setGrid(newGrid);
              }}
              style={{
                width: size,
                height: size,
                backgroundColor: grid[i][k] ? "black" : undefined,
                border: "solid 0.2px black",
              }}
            />
          ))
        )}
      </div>
    </>
  );
}

export default App;
