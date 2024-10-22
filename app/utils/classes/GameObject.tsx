import { v4 as uuidv4 } from 'uuid';

interface Position {
  x: number;
  y: number;
}

class GameObject {
  _width: number = 0;
  _height: number = 0;
  _position: Position = { x: 0, y: 0 };
  _id;

  constructor(width: number, height: number, x: number, y: number) {
    this._width = width;
    this._height = height;
    this._position.x = x;
    this._position.y = y;
    this._id = uuidv4();
  }

  // GETTERS
  get width() {
    return this._width;
  }
  get height() {
    return this._height;
  }
  get position() {
    return this._position;
  }
  get id() {
    return this._id;
  }

  init(context: CanvasRenderingContext2D) {
    console.log(context);
  }
  update() {}
  render() {}

  getBoundingBox(): object {
    return {
      position: {
        x: this.position.x,
        y: this.position.y,
        width: this.width,
        height: this.height,
      },
    };
  }
}

export default GameObject;
