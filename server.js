'use strict';

// libraries
const startBot = require('./bot/startBot'); // starts the bot

// important variables
let st = { // local state
  jobs: [], // store each job/action to get done
  jobId: 0, // count jobs
  bots: [], // store each trading pair into separate bots
  botId: 0, // count bots
  exchanges: {}, // store initialized exchanges
  data: {} // store performance data
};

// create bots
st.bots.push({
  describe: 'btcusd reference grab',
  id: st.botId++,
  botStepDelay: 30000, // ms to pause between bot loop executions
  coin1: 'BTC', // coin1 in coin1/coin2
  coin2: 'USD', // coin2 in coin1/coin2
  sourceRef: 'bitstamp' // read price here
});

st.bots.push({
  describe: 'XMR/BTC arbot',
  id: st.botId++,
  botStepDelay: 30000, // ms to pause between bot loop executions
  coin1: 'XMR', // coin1 in coin1/coin2
  coin2: 'BTC', // coin2 in coin1/coin2
  sourceRef: 'hitbtc', // read price here
  sourceTrade: 'cryptopia', // trade here
  sourceRefDelay: 100, // delay between API calls (ms) for reference price exchange
  sourceRefDelayLimit: 10, // min call delay between calls (ms) for reference price exchange
  sourceTradeDelay: 500, // delay between API calls (ms) for trading exchange
  sourceTradeDelayLimit: 30, // min call delay between calls (ms) for trading exchange
  offsetPercent: 0.7, // percent offset from reference price for bids and asks
  orderFraction: 0.95, // fraction of available coins to place order with
  sourceUSD: 'bitstamp'
});

// initialize the bot
startBot(st);

console.log('Reached the end of server.js file');
