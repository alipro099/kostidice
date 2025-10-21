import { Vector2 } from '../physics';

export interface Particle {
  position: Vector2;
  velocity: Vector2;
  life: number;
  maxLife: number;
  size: number;
}

export function spawnSparkBurst(origin: Vector2, count = 12): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const speed = 240 + Math.random() * 160;
    particles.push({
      position: { x: origin.x, y: origin.y },
      velocity: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
      life: 0,
      maxLife: 0.4 + Math.random() * 0.2,
      size: 4 + Math.random() * 3,
    });
  }
  return particles;
}

export function updateParticles(particles: Particle[], dt: number): Particle[] {
  return particles
    .map((particle) => {
      const next: Particle = {
        ...particle,
        position: {
          x: particle.position.x + particle.velocity.x * dt,
          y: particle.position.y + particle.velocity.y * dt,
        },
        life: particle.life + dt,
        velocity: {
          x: particle.velocity.x * 0.96,
          y: particle.velocity.y * 0.96 + 200 * dt,
        },
      };
      return next;
    })
    .filter((particle) => particle.life < particle.maxLife);
}
