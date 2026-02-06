import { randomNumberBetween } from '../utils';
import Game from './Game';
import { GameObject } from './GameObject';

class Planet extends GameObject {
  #fallAccelerator: number = 1;

  constructor(width: number, height: number, game: Game) {
    super(width, height, game);

    this.init();
  }

  private get fallAccelerator() {
    return this.#fallAccelerator;
  }

  private set fallAccelerator(int: number) {
    this.#fallAccelerator = int;
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
    height: number,
  ): void {
    context.beginPath();
    context.arc(x, y, width, 0, Math.PI * 2);
    context.stroke();
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */

  init(): void {
    this.position.x = Math.random() * this.game.canvasWidth;
    this.position.x = randomNumberBetween(
      this.width * 0.5,
      this.game.canvasWidth - this.width * 0.5,
    );
    this.position.y = -this.width;

    this.game.context.strokeStyle = 'pink';
    this.game.context.lineWidth = 1.5;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(timeStamp: number): void {
    if (this.free) return;
    this.position.y! +=
      this.game.config.PLANET.fallingSpeed * timeStamp * this.fallAccelerator;

    // change falling speed of planet regarding player position
    this.fallAccelerator = this.getSpeedCoefficient(
      this.game.player.positionYPercent,
    );

    if (this.position.y! > this.game.canvasHeight + this.width * 0.5)
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
      this.height,
    );
  }

  getSpeedCoefficient(playerPositionPercentage: number): number {
    // Smooth scaling based on height percentage
    // Base multiplier increases gradually with height
    let multiplyingFactor;

    if (playerPositionPercentage > 90) {
      // Very high: exponential increase for extreme challenge
      multiplyingFactor = 3.5 + (playerPositionPercentage - 90) * 0.15;
    } else if (playerPositionPercentage > 75) {
      // High: significant increase
      multiplyingFactor = 2.2 + (playerPositionPercentage - 75) * 0.08;
    } else if (playerPositionPercentage > 50) {
      // Medium-high: moderate increase
      multiplyingFactor = 1.5 + (playerPositionPercentage - 50) * 0.028;
    } else if (playerPositionPercentage > 25) {
      // Medium: slight increase
      multiplyingFactor = 1.2 + (playerPositionPercentage - 25) * 0.012;
    } else {
      // Low: base speed with minimal scaling
      multiplyingFactor = 1 + playerPositionPercentage * 0.008;
    }

    return multiplyingFactor;
  }

  reset() {
    this.free = true;
    this.position.x = Math.random() * this.game.canvasWidth;
    this.position.y = 0;
  }

  activate() {
    this.free = false;
  }
}

export default Planet;
