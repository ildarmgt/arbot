import _ from 'lodash'; // useful math libarary

import countPairs from './helper/countPairs';
import countCoinUse from './helper/countCoinUse';
import convUnits from './helper/convUnits';

export default function calcPositions (st, job) {
  try {
    let {coin1, coin2, exchange, offsetPercent, priceSource, positionFraction} = job;
    let pair = coin1 + '/' + coin2;
    let sellOffset = (100 + offsetPercent) / 100.0;
    let buyOffset = (100 - offsetPercent) / 100.0;

    // min trade size (coin 2 units)
    let minimumBaseTrade_Unit2 = st.lib[exchange].markets[pair].info.MinimumBaseTrade || 0.005;

    // get the price we're using for reference
    let priceData = st.exchanges[priceSource][pair];
    let priceRef = _.floor(0.5 * (priceData.bid + priceData.ask), 8);

    // calculate the trading price that's offset for our immidiate potential profit
    let buyOrderPrice = _.floor(priceRef * buyOffset, 8); // buy here
    let sellOrderPrice = _.floor(priceRef * sellOffset, 8); // buy here

    // grab total balance equivalent in estimated BTC
    let exchangeTotal_UnitBTC = st.data.totals[exchange].sumBTC;

    // grab total number of traded pairs
    let numberPairs = countPairs(st, exchange);

    // grab the number of times each coin is used
    let numberCoin1 = countCoinUse(st, coin1);
    let numberCoin2 = countCoinUse(st, coin2);

    // grab balance of both coins in the pair
    let totalCoin1_Unit1 = st.exchanges[exchange].balances[coin1].total;
    let totalCoin2_Unit2 = st.exchanges[exchange].balances[coin2].total;

    // establish some maximum order sizes so a single pair or coin doesn't accumulate too much of total balance

    // each pair's dedicated balance for orders should at most be evenly split fraction of total balance
    // for simplicity each order should then be limited to half of pairs maximum
    // let maxPerPair_UnitBTC = exchangeTotal_UnitBTC / numberPairs;
    // let maxPerOrder_UnitBTC = maxPerPair_UnitBTC / 2;

    // each coin order should at most be evenly split fraction of that coins available balance
    let maxPerCoin1_Unit1 = totalCoin1_Unit1 / numberCoin1;
    let maxPerCoin2_Unit2 = totalCoin2_Unit2 / numberCoin2;

    // set order amount to total available or known limits
    let buyOrderAmount_Unit1 = _.min([
      totalCoin2_Unit2 * convUnits(st, coin2, coin1) / buyOffset,
      maxPerCoin2_Unit2 * convUnits(st, coin2, coin1) / buyOffset
      // maxPerOrder_UnitBTC * convUnits(st, 'BTC', coin1) / buyOffset
    ]);

    let sellOrderAmount_Unit1 = _.min([
      totalCoin1_Unit1,
      maxPerCoin1_Unit1
      // maxPerOrder_UnitBTC * convUnits(st, 'BTC', coin1) / sellOffset
    ]);

    // let user settings size down the defautl position with a fraction
    buyOrderAmount_Unit1 *= positionFraction;
    sellOrderAmount_Unit1 *= positionFraction;

    // check if above minimum order size
    let enoughForBuy =
      buyOrderAmount_Unit1 * convUnits(st, coin1, coin2) > minimumBaseTrade_Unit2;

    let enoughForSell =
      sellOrderAmount_Unit1 * convUnits(st, coin1, coin2) > minimumBaseTrade_Unit2;

    // return the important data
    let calculatedPositions = {
      enoughForBuy: enoughForBuy,
      enoughForSell: enoughForSell,
      buy: {
        price: buyOrderPrice,
        size: _.floor(buyOrderAmount_Unit1, 8),
        sizeBTC: _.floor(buyOrderAmount_Unit1 * convUnits(st, coin1, 'BTC'), 8)
      },
      sell: {
        price: sellOrderPrice,
        size: _.floor(sellOrderAmount_Unit1, 8),
        sizeBTC: _.floor(sellOrderAmount_Unit1 * convUnits(st, coin1, 'BTC'), 8)
      }
    };
    // console.log(exchange, pair, 'proposed positions:');
    // console.log(calculatedPositions);
    return calculatedPositions;

  } catch (e) {
    console.log('Unable to size position until more information available:');
    console.error(e);
    return undefined;
  }
}
