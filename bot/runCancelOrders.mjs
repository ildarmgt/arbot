import readyExchange from './readyExchange';

// cancel all active orders
async function runCancelOrders (st, eaJob) {

  try {

    // (ASYNC) cancel all active orders
    await st.lib[eaJob.exchange].cancelOrder(undefined, undefined, {Type: 'All'});

    console.log(
      st.exchanges[eaJob.exchange].id,
      ': successful cancel orders'
    );

  } catch (e) {
    console.error(st.exchanges[eaJob.exchange].id, ': failed cancel orders');
    if (!eaJob.retry) {
      eaJob.retry = true;
      await new Promise(resolve => setTimeout(resolve, eaJob.exchangeDelay));
      await runCancelOrders(st, eaJob);
    }
  }

  readyExchange(st, eaJob);

  // write down when last cancelation command ran.
  // bot actions that share exchange know when it's ready for new orders.
  st.exchanges[eaJob.exchange].lastCanceled = new Date().getTime();
}

export default runCancelOrders;
