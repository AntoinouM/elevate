import Game from './Game';

interface Freeable {
  free: boolean;
}

const states = {
  BEFORE: 0,
  ONGOING: 1,
  ENDED: 2,
};

class GameStates {
  _state: string;
  _game: Game;

  constructor(state: string, game: Game) {
    this._state = state;
    this._game = game;
  }

  // GETTERS
  get state() {
    return this._state;
  }
  get game() {
    return this._game;
  }

  // SETTERS
  set state(state: string) {
    this._state = state;
  }

  update(timeStamp: number): void {}

  render(): void {}
}

class GameBefore extends GameStates {
  constructor(game: Game) {
    super('BEFORE', game);
  }
}

class GameOnGoing extends GameStates {
  constructor(game: Game) {
    super('ONGOING', game);
  }
}

class GameEnded extends GameStates {
  constructor(game: Game) {
    super('ENDED', game);
  }
}

export { GameBefore, GameEnded, GameOnGoing };
