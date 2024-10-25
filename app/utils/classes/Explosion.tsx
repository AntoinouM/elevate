import { Position } from './GameObject';

class Explosion {
  _position: Position;
  _config: object;

  constructor(x: number, y: number) {
    this._position = { x: x, y: y };
    this._config = {
      spriteWidth: 200,
      spriteHeight: 179,
    };
  }

  // GETTERS
  get position() {
    return this._position;
  }
  get config() {
    return this._config;
  }
}

export default Explosion;
