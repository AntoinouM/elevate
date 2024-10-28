import Game from './classes/Game';
import { GameObject } from './classes/GameObject';

type GameObjectConstructorArgs = [number, number, Game];

interface GameConfig {
  HERO: {
    width: number;
    height: number;
    velocity: number;
  };
  PLANET: {
    diameter: number;
    maximum: number;
    fallingSpeed: number;
    planetTimer: number;
    planetMinInterval: number;
    planetMaxInterval: number;
  };
  fps: number;
  fpsInterval: number;
  ground: number;
  gravity: number;
  impulseForce: number;
  debug: boolean;
}

const poolFunctions = {
  createPool<T extends GameObject>(
    max: number,
    Constructor: new (...args: GameObjectConstructorArgs) => T,
    pool: T[],
    map: Map<string, GameObject>,
    ...constructorArgs: GameObjectConstructorArgs
  ) {
    for (let i = 0; i < max; i++) {
      const instance = new Constructor(...constructorArgs);
      pool.push(instance);
      map.set(instance.id, instance);
    }
  },
  executeOnPool<T, P>(
    pool: Array<T>,
    callback: (pool: Array<T>, params: P) => void,
    params: P
  ): void {
    callback(pool, params);
  },

  getFirstFreeElementFromPool<T extends { free: boolean }>(
    pool: Array<T>
  ): T | undefined {
    for (let i: number = 0; i < pool.length; i++) {
      if (pool[i].free) return pool[i];
    }
  },
};

// Utility function for generating a random number
const randomNumberBetween = (
  minRandomNumber: number,
  maxRandomNumber: number
): number => {
  return Math.floor(
    Math.random() * (maxRandomNumber - minRandomNumber + 1) + minRandomNumber
  );
};

const CONFIG = {
  HERO: {
    width: 100,
    height: 100,
    velocity: 0.02,
  },
  PLANET: {
    diameter: 24,
    maximum: 12,
    fallingSpeed: 0.08,
    planetTimer: 0,
    planetMinInterval: 2000,
    planetMaxInterval: 800,
  },
  fps: 60,
  fpsInterval: 1000 / 60,
  ground: 0,
  gravity: -0.001,
  impulseForce: 0.62,
  debug: false,
};

export { poolFunctions, randomNumberBetween, CONFIG };
export type { GameConfig };
