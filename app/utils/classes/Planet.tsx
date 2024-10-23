import Game from './Game';
import GameObject from './GameObject';

class Planet extends GameObject {
  constructor(width: number, height: number, x: number, y: number, game: Game) {
    super(width, height, x, y, game);

    this.init();
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

  init() {
    this.game.context.strokeStyle = 'pink';
    this.game.context.lineWidth = 1.5;
  }
  update() {}
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
