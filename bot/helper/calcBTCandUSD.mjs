// import _ from 'lodash';

import calcRefPrices from './calcRefPrices';

/**
 * Returns a modified totals object with
 * valueUSD and valueBTC added for each entry
 */
export default function calcBTCandUSD (st, totals) {
  let conversionFactors = calcRefPrices(st);
  let btcusd = conversionFactors['BTC/USD'];
  let altbtc;

  let sumBTC = 0;
  let sumUSD = 0;

  for (let key in totals) {

    // if coin, add new conversions
    if (totals[key].isCoin) {
      // grab conversion factors
      altbtc = conversionFactors[key + '/BTC'];

      if (altbtc) {
        // if conversion factor available, calculate btc total value
        totals[key].totalBTC = totals[key].total * altbtc;
        sumBTC += totals[key].totalBTC;

        if (btcusd) {
          // if conversion factor available calculate usd total value
          totals[key].totalUSD = totals[key].totalBTC * btcusd;
          sumUSD += totals[key].totalUSD;
        }
      }
    }

    // if exchange, go through all coins in each one to total
    if (totals[key].isExchange) {
      let exchangeTotalBTC = 0;
      let exchangeTotalUSD = 0;

      for (let coin in totals[key]) {
        // grab conversion factors
        let altbtc = conversionFactors[coin + '/BTC'];

        // if btc conversion factor available
        if (altbtc) {
          totals[key][coin].totalBTC = totals[key][coin].total * altbtc;
          exchangeTotalBTC += totals[key][coin].totalBTC;

          // if usd conversion factor available
          if (btcusd) {
            totals[key][coin].totalUSD = totals[key][coin].totalBTC * btcusd;
            exchangeTotalUSD += totals[key][coin].totalUSD;
          }
        }
      }

      // when done with exchange, add totals for exchange
      totals[key].sumBTC = exchangeTotalBTC;
      totals[key].sumUSD = exchangeTotalUSD;

    }
  }

  // plug in overall totals
  totals.sumBTC = sumBTC;
  totals.sumUSD = sumUSD;

  // (TODO) check if sum's are ready
  return totals;
}
