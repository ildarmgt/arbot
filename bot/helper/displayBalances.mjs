import _ from 'lodash';
import diffToDays from './diffToDays';

export default function displayBalances (st, totals) {

  console.log('===============================================');
  console.log('                   BALANCES                    ');
  console.log('-----------------------------------------------');

  // display balances for each coin
  for (let key in totals) {

    if (totals[key].isCoin) {
      console.log(
        totals[key].total.toFixed(8), key, '(',
        totals[key].totalBTC ? totals[key].totalBTC.toFixed(8) : 'n/a', 'BTC,',
        totals[key].totalUSD ? totals[key].totalUSD.toFixed(2) : 'n/a', 'USD )'
      );
    }
  }

  console.log('-----------------------------------------------');

  // display totals
  console.log('Total:', totals.sumBTC.toFixed(8), 'BTC,', totals.sumUSD.toFixed(2), 'USD');

  console.log('-----------------------------------------------');

  // display changes over time
  console.log(
    'BTC change:',
    st.data.firstBTC ? _.round((totals.sumBTC / st.data.firstBTC - 1.0) * 100.0, 2).toFixed(2) + '%' : 'n/a',
    'USD change:',
    st.data.firstUSD ? _.round((totals.sumUSD / st.data.firstUSD - 1.0) * 100.0, 2).toFixed(2) + '%' : 'n/a'
  );

  console.log('Run time:', st.data.firstTime ? diffToDays(new Date().getTime() - st.data.firstTime) : 'n/a');

  console.log('===============================================');
}
