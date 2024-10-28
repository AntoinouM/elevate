import { randomNumberBetween } from '../utils';
import Game from './Game';
import { GameObject, Position } from './GameObject';
import { ContainedParticle } from './Particule';

interface UndefinedPosition {
  x: number | undefined;
  y: number | undefined;
}

class ParticlesContainer extends GameObject {
  _speedY: number;
  _speedX: number;
  _directionX: number;
  _directionY: number;
  _particles: ContainedParticle[];
  _originalWidth: number;
  #isExpended: boolean;
  #numberOfParticles: number;
  _lastPosition: UndefinedPosition;
  _delta: Position;

  constructor(
    width: number,
    height: number,
    x: number,
    y: number,
    numberParticles: number,
    game: Game
  ) {
    super(width, height, game);
    this.position.x = x;
    this.position.y = y;
    this._speedX = Math.random() * 0.05;
    this._speedY = Math.random() * 0.05;
    this._directionX = Math.random() < 0.5 ? -1 : 1;
    this._directionY = Math.random() < 0.5 ? -1 : 1;
    this.#isExpended = false;
    this._originalWidth = width;
    this.#numberOfParticles = numberParticles;
    this._particles = [];
    this._lastPosition = { x: undefined, y: undefined };
    this._delta = { x: 0, y: 0 };

    this.init();
  }

  // GETTERS
  get particles() {
    return this._particles;
  }
  get originalWidth() {
    return this._originalWidth;
  }
  get lastPosition() {
    return this._lastPosition;
  }
  get delta() {
    return this._delta;
  }
  // SETTERS

  init() {
    for (let i: number = 0; i < this.#numberOfParticles; i++) {
      const cloudParticle = new ContainedParticle(
        this.game,
        randomNumberBetween(0, this.width), // relative position inside the container
        randomNumberBetween(0, this.height), // relative position inside the container
        this,
        '#3d3c3e'
      );
      this.particles.push(cloudParticle);
    }
  }

  update(timeStamp: number): void {
    const bb = this.getBoundingBox();

    this.delta.x = this.position.x - this.lastPosition.x!;
    this.delta.y = this.position.y - this.lastPosition.y!;

    // Update particles' position to move with the container based on delta
    this.particles.forEach((particle) => {
      particle.update(timeStamp);
    });

    // Check boundaries and reverse direction if needed
    if (
      bb.x <= -this.originalWidth ||
      bb.x + this.originalWidth >=
        this.game.backgroundCanvas.clientWidth + this.originalWidth
    ) {
      this._directionX *= -1;
    }
    if (
      bb.y <= 0 - bb.height ||
      bb.y + bb.height >= this.game.backgroundCanvas.clientHeight + bb.height
    ) {
      this._directionY *= -1;
    }

    // Check for collisions with the player
    if (
      this.game.objectAreColliding(this.game.player, this) &&
      this.#isExpended === false
    ) {
      this.#isExpended = true;
      this.width = this.width * 2;
    } else {
      this.#isExpended = false;
      this.width = this._originalWidth;
    }

    // save last position
    this.lastPosition.x = this.position.x;
    this.lastPosition.y = this.position.y;

    // Move the container
    this.position.x += this._speedX * timeStamp * this._directionX;
    this.position.y += this._speedY * timeStamp * this._directionY;
  }

  render(): void {
    this.particles.forEach((particle) => {
      particle.draw(this.game.backgroundContext);
    });
  }

  drawRect(
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
    x: number,
    y: number
  ): void {
    context.strokeStyle = 'yellow';
    context.strokeRect(x, y, width, height);
  }
}

export default ParticlesContainer;
