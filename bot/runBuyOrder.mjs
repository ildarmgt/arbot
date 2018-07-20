import readyExchange from './readyExchange';
import isBalanceReadyForOrder from './isBalanceReadyForOrder';
import calcPositions from './helper/calcPositions';

/**
 * Place buy order based on selected job
 */
export default async function runBuyOrder (st, job) {
  // let { coin1, coin2 } = eaJob;
  let pair = job.coin1 + '/' + job.coin2; // pair string

  // see if exchange recently had orders canceled
  // will wait job.maxWaitTime to see if it changes
  let readyToOrder = await isBalanceReadyForOrder(st, job);

  if (readyToOrder) {

    let positions = calcPositions(st, job);

    if (positions) {

      if (positions.enoughForBuy) {

        let buyOrderAmountUnit1 = positions.buy.size;
        let buyOrderPrice = positions.buy.price;

        try {
          // place order (ccxt lib)
          let res = await st.lib[job.exchange].createLimitBuyOrder(
            pair,
            buyOrderAmountUnit1,
            buyOrderPrice
          );

          // if response pair doesn't match goal pair, abort
          if (res.symbol !== pair) {
            console.error('ERROR: invalid pair detected traded');
            console.error('job where error detected:\n', job);
            console.error('response where error detected:\n', res);
            process.exit(1); // exit code is number inside ()
          }

          console.log(
            st.exchanges[job.exchange].id,
            ': successful buy order for',
            buyOrderAmountUnit1, job.coin1,
            `(~${positions.buy.sizeBTC} BTC)`,
            'at',
            buyOrderPrice, pair,
            `(${(positions.buyOffset * 100.0 - 100.0).toFixed(2)}%)`,
            job.useSTDEV ? '[stdev algo]' : '[simple algo]'
          );

        } catch (e) {
          console.error(st.exchanges[job.exchange].id, ': failed', pair, 'buy order');
          // console.error(e);

          // retry
          if (!job.retry) {
            job.retry = true;
            await new Promise(resolve => setTimeout(resolve, job.exchangeDelay));
            await runBuyOrder(st, job);
          }
        }

      } else {
        console.log(
          st.exchanges[job.exchange].id, ':',
          pair, ':',
          job.coin2, 'balance too low for buy order'
        );
      }
    }

  } else {
    console.log(
      st.exchanges[job.exchange].id, 'buy order timed out waiting for leader. Job:',
      job
    );
  }

  readyExchange(st, job); // say exchange not in use anymore and update timer

}
