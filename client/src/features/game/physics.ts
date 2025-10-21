export interface Vector2 {
  x: number;
  y: number;
}

export interface BallState {
  position: Vector2;
  velocity: Vector2;
  radius: number;
  launched: boolean;
}

export interface HoopState {
  position: Vector2;
  radius: number;
  innerRadius: number;
}

export interface LaunchSettings {
  powerScale: number;
  maxVelocity: number;
}

export const DEFAULT_LAUNCH: LaunchSettings = {
  powerScale: 6,
  maxVelocity: 2200,
};

export const GRAVITY = 2200; // px per second^2

export function createBall(width: number, height: number, radius = 26): BallState {
  return {
    position: { x: width / 2, y: height - radius - 12 },
    velocity: { x: 0, y: 0 },
    radius,
    launched: false,
  };
}

export function computeLaunchVelocity(drag: Vector2, settings: LaunchSettings = DEFAULT_LAUNCH): Vector2 {
  const vx = -drag.x * settings.powerScale;
  const vy = -drag.y * settings.powerScale;
  const magnitude = Math.sqrt(vx * vx + vy * vy);
  if (magnitude > settings.maxVelocity) {
    const scale = settings.maxVelocity / magnitude;
    return { x: vx * scale, y: vy * scale };
  }
  return { x: vx, y: vy };
}

export function launchBall(ball: BallState, drag: Vector2, settings: LaunchSettings = DEFAULT_LAUNCH) {
  const velocity = computeLaunchVelocity(drag, settings);
  ball.velocity.x = velocity.x;
  ball.velocity.y = velocity.y;
  ball.launched = true;
}

export function updateBall(ball: BallState, dt: number, bounds: { width: number; height: number }) {
  if (!ball.launched) {
    return;
  }

  ball.velocity.y += GRAVITY * dt;
  ball.position.x += ball.velocity.x * dt;
  ball.position.y += ball.velocity.y * dt;

  const floor = bounds.height - ball.radius - 8;
  if (ball.position.y >= floor) {
    ball.position.y = floor;
    ball.velocity.y *= -0.35;
    ball.velocity.x *= 0.6;
    if (Math.abs(ball.velocity.y) < 80) {
      ball.launched = false;
      ball.velocity.x = 0;
      ball.velocity.y = 0;
    }
  }
}

export function resetBall(ball: BallState, width: number, height: number) {
  ball.position.x = width / 2;
  ball.position.y = height - ball.radius - 12;
  ball.velocity.x = 0;
  ball.velocity.y = 0;
  ball.launched = false;
}

export function detectHoopHit(prev: BallState, ball: BallState, hoop: HoopState): 'score' | 'swish' | null {
  if (!ball.launched) {
    return null;
  }

  const prevY = prev.position.y;
  const currentY = ball.position.y;
  if (!(prevY > hoop.position.y && currentY <= hoop.position.y)) {
    return null;
  }

  const crossingX = ball.position.x;
  const dx = Math.abs(crossingX - hoop.position.x);
  if (dx <= hoop.innerRadius) {
    return 'swish';
  }
  if (dx <= hoop.radius) {
    return 'score';
  }

  return null;
}

export function isOutOfBounds(ball: BallState, bounds: { width: number; height: number }): boolean {
  return (
    ball.position.x < -ball.radius * 2 ||
    ball.position.x > bounds.width + ball.radius * 2 ||
    ball.position.y < -bounds.height * 0.2 ||
    ball.position.y > bounds.height + ball.radius * 2
  );
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
