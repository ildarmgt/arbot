import displayBalances from './displayBalances';
import calcBTCandUSD from './helper/calcBTCandUSD';

/**
 * Calculates and print balances in original, BTC, and USD units.
 * Stores them to state for use by other functions.
 */
export default async function calcBalances (st) {
  // need to know
  // total balance for each coin
  // total balance on an exchange
  // total balance on an exchange for every single coin

  // start with a delay
  await new Promise(resolve => setTimeout(resolve, 30000));

  // calculate sums
  let totals = {};
  for (let exchangeName in st.exchanges) {
    for (let coinName in st.exchanges[exchangeName].balances) {
      let balance = st.exchanges[exchangeName].balances[coinName].total;
      if (balance > 0) {

        // sum up overall for each coin
        // coins can match between exchanges so have to add them up
        if (totals[coinName]) {
          totals[coinName].total += balance;
        } else {
          totals[coinName] = {
            total: balance,
            isCoin: true
          };
        }

        // sum up for each exchange for each coin
        if (totals[exchangeName]) {
          totals[exchangeName][coinName] = { total: balance };
        } else {
          totals[exchangeName] = { isExchange: true };
          totals[exchangeName][coinName] = { total: balance };
        }
      }
    }
  }

  // calculate BTC and USD evaluations for each
  totals = calcBTCandUSD(st, totals);
  st.data.totals = totals;

  console.log('jobs in queue:', st.jobs.length);

  // display balances
  displayBalances(st, totals);

  calcBalances(st);
}
