import Game from './Game';
import { Position } from './GameObject';

class Particle {
  _game: Game;
  _isActive: boolean;
  _position: Position;
  _size: number;
  _speedX: number;
  _speedY: number;
  _color: string | undefined;

  constructor(game: Game) {
    this._game = game;
    this._isActive = true;
    this._position = { x: 0, y: 0 };
    this._size = this._speedX = this._speedY = 0;
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

  update(timeStamp: number) {
    this.position.x -= (timeStamp * this.game.player._dx * this.speedX) / 30;
    this.position.y += (timeStamp * this.speedY) / 30;
    this.size *= 0.92;
    if (this.size < 0.5) this.isActive = false;
  }
}

class Dust extends Particle {
  constructor(game: Game, x: number, y: number, color: string) {
    super(game);
    this.position.x = x;
    this.position.y = y;
    this.size = Math.random() * 10 + 5;
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
}

class Cloud extends Particle {
  constructor(game: Game, x: number, y: number, color: string) {
    super(game);
    this.position.x = x;
    this.position.y = y;
    this.size = Math.random() * 10 + 5;
    this.speedX = Math.random();
    this.speedY = Math.random();
    this.color = color;
  }
}

export { Dust, Cloud };
