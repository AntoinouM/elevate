import { randomNumberBetween } from '../utils';
import Game from './Game';
import { Position } from './GameObject';
import ParticlesContainer from './ParticlesContainer';
import Player from './Player';

class Particle {
  _game: Game;
  _isActive: boolean;
  _position: Position;
  _size: number;
  _speedX: number;
  _speedY: number;
  _color: string | undefined;
  _width: number;
  _height: number;

  constructor(game: Game) {
    this._game = game;
    this._isActive = true;
    this._position = { x: 0, y: 0 };
    this._size = this._width = this._height = this._speedX = this._speedY = 0;
    this._color = undefined;
  }

  // GETTERS
  get game() {
    return this._game;
  }
  get isActive() {
    return this._isActive;
  }
  get position() {
    return this._position;
  }
  get speedX() {
    return this._speedX;
  }
  get speedY() {
    return this._speedY;
  }
  get size() {
    return this._size;
  }
  get color() {
    return this._color!;
  }
  get width() {
    return this._width;
  }
  get height() {
    return this._height;
  }

  // SETTERS
  set size(int: number) {
    this._size = int;
  }
  set isActive(bool: boolean) {
    this._isActive = bool;
  }
  set speedX(int: number) {
    this._speedX = int;
  }
  set speedY(int: number) {
    this._speedY = int;
  }
  set color(color: string) {
    this._color = color;
  }
  set width(width: number) {
    this._width = width;
  }
  set height(height: number) {
    this._height = height;
  }
}

class Dust extends Particle {
  private initialDirectionX: number;

  constructor(game: Game, x: number, y: number, color: string) {
    super(game);
    this.position.x = x;
    this.position.y = y;
    this.size = randomNumberBetween(10, 15);
    this.width = this.height = this.size * 2;
    this.speedX = Math.random();
    this.speedY = Math.random();
    this.color = color;

    // Capture the player's initial direction (1 or -1) at creation time
    this.initialDirectionX = game.player._dx;
  }

  draw(context: CanvasRenderingContext2D) {
    if (!this.isActive) return;
    context.beginPath();
    context.arc(
      this.position.x - this.game.player.width * 0.15 * this.initialDirectionX,
      this.position.y + this.game.player.height * 0.1,
      this.size,
      0,
      Math.PI * 2,
    );
    context.fillStyle = this.color;
    context.fill();
  }

  update(timeStamp: number) {
    if (!this.isActive) return;
    this.position.x -= (timeStamp * this.initialDirectionX * this.speedX) / 30;
    this.position.y += (timeStamp * this.speedY) / 30;
    this.size *= 0.875;
    if (this.size < 0.1) this.isActive = false;
  }
}

class ContainedParticle extends Particle {
  _container: ParticlesContainer;
  _directionX: number;
  _directionY: number;
  _targetX: number; // Original relative position in container
  _targetY: number; // Original relative position in container
  _baseSpeedX: number; // Store original speed
  _baseSpeedY: number; // Store original speed
  _timeSinceCollision: number; // Track time since player collision

  constructor(
    game: Game,
    x: number,
    y: number,
    container: ParticlesContainer,
    color: string,
  ) {
    super(game);
    this.position.x = container.getBoundingBox().x + x; // Start relative to container position
    this.position.y = container.getBoundingBox().y + y; // Start relative to container position
    this.size = randomNumberBetween(10, 25);
    this.width = this.height = this.size * 2;
    this.speedX = Math.random();
    this.speedY = Math.random();
    this._baseSpeedX = this.speedX; // Store original speed
    this._baseSpeedY = this.speedY; // Store original speed
    this.color = color;
    this._container = container;
    this._targetX = x; // Store original relative position
    this._targetY = y; // Store original relative position
    this._timeSinceCollision = 1000; // Start with high value (not recently collided)

    // Randomization of direction
    this._directionX = Math.random() < 0.5 ? -1 : 1;
    this._directionY = Math.random() < 0.5 ? -1 : 1;
  }

