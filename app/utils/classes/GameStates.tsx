import { poolFunctions, randomNumberBetween } from '../utils';
import Explosion from './Explosion';
import Game from './Game';
import { GameObject } from './GameObject';
import ParticlesContainer from './ParticlesContainer';
import { Dust } from './Particule';
import Planet from './Planet';
import Player from './Player';

const states = {
  BEFORE: 0,
  ONGOING: 1,
  OVER: 2,
};

class GameStates {
  _state: string;
  _game: Game;
  #gameObjects = new Map<string, GameObject>();

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
  get gameObjects() {
    return this.#gameObjects;
  }

  // SETTERS
  set state(state: string) {
    this._state = state;
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  update(timeStamp: number): void {}
  /* eslint-enable @typescript-eslint/no-unused-vars */

  render(): void {}
}

class GameBefore extends GameStates {
  constructor(game: Game) {
    super('BEFORE', game);
  }

  start() {}

  handleStateChange() {
    this.game.setState(states.ONGOING);
  }
}

class GameOnGoing extends GameStates {
  _collectiblesPool: Planet[];
  _explosionsPool: Explosion[];
  _particles: Dust[];
  _cloudContainer1: ParticlesContainer;
  _planetCounter: number;

  constructor(game: Game) {
    super('ONGOING', game);

    this._collectiblesPool = [];
    this._explosionsPool = [];
    this._particles = [];
    this._cloudContainer1 = this.createCloud();
    this._planetCounter = randomNumberBetween(
      this.game.config.PLANET.planetMinInterval,
      this.game.config.PLANET.planetMaxInterval,
    );

    this.init();
  }

  // GETTERS
  get collectiblesPool() {
    return this._collectiblesPool;
  }
  get explosionsPool() {
    return this._explosionsPool;
  }
  get particles() {
    return this._particles;
  }
  get particleContainer() {
    return this._cloudContainer1;
  }
  get planetCounter() {
    return this._planetCounter;
  }

  // SETTERS
  set planetCounter(int: number) {
    this._planetCounter = int;
  }

  start() {}

  init() {
    this.gameObjects.set(this.game.player.id, this.game.player);
    this.gameObjects.set(this._cloudContainer1.id, this._cloudContainer1);
    this.createPools();
  }

  update(timeStamp: number) {
    // update game objects
    this.updateGameObjects(this.gameObjects, timeStamp);

    // update particles container
    this.particleContainer.update(timeStamp);

    // update particles
    this.game.player.particles.forEach((dust) => {
      dust.update(timeStamp);
    });

    // check for collision
    this.collectiblesPool.forEach((planet) => {
      if (planet.free || !this.objectAreColliding(this.game.player, planet))
        return;
      const explosion = poolFunctions.getFirstFreeElementFromPool<Explosion>(
        this.explosionsPool,
      );
      if (explosion) {
        explosion.activate(planet.position.x, planet.position.y);
        this.gameObjects.set(explosion.id, explosion);
      }
      this.game.player.verticalForce = -this.game.config.impulseForce;
      planet.reset();
    });

    // create periodically planets with dynamic intervals
    this.planetCounter -= timeStamp;
    if (this.planetCounter <= 0) {
      // Use dynamic spawn interval based on height and safety
      this.planetCounter = this.getSpawnInterval();
      this.spawnPlanetObjects();
    }

    // Safety spawn: if player is falling and no reachable planet, force spawn
    if (this.game.player.verticalForce > 0 && !this.hasReachablePlanet()) {
      if (this.planetCounter > 200) {
        this.planetCounter = 200; // Force spawn very soon
      }
    }
  }

  render() {
    // render particles
    this.game.player.particles.forEach((dust) => {
      dust.draw(this.game.context);
    });

    this.gameObjects.forEach((obj) => {
      if (obj instanceof Planet || obj instanceof Explosion) {
        if (obj.free) {
          return;
        } else {
          obj.render();
        }
      } else {
        obj.render();
      }
    });
  }

  checkForCollisions(player: Player, objectPool: Planet[]) {
    objectPool.forEach((planet) => {
      if (planet.free || !this.objectAreColliding(player, planet)) return;
      this.generateExplosion(planet);
      this.addVerticalForceToPlayer(player);
      planet.reset();
    });
  }

  addVerticalForceToPlayer(player: Player) {
    player.verticalForce = -this.game.config.impulseForce;
  }

  generateExplosion(planet: Planet) {
    const explosion = poolFunctions.getFirstFreeElementFromPool<Explosion>(
      this.explosionsPool,
    );
    if (explosion) {
      explosion.activate(planet.position.x, planet.position.y);
      this.gameObjects.set(explosion.id, explosion);
    }
  }

