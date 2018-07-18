import readyExchange from './readyExchange';
import isBalanceReadyForOrder from './isBalanceReadyForOrder';
import calcPositions from './helper/calcPositions';

/**
 * Place sell order based on selected job
 */
export default async function runSellOrder (st, job) {
  // let { coin1, coin2 } = eaJob;
  let pair = job.coin1 + '/' + job.coin2; // pair string

  // see if exchange recently had orders canceled
  // will wait job.maxWaitTime to see if it changes
  let readyToOrder = await isBalanceReadyForOrder(st, job);

  if (readyToOrder) {

    let positions = calcPositions(st, job);

    if (positions) {

      if (positions.enoughForSell) {

        let sellOrderAmountUnit1 = positions.sell.size;
        let sellOrderPrice = positions.sell.price;

        try {
          let res = await st.lib[job.exchange].createLimitSellOrder(
            pair,
            sellOrderAmountUnit1,
            sellOrderPrice
          );

          // if response pair doesn't match goal pair, abort
          if (res.symbol !== pair) {
            console.error('ERROR: invalid pair detected traded');
            console.error('job where error detected:\n', job);
            process.exit(1); // exit code is number inside ()
          }

          console.log(
            st.exchanges[job.exchange].id,
            ': successful sell order for',
            sellOrderAmountUnit1, job.coin1,
            `(~${positions.sell.sizeBTC} BTC)`,
            'at',
            sellOrderPrice, pair,
            `(${(positions.sellOffset * 100.0 - 100.0).toFixed(2)}%)`,
            job.useSTDEV ? '[stdev algo]' : '[simple algo]'
          );

        } catch (e) {
          console.error(st.exchanges[job.exchange].id, ': failed', pair, 'sell order');
          // console.log(e);

          // retry
          if (!job.retry) {
            job.retry = true;
            await new Promise(resolve => setTimeout(resolve, job.exchangeDelay));
            await runSellOrder(st, job);
          }
        }

      } else {
        console.log(
          st.exchanges[job.exchange].id, ':',
          pair, ':',
          job.coin1, 'balance too low for sell order'
        );
      }
    }

  } else {
    console.log(
      st.exchanges[job.exchange].id, 'sell order timed out waiting for leader. Job:',
      job
    );
  }

  readyExchange(st, job); // say exchange not in use anymore and update timer

}
