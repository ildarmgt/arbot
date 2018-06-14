import readyExchange from './readyExchange';

/**
 * Get price info for a pair based on the job and store it in the state.
 */
async function runFetchTicker (st, eaJob) {

  try {
    let pair = eaJob.coin1 + '/' + eaJob.coin2;

    // (ASYNC) get price info based on exchange name & pair stored in the job
    let response = await st.lib[eaJob.exchange].fetchTicker(pair);

    // store response info in the state
    st.exchanges[eaJob.exchange][pair] = response;

    console.log(
      st.exchanges[eaJob.exchange].id,
      ': successful fetchTicker',
      st.exchanges[eaJob.exchange][pair].last,
      st.exchanges[eaJob.exchange][pair].symbol
    );

  } catch (e) {
    console.error(st.exchanges[eaJob.exchange].id, ': failed job', eaJob);
  }

  readyExchange(st, eaJob);
}

export default runFetchTicker;
