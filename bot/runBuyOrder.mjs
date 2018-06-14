import _ from 'lodash'; // useful math libarary

import readyExchange from './readyExchange';
import isBalanceReadyForOrder from './isBalanceReadyForOrder';

// place buy order
async function runBuyOrder (st, eaJob) {
  let pair = eaJob.coin1 + '/' + eaJob.coin2; // pair string

  // see if exchange recently had orders canceled
  // will wait job.maxWaitTime to see if it changes
  let readyToOrder = await isBalanceReadyForOrder(st, eaJob);

  if (readyToOrder) {

    let priceData = st.exchanges[eaJob.priceSource][pair]; // get stored pair price
    let priceAvg = _.floor(0.5 * (priceData.bid + priceData.ask), 8); // use midpoint between bid and ask for avg
    let buyOrderPrice = _.floor(priceAvg * (100 + eaJob.offsetPercent) / 100.0, 8); // buy here
    let balanceCoin2 = st.exchanges[eaJob.exchange].balances[eaJob.coin2].total; // this much coin 2 avail
    let buyOrderAmountUnit2 = _.floor(balanceCoin2 * eaJob.positionFraction, 8); // buy this much (coin2 units)
    let buyOrderAmountUnit1 = _.floor(buyOrderAmountUnit2 / buyOrderPrice, 8); // buy this much (coin1 units)
    let minimumBaseTradeUnit2 =
      st.lib[eaJob.exchange].markets[pair].info.MinimumBaseTrade || 0.005; // min trade size (coin 2 units)

    try {
      if (buyOrderAmountUnit2 > minimumBaseTradeUnit2) {
        // (ASYNC) place buy order
        await st.lib[eaJob.exchange].createLimitBuyOrder(
          pair,
          buyOrderAmountUnit1,
          buyOrderPrice
        );

        // no changes to state

        console.log(
          st.exchanges[eaJob.exchange].id,
          ': successful buy order for',
          buyOrderAmountUnit1, eaJob.coin1,
          'at',
          buyOrderPrice, pair,
          `(${eaJob.offsetPercent > 0 ? '+' : ''}${eaJob.offsetPercent}%)`
        );
      } else {
        console.log(st.exchanges[eaJob.exchange].id, ':', eaJob.coin2, 'balance too low for buy order');
      }

    } catch (e) {
      console.error(st.exchanges[eaJob.exchange].id, ': failed', pair, 'buy order');
      if (!eaJob.retry) {
        eaJob.retry = true;
        await new Promise(resolve => setTimeout(resolve, eaJob.exchangeDelay));
        await runBuyOrder(st, eaJob); // retry
      }
    }

  } else {
    console.log(
      st.exchanges[eaJob.exchange].id, 'was not ready for order. Job:',
      eaJob
    );
  }

  readyExchange(st, eaJob); // say exchange not in use anymore and update timer

}

export default runBuyOrder;
