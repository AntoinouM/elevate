import Game from './Game';
import GameObject from './GameObject';

interface Position {
  x: number;
  y: number;
}

class Player extends GameObject {
  _dx: number = 1;
  _dy: number = 0;
  _velocity: number = 0.02;
  _pointerPosition: Position;
  _pointerMaxDistance = 450;
  _pointerDistance = 0;

  constructor(width: number, height: number, x: number, y: number, game: Game) {
    super(width, height, x, y, game);
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

  draw(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    // later on add more parameters to make the draw function reusable;
    context.fillStyle = 'white';
    context.fillRect(x, y, width, height);
  }

  init(): void {
    // trigger mouse detection
    window.addEventListener('mousemove', (event) =>
      this.handlePointer(event, this.game.context.canvas)
    );
    this.game.canvas.addEventListener('touchmove', (event) =>
      this.handlePointer(event, this.game.context.canvas)
    );
  }

  update(timeStamp: number): void {
    this._dx = this.checkDirection();
    this.movePlayer(timeStamp, this.game.canvas);
  }
  render(): void {
    super.render();
    this.game.context.save();
    // super.render(context);
    this.game.context.translate(this.position.x, this.position.y);
    // flip the image if we're moving to the left
    this.game.context.scale(this._dx, 1);

    // draw player
    this.draw(
      this.game.context,
      -this.width / 2,
      -this.width / 2,
      this.width,
      this.height
    );

    this.game.context.restore();
  }

  handlePointer = (
    event: MouseEvent | TouchEvent,
    canvas: HTMLCanvasElement
  ): void => {
    if (event.type.includes('touch')) {
      const touchEvent = event as TouchEvent;
      this.pointerPosition = {
        x: touchEvent.touches[0].pageX,
        y: touchEvent.touches[0].pageY,
      };
    } else if (event.type.includes('mouse')) {
      const mouseEvent = event as MouseEvent;
      this.pointerPosition = {
        x: mouseEvent.clientX - canvas.offsetLeft,
        y: mouseEvent.clientY - canvas.offsetTop,
      };
    }
  };

  movePlayer = (timeStamp: number, canvas: HTMLCanvasElement): void => {
    // changing x in regard of the mouse position
    if (this.pointerPosition.x <= this.position.x) {
      if (
        Math.floor(this.position.x - this.pointerPosition.x) <
        this._pointerMaxDistance
      ) {
        this._pointerDistance = Math.floor(
          this.position.x - this.pointerPosition.x
        );
      } else {
        this._pointerDistance = this._pointerMaxDistance;
      }
    } else if (this.pointerPosition.x > this.position.x) {
      if (
        Math.floor(this.pointerPosition.x - this.position.x) <
        this._pointerMaxDistance
      ) {
        this._pointerDistance = Math.floor(
          this._pointerPosition.x - this.position.x
        );
      } else {
        this._pointerDistance = this._pointerMaxDistance;
      }
    }
    // movement implementation
    // changing this.x regarding the distance with the mouse
    this.position.x +=
      timeStamp * this._dx * this._velocity * (this._pointerDistance / 10);
    // create a variable to influence the falling speed if too close to the top
    // y movement with simplified Euleur algorythm
    // vertical velocity
    // vertical position
    // ground check
    // verticalForce input if contact with clouds
    // boundaries checking
    // check for right boundary
    if (this.position.x > canvas.offsetWidth)
      this.position.x = canvas.offsetWidth;
    // check for left boundary
    if (this.position.x < 0) this.position.x = 0;
    // check for top boundary
    //if (this.y <= 0) this.y = 0;
    // define the state variable in regard of mouse distance and if on the ground
  };

  getBoundingBox(): object {
    return super.getBoundingBox();
  }

  checkDirection(): -1 | 1 {
    return Math.floor(this.pointerPosition.x) < this.position.x ? -1 : 1;
  }
}

export default Player;