  update(timeStamp: number) {
    let deltaX, deltaY;
    if (this._container.delta.x && this._container.delta.y) {
      deltaX = this._container.delta.x;
      deltaY = this._container.delta.y;
    } else {
      deltaX = 0;
      deltaY = 0;
    }

    // Increment time since last collision
    this._timeSinceCollision += timeStamp;

    // Gradually reduce boosted speed back to base speed (slower decay)
    if (this._timeSinceCollision > 300) {
      const speedDecay = 0.997; // Even more gradual slowdown
      this.speedX = Math.max(this._baseSpeedX, this.speedX * speedDecay);
      this.speedY = Math.max(this._baseSpeedY, this.speedY * speedDecay);
    }

    // change direction of particle and speed if collision with player
    this.manageCollisionWithPlayer(this.game.player);

    // Only clamp boundaries if not recently hit by player (allow escape)
    if (this._timeSinceCollision > 200) {
      this.clampInContainer(this._container);
    }

    // Reform cloud: gradually move particles back toward their target positions
    // Increased delay to 1200ms for more visible dispersion
    if (this._timeSinceCollision > 1200) {
      this.reformToTarget(timeStamp, deltaX, deltaY);
    } else if (this.isInContainer(this._container)) {
      // Move particles based on their speed and direction
      this.moveParticle(
        timeStamp,
        this.speedX,
        this.speedY,
        this._directionX,
        this._directionY,
        60,
        deltaX,
        deltaY,
      );
    } else {
      // bring to center
      this.bringToContainerCenter(this._container, timeStamp, deltaX, deltaY);
    }
  }

  draw(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
    context.fillStyle = this.color;
    context.fill();
  }

  clampInContainer(particlesContainer: ParticlesContainer) {
    const container = particlesContainer.getBoundingBox();
    if (
      this.position.x <= container.x ||
      this.position.x + this.size >= container.x + container.width
    ) {
      this._directionX *= -1;
    }
    if (
      this.position.y <= container.y ||
      this.position.y + this.size >= container.y + container.height
    ) {
      this._directionY *= -1;
    }
  }

  manageCollisionWithPlayer(playerObject: Player) {
    const player = playerObject.getBoundingBox();

    if (
      this.position.x >= player.x &&
      this.position.x <= player.x + player.width &&
      this.position.y >= player.y &&
      this.position.y <= player.y + player.height
    ) {
      // Reset collision timer
      this._timeSinceCollision = 0;

      // Calculate center of player
      const playerCenterX = player.x + player.width / 2;
      const playerCenterY = player.y + player.height / 2;

      // Calculate vector from player center to particle
      const dx = this.position.x - playerCenterX;
      const dy = this.position.y - playerCenterY;

      // Normalize and add repulsion force (push away from player)
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > 0) {
        const repulsionStrength = 6; // Increased from 3 for more dramatic effect
        this.position.x += (dx / distance) * repulsionStrength;
        this.position.y += (dy / distance) * repulsionStrength;

        // Increase speed temporarily for scattering effect
        this.speedX = Math.min(this.speedX * 2.0, 0.15); // Stronger boost for more visible scatter
        this.speedY = Math.min(this.speedY * 2.0, 0.15);
      }
    }
  }

  moveParticle(
    timeStamp: number,
    speedX: number,
    speedY: number,
    directionX: number,
    directionY: number,
    limiter: number,
    deltaX: number,
    deltaY: number,
  ) {
    this.position.x += (speedX * directionX * timeStamp) / limiter + deltaX;
    this.position.y += (speedY * directionY * timeStamp) / limiter + deltaY;
  }

  isInContainer(containerObj: ParticlesContainer): boolean {
    const container = containerObj.getBoundingBox();
    if (
      this.position.x >= container.x &&
      this.position.x <= container.x + this._container.width &&
      this.position.y >= container.y &&
      this.position.y <= container.y + container.height
    ) {
      return true;
    }
    return false;
  }

  bringToContainerCenter(
    container: ParticlesContainer,
    timeStamp: number,
    deltaX: number,
    deltaY: number,
  ) {
    const centerX = container.position.x + container.width / 2;
    const centerY = container.position.y + container.height / 2;

    // Calculate the distance to the center
    const distanceX = centerX - this.position.x;
    const distanceY = centerY - this.position.y;

    // Calculate the Euclidean distance
    const distanceToCenter = Math.sqrt(
      distanceX * distanceX + distanceY * distanceY,
    );

    // Normalize direction to center and scale by distance
    const normalizedX = distanceX / distanceToCenter;
    const normalizedY = distanceY / distanceToCenter;

    // Move particle towards the center with a smoothing factor
    const smoothingFactor = 0.025; // Adjust as needed for smoothness
    this.position.x +=
      normalizedX * this.speedX * timeStamp * smoothingFactor + deltaX;
    this.position.y +=
      normalizedY * this.speedY * timeStamp * smoothingFactor + deltaY;
  }

  reformToTarget(timeStamp: number, deltaX: number, deltaY: number) {
    // Calculate target position relative to container
    const targetX = this._container.getBoundingBox().x + this._targetX;
    const targetY = this._container.getBoundingBox().y + this._targetY;

    // Calculate vector to target position
    const dx = targetX - this.position.x;
    const dy = targetY - this.position.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    // Gradually move toward target position
    if (distance > 1) {
      const reformSpeed = 0.008; // Even slower reformation for more visible effect
      this.position.x += (dx / distance) * reformSpeed * timeStamp;
      this.position.y += (dy / distance) * reformSpeed * timeStamp;
    }

    // Add container delta to move with container
    this.position.x += deltaX;
    this.position.y += deltaY;
  }
}

