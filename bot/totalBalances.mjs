import _ from 'lodash';
import diffToDays from './helper/diffToDays';

// print balances in original, BTC, and USD
export default async function totalBalances (st) {
  // delay
  await new Promise(resolve => setTimeout(resolve, 15000));

  let holdings = {};
  let totalBTC = 0;
  let totalUSD = 0;

  // temp solution, later to be gotten from reference exchanges in all the bots
  let referenceExchanges = {
    'XMR/BTC': 'hitbtc',
    'BTC/USD': 'bitstamp'
  };

  console.log('===============================================');
  console.log('                   BALANCES                    ');
  console.log('-----------------------------------------------');

  // collect non-zero balances across all accounts
  for (let exchangeKey in st.exchanges) {
    for (let coinKey in st.exchanges[exchangeKey].balances) {
      let balance = st.exchanges[exchangeKey].balances[coinKey].total;
      if (balance > 0) {
        holdings[coinKey] = { value: balance };
      }
    }
  }

  // convert all balances to BTC and USD if possible
  for (let coinKey in holdings) {
    // get conversion factor to BTC
    let conversionFactorToBTC = (coinKey === 'BTC')
      ? 1
      : st.exchanges[referenceExchanges[coinKey + '/' + 'BTC']][coinKey + '/' + 'BTC'].last;

    // calculate BTC value of all coins
    if (conversionFactorToBTC) {
      let btcValue = _.floor(holdings[coinKey].value * conversionFactorToBTC, 8);
      holdings[coinKey].valueInBTC = btcValue;
      totalBTC += btcValue || 0;
    }

    // get conversion factor BTC to USD
    let conversionFactorToUSD = st.exchanges[referenceExchanges['BTC/USD']]['BTC/USD'].last;
    // calculate USD value of all coins
    if (conversionFactorToUSD) {
      let usdValue = _.floor(holdings[coinKey].valueInBTC * conversionFactorToUSD, 8);
      holdings[coinKey].valueInUSD = usdValue;
      totalUSD += usdValue || 0;
    }

    console.log(
      holdings[coinKey].value.toFixed(8), coinKey, '(',
      holdings[coinKey].valueInBTC.toFixed(8), 'BTC,',
      holdings[coinKey].valueInUSD.toFixed(2), 'USD )'
    );
  }

  // record first balances
  // if first data isn't recorded yet, record it
  if (!(st.data.firstBTC && st.data.firstUSD)) { // if even one of initial records don't exist, record this pass as initial
    st.data.firstBTC = _.floor(totalBTC, 8);
    st.data.firstUSD = _.floor(totalUSD, 2);
    st.data.firstTime = new Date().getTime();
  }

  console.log('-----------------------------------------------');
  console.log('Total:', totalBTC.toFixed(8), 'BTC,', totalUSD.toFixed(2), 'USD');
  console.log('-----------------------------------------------');
  console.log(
    'BTC change:',
    st.data.firstBTC ? _.round((totalBTC / st.data.firstBTC - 1.0) * 100.0, 2).toFixed(2) + '%' : 'N/A',
    'USD change:',
    st.data.firstUSD ? _.round((totalUSD / st.data.firstUSD - 1.0) * 100.0, 2).toFixed(2) + '%' : 'N/A'
  );
  console.log('Run time:', st.data.firstTime ? diffToDays(new Date().getTime() - st.data.firstTime) : 'N/A');
  console.log('===============================================');

  totalBalances(st);
}
