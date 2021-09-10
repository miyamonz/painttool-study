import React, { useEffect, useState, useRef, useCallback } from "react";

type Position = { x: number; y: number };

// position util
const add = (a: Position) => (b: Position) => ({ x: a.x + b.x, y: a.y + b.y });
const sub = (a: Position) => (b: Position) => ({ x: a.x - b.x, y: a.y - b.y });
const rot = (t: number) => (b: Position) => ({
  x: b.x * Math.cos(t) - b.y * Math.sin(t),
  y: b.x * Math.sin(t) + b.y * Math.cos(t),
});
const len = (a: Position) => Math.sqrt(a.x ** 2 + a.y ** 2);
const mul = (t: number) => (a: Position) => ({ x: a.x * t, y: a.y * t });

function usePrev<T>(t: T | null) {
  const ref = useRef(t);

  const getPrev = useCallback((t) => {
    const prev = ref.current ?? t;
    ref.current = t;
    return prev;
  }, []);
  return getPrev;
}

function useAverage<T, R>(n: number, reduce: (t: T[]) => R) {
  const averageRef = useRef<T[]>([]);
  const getAverage = (p: T) => {
    averageRef.current.push(p);
    if (averageRef.current.length > n) {
      averageRef.current.shift();
    }
    return reduce(averageRef.current);
  };
  return getAverage;
}

type DrawFn = (pos: Position, event: "down" | "move" | "up") => void;
function useDraw(draw: DrawFn) {
  const [isMouseDown, setIsMouseDown] = useState(false);

  const onPointerDown: React.PointerEventHandler<HTMLCanvasElement> = (e) => {
    const pos = { x: e.clientX, y: e.clientY };
    setIsMouseDown(true);
    draw(pos, "down");
  };
  const onPointerMove: React.PointerEventHandler<HTMLCanvasElement> = (e) => {
    const pos = { x: e.clientX, y: e.clientY };
    if (isMouseDown) draw(pos, "move");
  };
  const onPointerUp: React.PointerEventHandler<HTMLCanvasElement> = (e) => {
    const pos = { x: e.clientX, y: e.clientY };
    if (isMouseDown) draw(pos, "up");
    setIsMouseDown(false);
  };
  return { onPointerDown, onPointerMove, onPointerUp };
}

function App() {
  const [fill, setFill] = useState(true);
  const [width, setWidth] = useState(10);

  const [size, setSize] = useState([window.innerWidth, window.innerHeight]);
  useEffect(() => {
    const callback = () => {
      setSize([window.innerWidth, window.innerHeight]);
    };
    window.addEventListener("resize", callback);
    return () => window.removeEventListener("resize", callback);
  }, []);

  const ref = useRef<HTMLCanvasElement>(null);

  const getPrevPos = usePrev<Position>(null);
  const getPrevTime = usePrev(new Date().getTime());
  const getAverage = useAverage(
    10,
    (nums: number[]) => nums.reduce((a, b) => a + b, 0) / nums.length
  );

  const getPrevPoints = usePrev<[Position, Position]>(null);

  const draw: DrawFn = (pos, event) => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      const now = new Date().getTime();
      const delta = now - getPrevTime(now);

      const prev = getPrevPos(event !== "up" ? pos : null);
      const diff = sub(pos)(prev);
      const l = len(diff);
      const v = l / delta;

      const pressure = Math.min(1, 0.1 / v);
      const average = getAverage(pressure);
      const w = width + average * 10;
      const offset = mul(w / l)(diff);
      const points = [90, -90].map((t) => {
        return add(pos)(rot(t)(offset));
      });
      const prevPoints = getPrevPoints(event !== "up" ? points : null);

      const ps = [...prevPoints, ...points.slice().reverse()];
      const [start, ...rest] = ps;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      rest.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.closePath();
      fill ? ctx.fill() : ctx.stroke();
    }
  };

  const events = useDraw(draw);

  const ctx = ref.current?.getContext("2d");

  return (
    <div className="App">
      <button onClick={() => setFill((prev) => !prev)}>
        {fill ? "fill" : "stroke"}
      </button>
      <input
        type="range"
        value={width}
        max={30}
        step={0.1}
        onChange={(e) => setWidth(Number(e.target.value))}
      />
      {width}
      <button
        onClick={() =>
          ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        }
      >
        clear
      </button>
      <canvas ref={ref} width={size[0]} height={size[1]} {...events} />
    </div>
  );
}

export default App;
