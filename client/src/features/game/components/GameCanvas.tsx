import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import clsx from 'clsx';
import styles from './GameCanvas.module.css';
import {
  BallState,
  HoopState,
  createBall,
  detectHoopHit,
  isOutOfBounds,
  launchBall,
  resetBall,
  updateBall,
  computeLaunchVelocity,
  GRAVITY,
} from '../physics';
import { Particle, spawnSparkBurst, updateParticles } from '../effects/particles';
import { useGameStore } from '../store/useGameStore';
import { useGameLoop } from '../utils/useGameLoop';
import { triggerHaptic } from '../../../services/telegram';
import { playLaunchSound, playRimSound, playSwishSound } from '../sounds';
import type { ShotResult } from '../store/useGameStore';

interface GameCanvasProps {
  onShot: (result: ShotResult) => void;
  className?: string;
}

interface PointerState {
  dragging: boolean;
  start: { x: number; y: number };
  current: { x: number; y: number };
}

export function GameCanvas({ onShot, className }: GameCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ballRef = useRef<BallState>();
  const prevBallRef = useRef<BallState>();
  const hoopRef = useRef<HoopState>();
  const pointerRef = useRef<PointerState>({
    dragging: false,
    start: { x: 0, y: 0 },
    current: { x: 0, y: 0 },
  });
  const attemptRef = useRef({ active: false, scored: false, resetting: false });
  const particlesRef = useRef<Particle[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const tick = useGameStore((state) => state.tick);
  const isRunning = useGameStore((state) => state.isRunning);
  const mode = useGameStore((state) => state.mode);
  const isSoundEnabled = useGameStore((state) => state.isSoundEnabled);

  const hoop = useMemo(() => {
    return hoopRef.current ?? {
      position: { x: dimensions.width / 2, y: dimensions.height * 0.26 },
      radius: Math.max(dimensions.width * 0.18, 70),
      innerRadius: Math.max(dimensions.width * 0.1, 46),
    };
  }, [dimensions.height, dimensions.width]);

  const ensureBall = useCallback(() => {
    if (!ballRef.current) {
      const radius = Math.max(22, Math.min(dimensions.width, dimensions.height) * 0.08);
      ballRef.current = createBall(dimensions.width, dimensions.height, radius);
    }
    return ballRef.current;
  }, [dimensions.height, dimensions.width]);

  useEffect(() => {
    if (!wrapperRef.current) {
      return;
    }
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0 || dimensions.height === 0) {
      return;
    }

    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(dimensions.width * ratio);
    canvas.height = Math.floor(dimensions.height * ratio);
    const ctx = canvas.getContext('2d');
    ctx?.setTransform(ratio, 0, 0, ratio, 0, 0);

    const radius = Math.max(22, Math.min(dimensions.width, dimensions.height) * 0.08);
    ballRef.current = createBall(dimensions.width, dimensions.height, radius);
    prevBallRef.current = createBall(dimensions.width, dimensions.height, radius);
    hoopRef.current = {
      position: { x: dimensions.width / 2, y: dimensions.height * 0.26 },
      radius: Math.max(dimensions.width * 0.18, 70),
      innerRadius: Math.max(dimensions.width * 0.1, 46),
    };
  }, [dimensions.height, dimensions.width]);

  useEffect(() => {
    if (!isRunning) {
      attemptRef.current.active = false;
      attemptRef.current.scored = false;
      attemptRef.current.resetting = false;
      const ball = ensureBall();
      resetBall(ball, dimensions.width, dimensions.height);
    }
  }, [dimensions.height, dimensions.width, ensureBall, isRunning]);

  const scheduleReset = useCallback(() => {
    if (attemptRef.current.resetting) {
      return;
    }
    attemptRef.current.resetting = true;
    setTimeout(() => {
      const ball = ensureBall();
      resetBall(ball, dimensions.width, dimensions.height);
      attemptRef.current = { active: false, scored: false, resetting: false };
    }, 420);
  }, [dimensions.height, dimensions.width, ensureBall]);

  const drawBackground = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      const gradient = ctx.createLinearGradient(0, dimensions.height * 0.4, 0, dimensions.height);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.35)');
      gradient.addColorStop(1, 'rgba(0, 230, 118, 0.08)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 6; i += 1) {
        const y = dimensions.height * 0.55 + i * 32;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.quadraticCurveTo(dimensions.width / 2, y + 12, dimensions.width, y);
        ctx.stroke();
      }
    },
    [dimensions.height, dimensions.width],
  );

  const drawHoop = useCallback(
    (ctx: CanvasRenderingContext2D, currentHoop: HoopState) => {
      ctx.save();
      ctx.lineWidth = 10;
      ctx.strokeStyle = 'rgba(0, 230, 118, 0.9)';
      ctx.shadowColor = 'rgba(0, 230, 118, 0.6)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(currentHoop.position.x, currentHoop.position.y, currentHoop.radius, Math.PI, 0, false);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(currentHoop.position.x, currentHoop.position.y + 5, currentHoop.radius * 0.7, Math.PI, 0, false);
      ctx.stroke();
      ctx.restore();
    },
    [],
  );

  const drawBall = useCallback((ctx: CanvasRenderingContext2D, ball: BallState) => {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = '#00E676';
    ctx.shadowColor = 'rgba(0, 230, 118, 0.35)';
    ctx.shadowBlur = 20;
    ctx.arc(ball.position.x, ball.position.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ball.position.x, ball.position.y, ball.radius * 0.55, Math.PI * 0.1, Math.PI * 0.9);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(ball.position.x, ball.position.y, ball.radius * 0.55, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
    ctx.restore();
  }, []);

  const drawParticles = useCallback((ctx: CanvasRenderingContext2D, particles: Particle[]) => {
    particles.forEach((particle) => {
      const alpha = 1 - particle.life / particle.maxLife;
      ctx.fillStyle = `rgba(0, 230, 118, ${alpha.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(particle.position.x, particle.position.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }, []);

  const drawTrajectory = useCallback(
    (ctx: CanvasRenderingContext2D, ball: BallState) => {
      const pointer = pointerRef.current;
      if (!pointer.dragging) {
        return;
      }

      const currentHoop = hoopRef.current;
      if (!currentHoop) {
        return;
      }

      const drag = {
        x: pointer.current.x - pointer.start.x,
        y: pointer.current.y - pointer.start.y,
      };

      const velocity = computeLaunchVelocity(drag);
      const dt = 0.05;
      let tempX = ball.position.x;
      let tempY = ball.position.y;
      let tempVx = velocity.x;
      let tempVy = velocity.y;
      const points: { x: number; y: number }[] = [];
      for (let i = 0; i < 24; i += 1) {
        tempVy += GRAVITY * dt;
        tempX += tempVx * dt;
        tempY += tempVy * dt;
        points.push({ x: tempX, y: tempY });
        if (tempY < currentHoop.position.y - 60 && tempVy > 0) {
          break;
        }
      }

      ctx.save();
      ctx.strokeStyle = 'rgba(0, 230, 118, 0.4)';
      ctx.setLineDash([6, 10]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ball.position.x, ball.position.y);
      points.forEach((point) => ctx.lineTo(point.x, point.y));
      ctx.stroke();
      ctx.restore();
    },
    [],
  );

  const handleShot = useCallback(
    (result: ShotResult) => {
      if (!useGameStore.getState().isRunning) {
        return;
      }
      if (result === 'swish') {
        if (isSoundEnabled) {
          playSwishSound();
        }
        triggerHaptic('light');
        particlesRef.current = particlesRef.current.concat(
          spawnSparkBurst({
            x: hoopRef.current!.position.x,
            y: hoopRef.current!.position.y,
          }),
        );
      } else if (result === 'score') {
        if (isSoundEnabled) {
          playRimSound();
        }
        triggerHaptic('medium');
        particlesRef.current = particlesRef.current.concat(
          spawnSparkBurst({
            x: hoopRef.current!.position.x,
            y: hoopRef.current!.position.y + 10,
          }, 8),
        );
      } else if (result === 'miss') {
        if (isSoundEnabled) {
          playRimSound();
        }
      }
      onShot(result);
    },
    [isSoundEnabled, onShot],
  );

  const updateFrame = useCallback(
    (dt: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) {
        return;
      }

      const ball = ensureBall();
      const prevBall = prevBallRef.current;

      if (isRunning && mode === 'timed') {
        tick(dt);
      }

      if (prevBall) {
        prevBall.position.x = ball.position.x;
        prevBall.position.y = ball.position.y;
        prevBall.velocity.x = ball.velocity.x;
        prevBall.velocity.y = ball.velocity.y;
        prevBall.radius = ball.radius;
        prevBall.launched = ball.launched;
      }

      updateBall(ball, dt, { width: dimensions.width, height: dimensions.height });

      if (ball.launched) {
        const hit = prevBall && hoopRef.current ? detectHoopHit(prevBall, ball, hoopRef.current) : null;
        if (hit && !attemptRef.current.scored) {
          attemptRef.current.scored = true;
          handleShot(hit);
          scheduleReset();
        }

        if (isOutOfBounds(ball, { width: dimensions.width, height: dimensions.height })) {
          ball.launched = false;
        }
      }

      if (!ball.launched && attemptRef.current.active && !attemptRef.current.scored) {
        handleShot('miss');
        attemptRef.current.scored = true;
        scheduleReset();
      }

      particlesRef.current = updateParticles(particlesRef.current, dt);

      drawBackground(ctx);
      if (hoopRef.current) {
        drawHoop(ctx, hoopRef.current);
      }
      drawParticles(ctx, particlesRef.current);
      drawTrajectory(ctx, ball);
      drawBall(ctx, ball);
    },
    [dimensions.height, dimensions.width, drawBackground, drawBall, drawHoop, drawParticles, drawTrajectory, ensureBall, handleShot, isRunning, mode, scheduleReset, tick],
  );

  useGameLoop(updateFrame, true);

  const getPointerPosition = (event: PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return { x: 0, y: 0 };
    }
    const rect = canvas.getBoundingClientRect();
    const scaleX = dimensions.width / rect.width;
    const scaleY = dimensions.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!isRunning) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    const ball = ensureBall();
    if (ball.launched || attemptRef.current.resetting) {
      return;
    }
    const pos = getPointerPosition(event.nativeEvent);
    const dx = pos.x - ball.position.x;
    const dy = pos.y - ball.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > ball.radius * 1.4) {
      return;
    }
    pointerRef.current = {
      dragging: true,
      start: pos,
      current: pos,
    };
    attemptRef.current.active = true;
    attemptRef.current.scored = false;
    attemptRef.current.resetting = false;
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!pointerRef.current.dragging) {
      return;
    }
    const pos = getPointerPosition(event.nativeEvent);
    pointerRef.current.current = pos;
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!pointerRef.current.dragging) {
      return;
    }
    pointerRef.current.dragging = false;
    event.currentTarget.releasePointerCapture(event.pointerId);

    if (!isRunning) {
      return;
    }

    const ball = ensureBall();
    if (!ball || ball.launched) {
      return;
    }

    const pointer = pointerRef.current;
    const drag = {
      x: pointer.current.x - pointer.start.x,
      y: pointer.current.y - pointer.start.y,
    };

    if (drag.y > -10) {
      attemptRef.current.active = false;
      attemptRef.current.scored = false;
      return;
    }

    launchBall(ball, drag);
    attemptRef.current.active = true;
    attemptRef.current.scored = false;
    attemptRef.current.resetting = false;

    if (isSoundEnabled) {
      playLaunchSound();
    }
  };

  const onPointerCancel = () => {
    pointerRef.current.dragging = false;
  };

  return (
    <div ref={wrapperRef} className={clsx(styles.wrapper, className)}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerCancel}
        onPointerCancel={onPointerCancel}
      />
      <div className={styles.waveBand} aria-hidden="true" />
    </div>
  );
}
