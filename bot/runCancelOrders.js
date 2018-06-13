'use strict';
const readyExchange = require('readyExchange');

// cancel all active orders
async function runCancelOrders (st, eaJob) {

  try {

    // (ASYNC) cancel all active orders
    await st.exchanges[eaJob.exchange].cancelOrder(undefined, undefined, {Type: 'All'});

    // no changes to state

    console.log(
      st.exchanges[eaJob.exchange].id,
      ': successful cancel orders'
    );

  } catch (e) {
    console.error(st.exchanges[eaJob.exchange].id, ': failed cancel orders');
    if (!eaJob.retry) {
      eaJob.retry = true;
      await new Promise(resolve => setTimeout(resolve, eaJob.sourceDelay));
      await runCancelOrders(st, eaJob);
    }
  }
  readyExchange(st, eaJob);
}

export default runCancelOrders;
