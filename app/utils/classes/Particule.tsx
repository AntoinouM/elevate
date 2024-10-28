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

  update(timeStamp: number) {}
}

class Dust extends Particle {
  constructor(game: Game, x: number, y: number, color: string) {
    super(game);
    this.position.x = x;
    this.position.y = y;
    this.size = randomNumberBetween(10, 15);
    this.width = this.height = this.size * 2;
    this.speedX = Math.random();
    this.speedY = Math.random();
    this.color = color;
  }

  draw(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.arc(
      this.position.x - this.game.player.width * 0.15 * this.game.player._dx,
      this.position.y + this.game.player.height * 0.1,
      this.size,
      0,
      Math.PI * 2
    );
    context.fillStyle = this.color;
    context.fill();
  }

  update(timeStamp: number) {
    this.position.x -= (timeStamp * this.game.player._dx * this.speedX) / 30;
    this.position.y += (timeStamp * this.speedY) / 30;
    this.size *= 0.92;
    if (this.size < 0.5) this.isActive = false;
  }
}

class ContainedParticle extends Particle {
  _container: ParticlesContainer;
  _directionX: number;
  _directionY: number;

  constructor(
    game: Game,
    x: number,
    y: number,
    container: ParticlesContainer,
    color: string
  ) {
    super(game);
    this.position.x = container.getBoundingBox().x + x; // Start relative to container position
    this.position.y = container.getBoundingBox().y + y; // Start relative to container position
    this.size = randomNumberBetween(10, 35);
    this.width = this.height = this.size * 2;
    this.speedX = Math.random();
    this.speedY = Math.random();
    this.color = color;
    this._container = container;

    // Randomization of direction
    this._directionX = Math.random() < 0.5 ? -1 : 1;
    this._directionY = Math.random() < 0.5 ? -1 : 1;
  }

  update(timeStamp: number) {
    let deltaX, deltaY;
    this._container.delta.x ? (deltaX = this._container.delta.x) : (deltaX = 0);
    this._container.delta.y ? (deltaY = this._container.delta.y) : (deltaY = 0);

    // Check boundaries and ensure particles stay within the container
    this.clampInContainer(this._container);

    // change direction of particle and speed if collision with player
    this.manageCollisionWithPlayer(this.game.player);

    // check if particle is in container
    if (this.isInContainer(this._container)) {
      // Move particles based on their speed and direction
      this.moveParticle(
        timeStamp,
        this.speedX,
        this.speedY,
        this._directionX,
        this._directionY,
        60,
        deltaX,
        deltaY
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
      // check which border is closer
      let isCloserToRightSide =
        this.position.x - player.x > player.x + player.width - this.position.x;
      // change direction to closer side
      if (isCloserToRightSide) this.position.x = player.x + player.width;
      if (!isCloserToRightSide) this.position.x = player.x;
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
    deltaY: number
  ) {
    this.position.x += (speedX * directionX * timeStamp) / limiter + deltaX;
    this.position.y += (speedY * directionY * timeStamp) / limiter + deltaY;
  }

  isInContainer(containerObj: ParticlesContainer): boolean {
    const container = containerObj.getBoundingBox();
    if (
      this.position.x >= container.x &&
      this.position.x <= container.x + this._container._originalWidth &&
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
    deltaY: number
  ) {
    const centerX = container.position.x + container.width / 2;
    const centerY = container.position.y + container.height / 2;

    // Calculate the distance to the center
    const distanceX = centerX - this.position.x;
    const distanceY = centerY - this.position.y;

    // Calculate the Euclidean distance
    const distanceToCenter = Math.sqrt(
      distanceX * distanceX + distanceY * distanceY
    );

    // Normalize direction to center and scale by distance
    const normalizedX = distanceX / distanceToCenter;
    const normalizedY = distanceY / distanceToCenter;

    // Move particle towards the center with a smoothing factor
    const smoothingFactor = 0.01; // Adjust as needed for smoothness
    this.position.x +=
      normalizedX * this.speedX * timeStamp * smoothingFactor + deltaX;
    this.position.y +=
      normalizedY * this.speedY * timeStamp * smoothingFactor + deltaY;
  }
}

export { Dust, ContainedParticle };
