import logPerformance from './helper/logPerformance';

/**
 * A function that continuously logs progress
 */
export default async function loopPerformance (st) {

  // delay for some time (e.g. hour)
  await new Promise(resolve => setTimeout(resolve, 1000 * 60));

  // log the performance
  logPerformance(st);

  // repeat this loop
  loopPerformance(st);
}
