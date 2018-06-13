'use strict';
import _ from 'lodash'; // useful math libarary

import readyExchange from './readyExchange';

// place buy order
async function runSellOrder (st, eaJob) {
  let pair = eaJob.coin1 + '/' + eaJob.coin2;
  let priceData = st.exchanges[eaJob.priceSource][pair];
  let priceAvg = _.floor(0.5 * (priceData.bid + priceData.ask), 8);
  let sellOrderPrice = _.floor(priceAvg * (100 + eaJob.offsetPercent) / 100.0, 8);
  let balanceCoin1 = st.exchanges[eaJob.exchange].balances[eaJob.coin1].total;
  let sellOrderAmountUnit1 = _.floor(balanceCoin1 * eaJob.positionFraction, 8);
  let sellOrderAmountUnit2 = _.floor(sellOrderAmountUnit1 * sellOrderPrice, 8);
  let minimumBaseTradeUnit2 = st.exchanges[eaJob.exchange].markets[pair].info.MinimumBaseTrade;

  try {
    if (sellOrderAmountUnit2 > minimumBaseTradeUnit2) {
      // (ASYNC) place buy order
      await st.exchanges[eaJob.exchange].createLimitSellOrder(
        pair,
        sellOrderAmountUnit1,
        sellOrderPrice
      );

      // no changes to state

      console.log(
        st.exchanges[eaJob.exchange].id,
        ': successful sell order placed'
      );
    } else {
      console.log(st.exchanges[eaJob.exchange].id, eaJob.coin1, 'balance too low for sell order');
    }

    readyExchange(st, eaJob); // say exchange not in use anymore and update timer

  } catch (e) {
    console.error(st.exchanges[eaJob.exchange].id, ': failed sell order');
    if (!eaJob.retry) {
      eaJob.retry = true;
      await new Promise(resolve => setTimeout(resolve, eaJob.sourceDelay));
      await runSellOrder(st, eaJob);
    }
  }
}

export default runSellOrder;
