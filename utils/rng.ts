/**
 * A simple seeded random number generator.
 * Returns a function that produces numbers between 0 and 1.
 */
export const createRNG = (seed: number) => {
  let s = seed;
  return () => {
    s = Math.sin(s) * 10000;
    return s - Math.floor(s);
  };
};