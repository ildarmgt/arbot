import calcRefPrices from './calcRefPrices';

/**
 * returns conversion parameter from unit1 to unit2 if multiplied by it
 * parameters: (state, fromUnit, toUnit)
 * @param {Object} st - state object
 * @param {string} fromUnit - from this unit
 * @param {string} toUnit - to this unit
 * @returns {number}
 * e.g. (st, 'XMR', 'BTC')
 */
export default function convUnits (st, fromUnit, toUnit) {
  // get obvious same unit case over with
  if (fromUnit === toUnit) {
    return 1;
  }

  // grab all known conversion factors
  let convFactors = calcRefPrices(st);

  if (convFactors) {
    // look for exact match and convert
    for (let pair in convFactors) {
      let [coin1, coin2] = pair.split('/');

      if (coin1 === fromUnit && coin2 === toUnit) {
        return convFactors[pair];
      }

      if (coin1 === toUnit && coin2 === fromUnit) {
        return 1.0 / convFactors[pair];
      }
    }
  }
  // (TODO) change to find inexact matches through links
  // easiest to go through suggested links like BTC or USDT at first

  // return nothing if nothing found
  return undefined;
}
