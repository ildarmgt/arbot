'use strict';
import _ from 'lodash'; // useful math libarary

import readyExchange from './readyExchange';

// place buy order
async function runSellOrder (st, eaJob) {
  let pair = eaJob.coin1 + '/' + eaJob.coin2; // pair string
  let priceData = st.exchanges[eaJob.priceSource][pair]; // get stored pair price
  let priceAvg = _.floor(0.5 * (priceData.bid + priceData.ask), 8); // use midpoint between bid and ask for avg
  let sellOrderPrice = _.floor(priceAvg * (100 + eaJob.offsetPercent) / 100.0, 8); // buy here
  let balanceCoin1 = st.exchanges[eaJob.exchange].balances[eaJob.coin1].total; // this much coin 2 avail
  let sellOrderAmountUnit1 = _.floor(balanceCoin1 * eaJob.positionFraction, 8); // sell this much (coin1 units)
  let sellOrderAmountUnit2 = _.floor(sellOrderAmountUnit1 * sellOrderPrice, 8); // sell this much (coin2 units)
  let minimumBaseTradeUnit2 = st.lib[eaJob.exchange].markets[pair].info.MinimumBaseTrade; // min trade size (coin 2 units)

  try {
    if (sellOrderAmountUnit2 > minimumBaseTradeUnit2) {
      // (ASYNC) place buy order
      await st.lib[eaJob.exchange].createLimitSellOrder(
        pair,
        sellOrderAmountUnit1,
        sellOrderPrice
      );

      // no changes to state

      console.log(
        st.lib[eaJob.exchange].id,
        ': successful sell order placed'
      );
    } else {
      console.log(st.exchanges[eaJob.exchange].id, eaJob.coin1, 'balance too low for sell order');
    }

  } catch (e) {
    console.error(st.exchanges[eaJob.exchange].id, ': failed sell order');
    if (!eaJob.retry) {
      eaJob.retry = true;
      await new Promise(resolve => setTimeout(resolve, eaJob.sourceDelay));
      await runSellOrder(st, eaJob);
    }
  }
  readyExchange(st, eaJob); // say exchange not in use anymore and update timer
}

export default runSellOrder;