  updateGameObjects(
    gameObjectsMap: Map<string, GameObject>,
    timeStamp: number,
  ) {
    gameObjectsMap.forEach((obj) => {
      if (obj instanceof Planet || obj instanceof Explosion) {
        if (obj.free) {
          return;
        } else {
          obj.update(timeStamp);
        }
      } else {
        obj.update(timeStamp);
      }
    });

    /* eslint-disable @typescript-eslint/no-unused-vars */
    const handleObjectFromPool = (object: Planet | Explosion): void => {};

    const isObjectFromPool = (object: GameObject): boolean => {
      if (Object.hasOwn(object, '_free')) {
        return true;
      } else {
        return false;
      }
    };
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */

  objectAreColliding(object1: GameObject, object2: GameObject): boolean {
    const bbA = object1.getBoundingBox();
    const bbB = object2.getBoundingBox();

    if (
      bbA.x < bbB.x + bbB.width &&
      bbA.x + bbA.width > bbB.x &&
      bbA.y < bbB.y + bbB.height &&
      bbA.y + bbA.height > bbB.y
    ) {
      // collision happened
      return true;
    } else return false;
  }

  spawnPlanetObjects() {
    const planet = poolFunctions.getFirstFreeElementFromPool<Planet>(
      this.collectiblesPool,
    );
    planet?.activate();
  }

  hasReachablePlanet(): boolean {
    // Calculate player's maximum jump height
    const impulseForce = this.game.config.impulseForce;
    const gravity = Math.abs(this.game.config.gravity);
    const maxJumpHeight = (impulseForce * impulseForce) / (2 * gravity);

    // Reduce reachable distance by 20% to trigger safety spawning earlier (easier)
    const reducedJumpHeight = maxJumpHeight * 0.8;
    
    // Add margin for safety
    const reachableMinY = this.game.player.position.y - reducedJumpHeight - 100;
    const reachableMaxY = this.game.player.position.y + 200; // Include falling distance

    // Check if any active planet is within vertical reach
    return this.collectiblesPool.some((planet) => {
      if (planet.free) return false;
      return (
        planet.position.y >= reachableMinY && planet.position.y <= reachableMaxY
      );
    });
  }

  getSpawnInterval(): number {
    const heightPercent = this.game.player.positionYPercent;
    const baseMin = this.game.config.PLANET.planetMinInterval;
    const baseMax = this.game.config.PLANET.planetMaxInterval;

    // Adjust spawn intervals based on height
    let minInterval = baseMin;
    let maxInterval = baseMax;

    if (heightPercent > 75) {
      // High altitude: spawn much more frequently
      minInterval = baseMin * 0.4; // 400ms
      maxInterval = baseMax * 0.5; // 1100ms
    } else if (heightPercent > 50) {
      // Medium altitude: spawn moderately more
      minInterval = baseMin * 0.6; // 600ms
      maxInterval = baseMax * 0.7; // 1540ms
    } else if (heightPercent > 25) {
      // Low-medium altitude: spawn slightly more
      minInterval = baseMin * 0.8; // 800ms
      maxInterval = baseMax * 0.85; // 1870ms
    }

    // Safety check: if no reachable planet, reduce interval significantly
    if (!this.hasReachablePlanet()) {
      minInterval *= 0.3; // Emergency spawn
      maxInterval *= 0.3;
    }

    return randomNumberBetween(minInterval, maxInterval);
  }

  createCloud() {
    const width = this.game.backgroundCanvas.clientWidth * 0.3;
    const height = this.game.backgroundCanvas.clientHeight * 0.3;
    const minX = 0 + width * 0.5;
    const maxX = this.game.backgroundCanvas.clientWidth - width;
    const minY = 0 + height * 0.5;
    const maxY = this.game.backgroundCanvas.clientHeight - height;

    return new ParticlesContainer(
      width,
      height,
      randomNumberBetween(minX, maxX),
      randomNumberBetween(minY, maxY),
      75,
      this.game,
    );
  }

  createPools() {
    poolFunctions.createPool(
      this.game.config.PLANET.maximum,
      Planet,
      this.collectiblesPool,
      this.gameObjects,
      this.game.config.PLANET.diameter,
      this.game.config.PLANET.diameter,
      this.game,
    );
    poolFunctions.createPool(
      this.game.config.PLANET.maximum,
      Explosion,
      this.explosionsPool,
      this.gameObjects,
      this.game.config.PLANET.diameter,
      this.game.config.PLANET.diameter,
      this.game,
    );
  }
}

class GameEnded extends GameStates {
  constructor(game: Game) {
    super('ENDED', game);
  }

  start() {}
}

export { GameBefore, GameEnded, GameOnGoing };
