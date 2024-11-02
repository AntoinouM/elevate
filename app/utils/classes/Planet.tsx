import { randomNumberBetween } from '../utils';
import Game from './Game';
import { GameObject } from './GameObject';

class Planet extends GameObject {
  #fallAccelerator: number = 1;

  constructor(width: number, height: number, game: Game) {
    super(width, height, game);

    this.init();
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  draw(
    context: CanvasRenderingContext2D,
    image: CanvasImageSource,
    sx: number,
    sy: number,
    sWidth: number,
    sHeight: number,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    context.beginPath();
    context.arc(x, y, width, 0, Math.PI * 2);
    context.stroke();
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */

  init(): void {
    this.position.x = Math.random() * this.game.canvas.clientWidth;
    this.position.x = randomNumberBetween(
      this.width * 0.5,
      this.game.canvas.clientWidth - this.width * 0.5
    );
    this.position.y = -this.width;

    this.game.context.strokeStyle = 'pink';
    this.game.context.lineWidth = 1.5;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(timeStamp: number): void {
    if (this.free) return;
    this.position.y! += this.game.config.PLANET.fallingSpeed * timeStamp * 1.6;

    if (this.position.y! > this.game.canvas.clientHeight + this.width * 0.5)
      this.reset();
  }

  render(): void {
    if (this.free) return;
    this.draw(
      this.game.context,
      new Image(),
      0,
      0,
      0,
      0,
      this.position.x!,
      this.position.y!,
      this.width * 0.5,
      this.height
    );
  }

  reset() {
    this.free = true;
    this.position.x = Math.random() * this.game.canvas.clientWidth;
    this.position.y = 0;
  }

  activate() {
    this.free = false;
  }
}

export default Planet;
