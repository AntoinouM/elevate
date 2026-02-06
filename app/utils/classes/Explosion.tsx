import Game from './Game';
import { GameObject } from './GameObject';
import { ExplosionParticle } from './Particule';

class Explosion extends GameObject {
  _width: number;
  _height: number;
  _particles: ExplosionParticle[];
  _timer: number;
  _free: boolean;
  _maxLifetime: number = 600; // Maximum lifetime in ms

  constructor(width: number, height: number, game: Game) {
    super(width, height, game);
    this._width = width;
    this._height = height;
    this._particles = [];
    this._timer = 0;
    this._free = true;

    this.init();
  }

  // GETTERS
  get width() {
    return this._width;
  }
  get height() {
    return this._height;
  }
  get particles() {
    return this._particles;
  }
  get timer() {
    return this._timer;
  }
  get free() {
    return this._free;
  }

  // SETTERS
  set timer(int: number) {
    this._timer = int;
  }
  set free(bool: boolean) {
    this._free = bool;
  }

  render() {
    if (this.free) return;

    // Draw all particles
    this._particles.forEach((particle) => {
      particle.draw(this.game.context);
    });
  }

  update(timeStamp: number) {
    if (this.free) return;

    // Update timer
    this._timer += timeStamp;

    // Update all particles
    this._particles.forEach((particle) => {
      particle.update(timeStamp);
    });

    // Remove inactive particles
    this._particles = this._particles.filter((particle) => particle.isActive);

    // Reset explosion when all particles are gone or max lifetime reached
    if (this._particles.length === 0 || this._timer >= this._maxLifetime) {
      this.reset();
    }
  }

  reset() {
    this.free = true;
    this._particles = [];
    this._timer = 0;
  }

  activate(x: number, y: number) {
    this.position.x = x;
    this.position.y = y;
    this._timer = 0;
    this.free = false;

    const particleCount = Math.floor(Math.random() * 6) + 8; // 8-14 particles
    this._particles = [];

    for (let i = 0; i < particleCount; i++) {
      this._particles.push(new ExplosionParticle(this.game, x, y));
    }
  }
}

export default Explosion;
