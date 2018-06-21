import readyExchange from './readyExchange';
import logAllTrades from './helper/logAllTrades';

/**
 * Get all recent trades from an exchange for specific pair
 */
export default async function runFetchPairTrades (st, job) {
  try {
    let pair = job.coin1 + '/' + job.coin2;
    let lastTime = st.exchanges[job.exchange].fetchedAllTradesTime[pair] || new Date().getTime();
    st.exchanges[job.exchange].fetchedAllTradesTime[pair] = lastTime;
    let response = await st.lib[job.exchange].fetchTrades(pair, lastTime);

    if (response.length) {

      // console.log(job.exchange, ':', response.length, 'recent matched trades');

      // log all new trades
      logAllTrades(st, job, response);

    } else {
      console.log(job.exchange, ': no recent any', pair, 'trades.');
    }

  } catch (e) {
    console.log('fetch all trades failed', e);
  }

  readyExchange(st, job);
}
