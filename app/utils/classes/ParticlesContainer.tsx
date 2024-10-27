import Game from './Game';
import { GameObject } from './GameObject';

class ParticleContainer extends GameObject {
  _speedY: number;
  _speedX: number;
  _directionX: number;
  _directionY: number;

  constructor(width: number, height: number, x: number, y: number, game: Game) {
    super(width, height, game);
    this.position.x = x;
    this.position.y = y;
    this._speedX = Math.random();
    this._speedY = Math.random();
    this._directionX = Math.random() < 0.5 ? -1 : 1;
    this._directionY = Math.random() < 0.5 ? -1 : 1;
  }

  update(timeStamp: number): void {
    this.position.x += this._speedX * timeStamp * this._directionX;
    this.position.x += this._speedY * timeStamp * this._directionY;
  }

  render(): void {
    this.game.context.save();

    this.drawRect(
      this.game.backgroundContext,
      this.width,
      this.height,
      this.position.x,
      this.position.y
    );

    this.game.context.restore();
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

export default ParticleContainer;
