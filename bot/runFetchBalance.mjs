import readyExchange from './readyExchange';
import calcBalances from './calcBalances';

/**
 * Get all account balances from an exchange in the job.
 */
async function runFetchBalance (st, eaJob) {

  try {

    // (ASYNC) get balances for specific exchange
    let response = await st.lib[eaJob.exchange].fetch_balance();

    // store response info in the state
    st.exchanges[eaJob.exchange].balances = response;

    console.log(
      st.exchanges[eaJob.exchange].id,
      ': successful fetchBalance'
    );

  } catch (e) {
    console.error(st.exchanges[eaJob.exchange].id, ': failed job', eaJob);
    if (!eaJob.retry) {
      eaJob.retry = true;
      await new Promise(resolve => setTimeout(resolve, eaJob.exchangeDelay));
      await runFetchBalance(st, eaJob);
    }
  }

  await calcBalances(st);

  readyExchange(st, eaJob);
}

export default runFetchBalance;
