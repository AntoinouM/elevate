import Player from '../Player';

class Idle extends Player {
  _options = {
    frames: 4,
    fps: 4,
  };

  start() {
    this.frameY = 0;
    this._imageOptions.maxFrame = this._options.frames;
    this._imageOptions.fps = this._options.fps;
  }
  update(timeStamp: number) {
    super.update(timeStamp);
    if (this.game.player !== this.game.playerStates[0]) return;
    if (this.game._keys.has('s')) this.game.setPlayerState(1);
  }
}

class Walk extends Player {
  _options = {
    frames: 6,
    fps: 8,
  };

  start() {
    super.frameY = 1;
    this._imageOptions.maxFrame = this._options.frames;
    this._imageOptions.fps = this._options.fps;
  }
  update(timeStamp: number) {
    super.update(timeStamp);
    if (this.game.player !== this.game.playerStates[1]) return;
    if (this.game._keys.has('d')) this.game.setPlayerState(0);
  }
}

class Rise extends Player {
  _options = {
    frames: 8,
    fps: 4,
  };

  start() {
    super.start();
    this.frameY = 2;
    this._imageOptions.maxFrame = 8;
    this._imageOptions.fps = 4;
  }
  update(timeStamp: number) {
    super.update(timeStamp);
  }
}

class Fly extends Player {
  _options = {
    frames: 4,
    fps: 8,
  };

  start() {
    super.start();
    this.frameY = 3;
    this._imageOptions.maxFrame = this._options.frames;
    this._imageOptions.fps = this._options.fps;
  }
  update(timeStamp: number) {
    super.update(timeStamp);
  }
}

export { Idle, Walk, Rise, Fly };
