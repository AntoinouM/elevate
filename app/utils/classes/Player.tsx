import Game from './Game';
import { GameObject } from './GameObject';
import { Fly, Idle, Rise, State, Walk } from './State';

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
  _positionYPercent: number;
  _states: Idle[] | Walk[] | Rise[] | Fly[];
  _currentState: Idle | Walk | Rise | Fly;
  _verticalForce: number = 0;
  private isAtEnd: boolean = false;

  // animation
  _image;
  _imageOptions = {
    width: 400,
    height: 400,
    maxFrame: 4,
    fps: 4,
  };
  _imageLoaded: boolean = false;
  _frameX: number;
  _frameY: number;

  constructor(width: number, height: number, x: number, y: number, game: Game) {
    super(width, height, game);
    this.position.x = x;
    this.position.y = y;
    this._pointerPosition = {
      x: 0,
      y: 0,
    };
    this._positionYPercent = y / game.canvas.height;
    this._frameX = 1;
    this._frameY = 0;
    this._states = [
      new Idle(this),
      new Walk(this),
      new Rise(this),
      new Fly(this),
    ];
    this._currentState = this._states[0];
    this._image = new Image();
    this._image.src = '/Astro.png';
    this._image.onload = () => {
      this._imageLoaded = true; // Mark as loaded once the image is fully loaded
    };
    this._image.onerror = () => {
      console.error('Failed to load the player image.');
    };
    this.init();
  }

  // GETTERS
  get pointerPosition() {
    return this._pointerPosition;
  }
  get frameY() {
    return this._frameY;
  }
  get frameX() {
    return this._frameX;
  }
  get pointerDistance() {
    return this._pointerDistance;
  }
  get currentState() {
    return this._currentState;
  }
  get states() {
    return this._states;
  }
  get verticalForce() {
    return this._verticalForce;
  }

  // SETTERS
  set pointerPosition(position: Position) {
    this._pointerPosition = position;
  }
  set frameX(int: number) {
    this._frameX = int;
  }
  set frameY(int: number) {
    this._frameY = int;
  }
  set currentState(state: Idle | Walk | Rise | Fly) {
    this._currentState = state;
  }
  set verticalForce(int: number) {
    this._verticalForce = int;
  }

  // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
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
    // later on add more parameters to make the draw function reusable;
    if (!this._imageLoaded) return;
    context.drawImage(image, sx, sy, sWidth, sHeight, x, y, width, height);
  }

  init(): void {
    // trigger mouse detection
    window.addEventListener('mousemove', (event) =>
      this.handlePointer(event, this.game.context.canvas)
    );
    this.game.canvas.addEventListener('touchmove', (event) =>
      this.handlePointer(event, this.game.context.canvas)
    );
    this.game.canvas.addEventListener('touchstart', () => {
      if (this.position.y === this.game.config.ground) {
        this.verticalForce -= this.game.config.impulseForce;
      }
    });
    this.game.canvas.addEventListener('mousedown', () => {
      if (this.position.y === this.game.config.ground) {
        this.verticalForce -= this.game.config.impulseForce;
      }
    });
  }

  update(timeStamp: number): void {
    this._dx = this.checkDirection();
    this.movePlayer(timeStamp, this.game.canvas);
    this.currentState.handleStateChange(this.position, this.game.config);
  }
  render(): void {
    this.game.context.save();
    // super.render(context);
    this.game.context.translate(this.position.x!, this.position.y!);
    // flip the image if we're moving to the left
    this.game.context.scale(this._dx, 1);

    // frame check
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.frameX = Math.floor(
      ((performance.now() / 1000) * this._imageOptions.fps) %
        this._imageOptions.maxFrame
    );

    // draw player
    this.draw(
      this.game.context,
      this._image,
      this.frameX * this._imageOptions.width,
      this.frameY * this._imageOptions.height,
      this._imageOptions.width,
      this._imageOptions.height,
      -this.width / 2,
      -this.height / 2,
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

  updateXPosition(
    sourcePosition: number,
    targetPosition: number,
    maxDistance: number
  ): number {
    let sourceToTargetDistance = 0;

    if (targetPosition <= sourcePosition) {
      if (Math.floor(sourcePosition - targetPosition) < maxDistance) {
        sourceToTargetDistance = Math.floor(sourcePosition - targetPosition);
      } else {
        sourceToTargetDistance = maxDistance;
      }
    } else if (targetPosition > sourcePosition) {
      if (Math.floor(targetPosition - sourcePosition) < maxDistance) {
        sourceToTargetDistance = Math.floor(targetPosition - sourcePosition);
      } else {
        sourceToTargetDistance = maxDistance;
      }
    }

    return sourceToTargetDistance;
  }

  updateYPosition(timeStamp: number): void {
    // create a variable to influence the falling speed if too close to the top
    let gravityDelta = 1;
    if (
      ((this.position.y! + this.height) * 100) / this.game.canvas.clientHeight <
      this.height / 2
    ) {
      gravityDelta =
        1 +
        this.game.canvas.clientHeight / (this.position.y! + this.height) / 10;
    } else {
      gravityDelta = 1;
    }
    // y movement with simplified Euleur algorythm
    // vertical velocity
    this.verticalForce -= this.game.config.gravity * timeStamp * gravityDelta;

    this.position.y! += this.verticalForce * timeStamp;
  }

  checkBoundaries() {}

  movePlayer = (timeStamp: number, canvas: HTMLCanvasElement): void => {
    // update X position
    this._pointerDistance = this.updateXPosition(
      this.position.x!,
      this.pointerPosition.x,
      this._pointerMaxDistance
    );

    // movement implementation
    this.position.x! +=
      timeStamp * this._dx * this._velocity * (this._pointerDistance / 8);

    // update Y position
    this.updateYPosition(timeStamp);

    // ground check
    if (this.position.y! > this.game.config.ground) {
      this.position.y = this.game.config.ground;
      this.verticalForce = 0;
    }
    // verticalForce input if contact with clouds
    // boundaries checking
    // check for right boundary
    if (this.position.x! > canvas.offsetWidth)
      this.position.x = canvas.offsetWidth;
    // check for left boundary
    if (this.position.x! < 0) this.position.x = 0;
    // check for top boundary
    if (this.position.y! <= 0) this.position.y = 0;
  };

  getBoundingBox(): object {
    return super.getBoundingBox();
  }

  checkDirection(): -1 | 1 {
    return Math.floor(this.pointerPosition.x) < this.position.x! ? -1 : 1;
  }

  start() {}

  setState(state: number) {
    this.currentState = this.states[state];
    this.currentState.enter();
  }
}

export default Player;
