'use strict';
const printBalances = require('./printBalances'); // calc & show total balances

/**
 * loopBots is a function that loops itself as it
 * goes through all the bots and generates necessary jobs
 */
async function loopBots (st) {

  let waitfor = 300;

  st.jobs.push({ // get ref price
    name: 'fetchTicker',
    id: st.jobId++,
    exchange: 'hitbtc',
    coin1: 'XMR',
    coin2: 'BTC',
    sourceDelay: waitfor,
    timestamp: new Date().getTime()
  });

  st.jobs.push({ // get useful BTC/USD value
    name: 'fetchTicker',
    id: st.jobId++,
    exchange: 'bitstamp',
    coin1: 'BTC',
    coin2: 'USD',
    sourceDelay: waitfor,
    timestamp: new Date().getTime()
  });

  st.jobs.push({ // get balances
    name: 'fetch_balance',
    id: st.jobId++,
    exchange: 'cryptopia',
    sourceDelay: waitfor,
    sourceUSD: 'bitstamp',
    timestamp: new Date().getTime()
  });

  st.jobs.push({ // cancel previous orders
    name: 'cancelOrders',
    id: st.jobId++,
    exchange: 'cryptopia',
    sourceDelay: waitfor,
    timestamp: new Date().getTime()
  });

  st.jobs.push({ // place buy order
    name: 'createLimitBuyOrder',
    id: st.jobId++,
    exchange: 'cryptopia',
    coin1: 'XMR',
    coin2: 'BTC',
    priceSource: 'hitbtc',
    offsetPercent: -0.6,
    positionFraction: 0.9,
    sourceDelay: waitfor,
    timestamp: new Date().getTime()
  });

  st.jobs.push({ // place sell order
    name: 'createLimitSellOrder',
    id: st.jobId++,
    exchange: 'cryptopia',
    coin1: 'XMR',
    coin2: 'BTC',
    priceSource: 'hitbtc',
    offsetPercent: 0.6,
    positionFraction: 0.9,
    sourceDelay: waitfor,
    timestamp: new Date().getTime()
  });

  console.log('End of loopBot job count:', st.jobs.length);

  printBalances(st);

  await new Promise(resolve => setTimeout(resolve, 30000)); // delay
  loopBots(st);
}

export default loopBots;
