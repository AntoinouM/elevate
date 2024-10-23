import Game from './Game';
import GameObject from './GameObject';

class Planet extends GameObject {
  _free: boolean;

  constructor(width: number, height: number, x: number, y: number, game: Game) {
    super(width, height, x, y, game);
    this._free = true;

    this.init();
  }

  // GETTERS
  get free(): boolean {
    return this._free;
  }

  // SETTERS
  set free(bool: boolean) {
    this._free = bool;
  }

  draw(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    context.beginPath();
    context.arc(x, y, width, 0, Math.PI * 2);
    context.stroke();
  }

  init(): void {
    this.game.context.strokeStyle = 'pink';
    this.game.context.lineWidth = 1.5;
  }

  update(timeStamp: number): void {
    this.position.y += this.game.config.PLANET.fallingSpeed;
  }

  render(): void {
    // Draw planet using adjusted positions
    this.draw(
      this.game.context,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }
}

export default Planet;
