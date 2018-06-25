import readyExchange from './readyExchange';
import logTradesCSV from './helper/logTradesCSV';
import analyzeData from './helper/analyzeData';

/**
 * Get all recent trades from an exchange for specific pair
 */
export default async function runFetchPairTrades (st, job) {
  try {
    let pair = job.coin1 + '/' + job.coin2;

    // grab last time we fetched trades for this pair
    // if not available, set it as current time

    // (TODO: I'll try subtracting look back peiod here for now,
    // as it will use only current reference price, stdev should be much larger
    // but that's safe, and over time it should narrow down to expected ref data

    st.exchanges[job.exchange].fetchedAllTradesTime[pair] =
      st.exchanges[job.exchange].fetchedAllTradesTime[pair] ||
        new Date().getTime() - st.data.lookBackTime / 4;

    let lastTime = st.exchanges[job.exchange].fetchedAllTradesTime[pair];

    // send request
    let response = await st.lib[job.exchange].fetchTrades(pair, lastTime);

    if (response.length) {

      // update last time updated to now if matches found
      // if not, there might be delay before it comes back so don't update
      st.exchanges[job.exchange].fetchedAllTradesTime[pair] = new Date().getTime();

      // console.log(job.exchange, ':', response.length, 'recent matched trades');

      // log all new trades
      logTradesCSV(st, job, response, false);

      // store and analyze new data
      analyzeData(st, job, response);

    } else {
      console.log(job.exchange, ': no recent any', pair, 'trades.');
    }

  } catch (e) {
    console.log('fetch all trades failed', e);
  }

  readyExchange(st, job);
}
