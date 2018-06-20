import diffToDays from './helper/diffToDays';
import readyExchange from './readyExchange';

/**
 * Get my recent trades from an exchange
 */
export default async function runFetchMyTrades (st, job) {
  try {

    let response = await st.lib[job.exchange].fetchMyTrades(undefined, st.data.firstTime);

    if (response) {
      response.forEach((trade, n) => {
        console.log(
          job.exchange,
          n,
          diffToDays(new Date().getTime() - trade.timestamp),
          trade.price,
          trade.symbol,
          'for', trade.amount, job.coin2
        );
      });
    }

  } catch (e) {
    console.log('fetch trades failed', e);
  }

  readyExchange(st, job);
}
