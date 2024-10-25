import Game from './Game';
import { GameObject } from './GameObject';

class Explosion extends GameObject {
  _config;
  _width: number;
  _height: number;
  _image: HTMLImageElement;
  _frameX: number;
  _timer: number;
  _free: boolean;
  #imageReady: boolean = false;

  constructor(x: number, y: number, width: number, height: number, game: Game) {
    super(width, height, game);
    this.position.x = x;
    this.position.y = y;
    this._width = width;
    this._height = height;
    this._config = {
      spriteWidth: 200,
      spriteHeight: 179,
      frames: 5,
      speed: 5,
    };
    this._image = new Image();
    this._image.onload = () => {
      this.#imageReady = true;
    };
    this._image.src = '/boom.png';
    this._frameX = 0;
    this._timer = 0;
    this._free = true;

    this.init();
  }

  // GETTERS
  get config() {
    return this._config;
  }
  get width() {
    return this._width;
  }
  get height() {
    return this._height;
  }
  get image() {
    return this._image;
  }
  get frameX() {
    return this._frameX;
  }
  get timer() {
    return this._timer;
  }
  get free() {
    return this._free;
  }

  // SETTERS
  set frameX(int: number) {
    this._frameX = int;
  }
  set timer(int: number) {
    this._timer = int;
  }
  set free(bool: boolean) {
    this._free = bool;
  }

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
    context.drawImage(image, sx, sy, sWidth, sHeight, x, y, width, height);
  }

  render() {
    const sizeBuffer = 1.5;
    const dimensionBuffed = (dim: number) => {
      return dim * sizeBuffer;
    };

    this.draw(
      this.game.context,
      this.image,
      this.config.spriteWidth * this.frameX,
      0,
      this.config.spriteWidth,
      this.config.spriteHeight,
      this.position.x - dimensionBuffed(this.width) * 0.5,
      this.position.y - dimensionBuffed(this.height) * 0.5,
      dimensionBuffed(this.width),
      dimensionBuffed(this.height)
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  update(timeStamp: number) {
    this.timer++;
    if (this.timer % this.config.speed === 0) {
      this.frameX++;
    }
    if (this.frameX >= this.config.frames) this.reset();
  }

  reset() {
    this.free = true;
  }

  activate(x: number, y: number) {
    this.position.x = x;
    this.position.y = y;
    this.frameX = 0;
    this.free = false;
  }
}

export default Explosion;
