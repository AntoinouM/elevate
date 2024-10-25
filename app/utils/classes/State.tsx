import Player from './Player';

const states = {
  IDLE: 0,
  WALK: 1,
  RISE: 2,
  FLY: 3,
};

interface Position {
  x: number;
  y: number;
}

class State {
  _state: string;

  constructor(state: string) {
    this._state = state;
  }

  // GETTER
  get state() {
    return this._state;
  }

  // SETTER
  set state(state: string) {
    this._state = state;
  }
}

class Idle extends State {
  _player: Player;

  constructor(player: Player) {
    super('IDLE');
    this._player = player;
  }

  // GETTER
  get player() {
    return this._player;
  }

  // SETTER
  set player(player: Player) {
    this._player = player;
  }

  enter() {
    this.player.frameY = 0;
    this.player._imageOptions.maxFrame = 4;
    this.player._imageOptions.fps = 4;
  }
  handleStateChange(position: Position, config: any) {
    if (this.player.pointerDistance > 2 && position.y === config.ground) {
      this.player.setState(states.WALK);
    } else if (this.player.verticalForce < 0) {
      this.player.setState(states.RISE);
    }
  }
}

class Walk extends State {
  _player: Player;

  constructor(player: Player) {
    super('WALK');
    this._player = player;
  }

  // GETTER
  get player() {
    return this._player;
  }

  // SETTER
  set player(player: Player) {
    this._player = player;
  }

  enter() {
    this.player.frameY = 1;
    this.player._imageOptions.maxFrame = 6;
    this.player._imageOptions.fps = 8;
  }
  handleStateChange(position: Position, config: any) {
    if (this.player.pointerDistance <= 2 && position.y === config.ground) {
      this.player.setState(states.IDLE);
    } else if (this.player.verticalForce < 0) {
      this.player.setState(states.RISE);
    }
  }
}

class Rise extends State {
  _player: Player;

  constructor(player: Player) {
    super('RISE');
    this._player = player;
  }

  // GETTER
  get player() {
    return this._player;
  }

  // SETTER
  set player(player: Player) {
    this._player = player;
  }

  enter() {
    this.player.frameY = 2;
    this.player._imageOptions.maxFrame = 8;
    this.player._imageOptions.fps = 6;
    console.log('enter RISE');
  }
  handleStateChange(position: Position, config: any) {
    console.log(this.player.verticalForce);
    if (this.player.verticalForce >= 0) this.player.setState(states.FLY);
  }
}

class Fly extends State {
  _player: Player;

  constructor(player: Player) {
    super('FLY');
    this._player = player;
  }

  // GETTER
  get player() {
    return this._player;
  }

  // SETTER
  set player(player: Player) {
    this._player = player;
  }

  enter() {
    this.player.frameY = 3;
    this.player._imageOptions.maxFrame = 4;
    this.player._imageOptions.fps = 8;
  }
  handleStateChange(position: Position, config: any) {
    if (this.player.pointerDistance > 2 && position.y === config.ground) {
      this.player.setState(states.WALK);
    } else if (
      this.player.pointerDistance <= 2 &&
      position.y === config.ground
    ) {
      this.player.setState(states.IDLE);
    }
  }
}

export { State, Idle, Walk, Rise, Fly, states };
