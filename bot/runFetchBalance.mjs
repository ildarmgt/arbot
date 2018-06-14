import readyExchange from './readyExchange';

// get all account balances from an exchange of interest
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
  }

  readyExchange(st, eaJob);
}

export default runFetchBalance;
