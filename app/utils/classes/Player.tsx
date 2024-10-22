import GameObject from './GameObject';

class Player extends GameObject {
  _dx: number = 0;
  _dy: number = 0;
  _velocity: number = 0;

  constructor(width: number, height: number, x: number, y: number) {
    super(width, height, x, y);
  }

  init(context: CanvasRenderingContext2D) {
    context.fillStyle = 'pink';
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

export default Player;
