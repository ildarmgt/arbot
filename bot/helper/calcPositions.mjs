import _ from 'lodash'; // useful math libarary

import countPairs from './countPairs';
import countCoinUse from './countCoinUse';
import convUnits from './convUnits';

export default function calcPositions (st, job) {
  try {
    let {coin1, coin2, exchange, offsetPercent, priceSource, positionFraction, useSTDEV, offsetSTDEV, stdev, mean} = job;
    let pair = coin1 + '/' + coin2;
    let buyOffset, sellOffset;
    let buyOrderPrice, sellOrderPrice;

    // min trade size (coin 2 units)
    let minimumBaseTrade_Unit2 = (st.lib[exchange].markets[pair].info.MinimumBaseTrade || 0.005) * 2;

    // get the price we're using for reference
    let priceData = st.exchanges[priceSource][pair];
    let priceRef = _.floor(0.5 * (priceData.bid + priceData.ask), 8);

    // calculate the trading price that's offset for our immidiate potential profit

    if (useSTDEV) {
      sellOffset = (100 + (mean + offsetSTDEV * stdev)) / 100.0;
      buyOffset = (100 + (mean - offsetSTDEV * stdev)) / 100.0;
      buyOrderPrice = _.floor(priceRef * buyOffset, 8); // buy here
      sellOrderPrice = _.floor(priceRef * sellOffset, 8); // sell here
    } else {
      sellOffset = (100 + offsetPercent) / 100.0;
      buyOffset = (100 - offsetPercent) / 100.0;
      buyOrderPrice = _.floor(priceRef * buyOffset, 8); // buy here
      sellOrderPrice = _.floor(priceRef * sellOffset, 8); // sell here
    }

    // grab total balance equivalent in estimated BTC
    let exchangeTotal_UnitBTC = st.data.totals[exchange].sumBTC;

    // grab total number of traded pairs
    let numberPairs = countPairs(st, exchange);

    // grab the number of times each coin is used
    let numberCoin1 = countCoinUse(st, coin1);
    let numberCoin2 = countCoinUse(st, coin2);

    // grab balance of both coins in the pair
    let totalCoin1_Unit1 = st.exchanges[exchange].balances[coin1].free;
    let totalCoin2_Unit2 = st.exchanges[exchange].balances[coin2].free;

    // establish some maximum order sizes so a single pair or coin doesn't accumulate too much of total balance

    // each coin order should at most be evenly split fraction of that coins available balance
    let maxPerCoin1_Unit1 = totalCoin1_Unit1 / numberCoin1;
    let maxPerCoin2_Unit2 = totalCoin2_Unit2 / numberCoin2;

    // each pair's dedicated max balance for orders should at most be evenly split fraction of total balance
    let maxPerPair_UnitBTC = exchangeTotal_UnitBTC / numberPairs;
    // subtract the dedicated balance of the other coin in the pair from total a pair should have to get max position size
    // if too much of the other coin, no order should be placed at all to prevent single coin gaining all available balance value
    let buyLeftOver_Unit1 = _.max([maxPerPair_UnitBTC * convUnits(st, 'BTC', coin1) - maxPerCoin1_Unit1, maxPerCoin2_Unit2 * convUnits(st, coin2, coin1) - maxPerCoin1_Unit1, 0]);
    let sellLeftOver_Unit2 = _.max([maxPerPair_UnitBTC * convUnits(st, 'BTC', coin2) - maxPerCoin2_Unit2, maxPerCoin1_Unit1 * convUnits(st, coin1, coin2) - maxPerCoin2_Unit2, 0]);

    // set order amount to total available or known limits
    let buyOrderAmount_Unit1 = _.min([
      totalCoin2_Unit2 * convUnits(st, coin2, coin1) / buyOffset,
      maxPerCoin2_Unit2 * convUnits(st, coin2, coin1) / buyOffset,
      buyLeftOver_Unit1
    ]);

    let sellOrderAmount_Unit1 = _.min([
      totalCoin1_Unit1,
      maxPerCoin1_Unit1,
      sellLeftOver_Unit2 * convUnits(st, coin2, coin1) / sellOffset
    ]);

    // let user settings size down the defautl position with a fraction
    buyOrderAmount_Unit1 *= positionFraction;
    sellOrderAmount_Unit1 *= positionFraction;

    // check if above minimum order size
    let enoughForBuy =
      buyOrderAmount_Unit1 * convUnits(st, coin1, coin2) > minimumBaseTrade_Unit2 &&
      buyOrderAmount_Unit1 > 0;

    let enoughForSell =
      sellOrderAmount_Unit1 * convUnits(st, coin1, coin2) > minimumBaseTrade_Unit2 &&
      sellOrderAmount_Unit1 > 0;

    // return the important data
    let calculatedPositions = {
      buyOffset: buyOffset,
      sellOffset: sellOffset,
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
    // console.log(JSON.stringify(calculatedPositions));

    return calculatedPositions;

  } catch (e) {
    console.log('Unable to size position until more information available:');
    console.error(e);
    return undefined;
  }
}
