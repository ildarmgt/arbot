import diffToDays from './diffToDays';

/**
 * print balances to console log
 */
export default async function displayBalances (st, totals) {

  console.log('jobs in queue:', st.jobs.length);
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

  console.log('Run time:', st.data.firstTime ? diffToDays(new Date().getTime() - st.data.firstTime) : 'n/a');

  console.log('-----------------------------------------------');

  if (st.data.history) {
    for (let pair in st.data.history) {
      let calc = st.data.history[pair].rawCalc;

      if (calc) {
        console.log(
          pair,
          'stats:: n:', calc.size,
          ', mean:', calc.mean,
          ', median:', calc.median,
          ', stdev:', calc.stdev,
          ', 1xstdev:', `(${calc.stdev1top}, ${calc.stdev1bottom})`,
          ', used?', (calc.stdev > 0.25)
        );
      }

    }
  }

  console.log('===============================================');
}
