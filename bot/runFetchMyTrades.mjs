import readyExchange from './readyExchange';
import logTradesCSV from './helper/logTradesCSV';

/**
 * Get my recent trades from an exchange
 */
export default async function runFetchMyTrades (st, job) {
  try {
    let lastTime = st.exchanges[job.exchange].fetchedMyTradesTime || new Date().getTime();
    st.exchanges[job.exchange].fetchedMyTradesTime = lastTime;
    let response = await st.lib[job.exchange].fetchMyTrades(undefined, lastTime);

    if (response.length) {

      console.log(job.exchange, ':', response.length, 'recent matched trades');

      // log all new trades
      logTradesCSV(st, job, response, true);

    } else {
      console.log(job.exchange, ': no recent matched trades.');
    }

  } catch (e) {
    console.log('fetch trades failed');
  }

  readyExchange(st, job);
}
