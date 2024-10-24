import Player from '../Player';

class Idle extends Player {
  _options = {
    src: '../../../public/astroIdle.png',
    frames: 4,
    fps: 4,
    image: null,
    frameSize: {
      width: 400,
      height: 400,
    },
  };

  start() {
    super.start();
    super.image.src = this._options.src;
  }
  update(timeStamp: number) {
    super.update(timeStamp);
  }
}

class Walk extends Player {
  _options = {
    src: '/astroWalk.png',
    frames: 6,
    fps: 8,
    image: null,
    frameSize: {
      width: 400,
      height: 400,
    },
  };

  start() {
    super.start();
    super.image.src = this._options.src;
  }
  update(timeStamp: number) {
    super.update(timeStamp);
  }
}

class Rise extends Player {
  _options = {
    src: '/astroRise.png',
    frames: 8,
    fps: 4,
    image: null,
    frameSize: {
      width: 400,
      height: 400,
    },
  };

  start() {
    super.start();
    super.image.src = this._options.src;
  }
  update(timeStamp: number) {
    super.update(timeStamp);
  }
}

class Fly extends Player {
  _options = {
    src: '../../../public/astroFly.png',
    frames: 4,
    fps: 8,
    image: null,
    frameSize: {
      width: 400,
      height: 400,
    },
  };

  start() {
    super.start();
    super.image.src = this._options.src;
  }
  update(timeStamp: number) {
    super.update(timeStamp);
  }
}

export { Idle, Walk, Rise, Fly };
