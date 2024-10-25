import Player from './Player';

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
}

export { State, Idle, Walk, Rise, Fly };
