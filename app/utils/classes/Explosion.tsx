import Game from './Game';
import { GameObject } from './GameObject';

class Explosion extends GameObject {
  _config;
  _width: number;
  _height: number;
  _image: HTMLImageElement;
  _frameX: number;
  _timer: number;
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
      speed: 10,
    };
    this._image = new Image();
    this._image.onload = () => {
      this.#imageReady = true;
    };
    this._image.src = '/boom.png';
    this._frameX = 0;
    this._timer = 0;

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

  // SETTERS
  set frameX(int: number) {
    this._frameX = int;
  }
  set timer(int: number) {
    this._timer = int;
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
    console.log('draw');
    context.drawImage(image, sx, sy, sWidth, sHeight, x, y, width, height);
  }

  render() {
    this.draw(
      this.game.context,
      this.image,
      this.config.spriteWidth * this.frameX,
      this.config.spriteHeight,
      this.config.spriteWidth,
      this.config.spriteHeight,
      this.position.x - this.width * 0.5,
      this.position.y - this.height * 0.5,
      this.width,
      this.height
    );
  }

  update(timeStamp: number) {
    this.timer++;
    if (this.timer % this.config.speed === 0) {
      this.frameX++;
    }
  }
}

export default Explosion;
