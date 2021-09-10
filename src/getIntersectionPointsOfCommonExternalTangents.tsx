type Position = { x: number; y: number };
type Circle = { radius: number } & Position;

export function getIntersectionPointsOfCommonExternalTangents(
  c1: Circle,
  c2: Circle
): [Position, Position][] {
  const X = c1.x - c2.x;
  const Y = c1.y - c2.y;
  const R1 = c1.radius + c2.radius;
  const R2 = c1.radius - c2.radius;
  const Z2 = X ** 2 + Y ** 2;

  const L1 = Math.sqrt(X ** 2 + Y ** 2 - R1 ** 2);
  const L2 = Math.sqrt(X ** 2 + Y ** 2 - R2 ** 2);

  const Ax1 = -((X * R2 + Y * L2) / Z2) * c1.radius + c1.x;
  const Ay1 = -((Y * R2 - X * L2) / Z2) * c1.radius + c1.y;
  const Ax2 = -((X * R2 + Y * L2) / Z2) * c2.radius + c2.x;
  const Ay2 = -((Y * R2 - X * L2) / Z2) * c2.radius + c2.y;

  const Bx1 = -((X * R2 - Y * L2) / Z2) * c1.radius + c1.x;
  const By1 = -((Y * R2 + X * L2) / Z2) * c1.radius + c1.y;
  const Bx2 = -((X * R2 - Y * L2) / Z2) * c2.radius + c2.x;
  const By2 = -((Y * R2 + X * L2) / Z2) * c2.radius + c2.y;

  return [
    [
      { x: Ax1, y: Ay1 },
      { x: Ax2, y: Ay2 },
    ],
    [
      { x: Bx2, y: By2 },
      { x: Bx1, y: By1 },
    ],
  ];
}
function sigmoid(z: number, k: number = 2) {
  return 1 / (1 + Math.exp(-z / k));
}

const fill = false;
// 二点のcircleを共通外接線でつないでfillすると見た目がいいのではと思ったが、全然イマイチだったので不採用
const getFillExternalTangentsFn = (ctx: CanvasRenderingContext2D) => {
  const drawCircle = (c: Circle) => {
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, c.radius, c.radius, 0, 0, 2 * Math.PI);
    fill ? ctx.fill() : ctx.stroke();
  };
  function drawInner(c1: Circle, c2: Circle) {
    const tuples = getIntersectionPointsOfCommonExternalTangents(c1, c2);
    ctx.beginPath();
    const [start, ...rest] = tuples.flat();
    ctx.moveTo(start.x, start.y);
    rest.forEach((p) => ctx?.lineTo(p.x, p.y));
    ctx.lineTo(start.x, start.y);
    fill ? ctx?.fill() : ctx?.stroke();

    // drawCircle(c1);
    drawCircle(c2);
  }
  return drawInner;
};