class ExplosionParticle extends Particle {
  private _directionX: number;
  private _directionY: number;
  private _initialSize: number;
  private _lifespan: number;
  private _age: number = 0;

  constructor(game: Game, x: number, y: number) {
    super(game);
    this.position.x = x;
    this.position.y = y;

    // Smaller particle sizes
    this._initialSize = randomNumberBetween(4, 10);
    this.size = this._initialSize;
    this.width = this.height = this.size * 2;

    // Even smaller explosion direction and speed for tighter area
    const angle = Math.random() * Math.PI * 2;
    const speed = randomNumberBetween(0.5, 1.5);
    this._directionX = Math.cos(angle) * speed;
    this._directionY = Math.sin(angle) * speed;

    // Randomize colors for visual variety
    const colors = [
      'rgba(255, 150, 50, 0.9)', // Orange
      'rgba(255, 100, 100, 0.9)', // Red-orange
      'rgba(255, 200, 50, 0.9)', // Yellow-orange
      'rgba(255, 80, 150, 0.9)', // Pink
      'rgba(200, 100, 255, 0.9)', // Purple
    ];
    this.color = colors[Math.floor(Math.random() * colors.length)];

    // Random lifespan for variety
    this._lifespan = randomNumberBetween(300, 600);
  }

  draw(context: CanvasRenderingContext2D) {
    if (!this.isActive) return;

    // Fade out as particle ages
    const fadePercent = 1 - this._age / this._lifespan;
    const alpha = Math.max(0, fadePercent);

    context.save();
    context.globalAlpha = alpha;
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
    context.fillStyle = this.color;
    context.fill();
    context.restore();
  }

  update(timeStamp: number) {
    if (!this.isActive) return;

    // Update age
    this._age += timeStamp;

    // Move outward from explosion center
    this.position.x += (this._directionX * timeStamp) / 16;
    this.position.y += (this._directionY * timeStamp) / 16;

    // Shrink over time
    this.size *= 0.95;

    // Deactivate when too small or too old
    if (this.size < 0.5 || this._age >= this._lifespan) {
      this.isActive = false;
    }
  }
}

export { Dust, ContainedParticle, Particle, ExplosionParticle };
