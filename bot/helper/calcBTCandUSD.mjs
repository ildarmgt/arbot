import convUnits from './convUnits';

/**
 * Returns a modified totals object with
 * valueUSD and valueBTC added for each entry
 */
export default function calcBTCandUSD (st, totals) {
  // let conversionFactors = calcRefPrices(st);
  // let btcusd = conversionFactors['BTC/USD'];
  // let altbtc;

  let convFactorBTCUSD = convUnits(st, 'BTC', 'USD');

  let sumBTC = 0;
  let sumUSD = 0;

  // totals has general coins as keys and exchanges with coins as keys within them
  // depending on overall coin sum or exchange specific coin value

  for (let key in totals) {

    // if coin, add new conversions
    if (totals[key].isCoin) {
      // grab conversion factors
      // altbtc = conversionFactors[key + '/BTC'];
      let convFactorToBTC = convUnits(st, key, 'BTC');

      if (convFactorToBTC) {
        // if conversion factor available, calculate btc total value for that coin
        totals[key].totalBTC = totals[key].total * convFactorToBTC;
        sumBTC += totals[key].totalBTC;

        if (convFactorBTCUSD) {
          // if conversion factor available calculate usd total value
          totals[key].totalUSD = totals[key].totalBTC * convFactorBTCUSD;
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
        let convFactorToBTC = convUnits(st, coin, 'BTC');

        // if btc conversion factor available
        if (convFactorToBTC) {
          totals[key][coin].totalBTC = totals[key][coin].total * convFactorToBTC;
          exchangeTotalBTC += totals[key][coin].totalBTC;

          // if usd conversion factor available
          if (convFactorBTCUSD) {
            totals[key][coin].totalUSD = totals[key][coin].totalBTC * convFactorBTCUSD;
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
