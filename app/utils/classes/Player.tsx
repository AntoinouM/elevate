import GameObject from './GameObject';

interface Position {
  x: number;
  y: number;
}

class Player extends GameObject {
  _dx: number = 0;
  _dy: number = 0;
  _velocity: number = 0;
  _pointerPosition: Position;

  constructor(width: number, height: number, x: number, y: number) {
    super(width, height, x, y);
    this._pointerPosition = {
      x: 0,
      y: 0,
    };
  }

  // GETTERS
  get pointerPosition() {
    return this._pointerPosition;
  }

  // SETTERS
  set pointerPosition(position: Position) {
    this._pointerPosition = position;
  }

  init(context: CanvasRenderingContext2D): void {
    context.fillStyle = 'pink';
    context.fillRect(this.position.x, this.position.y, this.width, this.height);

    // trigger mouse detection
    window.addEventListener('mousemove', this.handlePointer);
    window.addEventListener('touchmove', this.handlePointer);
  }

  update(timeStamp: number): void {
    console.log('from player: ' + timeStamp);
  }
  render(): void {}

  handlePointer(event: MouseEvent | TouchEvent) {
    if (event.type.includes('touch')) {
      // TypeScript now knows this is a TouchEvent
      const touchEvent = event as TouchEvent;
      this.pointerPosition = {
        x: touchEvent.touches[0].pageX,
        y: touchEvent.touches[0].pageY,
      };
    } else if (event.type.includes('mouse')) {
      // TypeScript now knows this is a MouseEvent
      const mouseEvent = event as MouseEvent;
      this.pointerPosition = {
        x: mouseEvent.clientX,
        y: mouseEvent.clientY,
      };
    }
  }
}

export default Player;
