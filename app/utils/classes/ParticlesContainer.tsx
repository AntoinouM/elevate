import Game from './Game';
import { GameObject } from './GameObject';

class ParticlesContainer extends GameObject {
  _speedY: number;
  _speedX: number;
  _directionX: number;
  _directionY: number;
  #isExpended: boolean;
  #originalWidth: number;

  constructor(width: number, height: number, x: number, y: number, game: Game) {
    super(width, height, game);
    this.position.x = x;
    this.position.y = y;
    this._speedX = Math.random() * 0.05;
    this._speedY = Math.random() * 0.05;
    this._directionX = Math.random() < 0.5 ? -1 : 1;
    this._directionY = Math.random() < 0.5 ? -1 : 1;
    this.#isExpended = false;
    this.#originalWidth = width;
  }

  update(timeStamp: number): void {
    const bb = this.getBoundingBox();
    if (
      bb.x <= 0 ||
      bb.x + bb.width >= this.game.backgroundCanvas.clientWidth
    ) {
      this._directionX *= -1;
    }
    if (
      bb.y <= 0 ||
      bb.y + bb.height >= this.game.backgroundCanvas.clientHeight
    ) {
      this._directionY *= -1;
    }

    if (
      this.game.objectAreColliding(this.game.player, this) &&
      this.#isExpended === false
    ) {
      this.#isExpended = true;
      this.width = this.width * 2;
    } else {
      this.#isExpended = false;
      this.width = this.#originalWidth;
    }

    this.position.x += this._speedX * timeStamp * this._directionX;
    this.position.y += this._speedY * timeStamp * this._directionY;
  }

  render(): void {
    this.game.backgroundContext.fillStyle = 'rgba(255,255,255,0.2)';
    this.game.backgroundContext.beginPath();
    this.game.backgroundContext.arc(
      this.position.x + 20,
      this.position.y - 100,
      15,
      0,
      Math.PI * 2
    );
    this.game.backgroundContext.fill();
    this.game.backgroundContext.beginPath();
    this.game.backgroundContext.arc(
      this.position.x + 10,
      this.position.y - 40,
      35,
      0,
      Math.PI * 2
    );
    this.game.backgroundContext.fill();
    this.game.backgroundContext.beginPath();
    this.game.backgroundContext.arc(
      this.position.x + 10,
      this.position.y - 80,
      25,
      0,
      Math.PI * 2
    );
    this.game.backgroundContext.fill();
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
