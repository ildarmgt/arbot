import startLoops from './bot/startLoops';

// important variables
let st = { // local state
  jobs: [], // store each job/action to get done
  jobId: 0, // count jobs
  bots: [], // store each trading pair into separate bots
  botId: 0, // count bots
  lib: {}, // store initialized exchange libararies
  exchanges: {}, // store data from exchanges
  data: {} // store performance data
};

// create initial bots
st.bots.push({
  type: 'info',
  id: st.botId++,
  botStepDelay: 30000, // ms to pause between bot loop executions
  coin1: 'BTC', // coin1 in coin1/coin2
  coin2: 'USD', // coin2 in coin1/coin2
  sourceRef: 'bitstamp', // read price here
  sourceRefDelay: 500 // delay between API calls (ms) for reference price exchange
});

st.bots.push({
  type: 'arbot',
  id: st.botId++,
  botStepDelay: 30000, // ms to pause between bot loop executions
  coin1: 'XMR', // coin1 in coin1/coin2
  coin2: 'BTC', // coin2 in coin1/coin2
  sourceRef: 'hitbtc', // read price here
  sourceRefDelay: 500, // delay between API calls (ms) for reference price exchange
  sourceTrade: 'cryptopia', // trade here
  sourceTradeDelay: 300, // delay between API calls (ms) for trading exchange
  offsetPercent: 0.6, // percent offset from reference price for bids and asks
  positionFraction: 0.1, // fraction of available coins to place order with
  leadsSharedEvents: true // if this bot fetches/cancels for all on same exchange
});

st.bots.push({
  type: 'arbot',
  id: st.botId++,
  botStepDelay: 30000, // ms to pause between bot loop executions
  coin1: 'LTC', // coin1 in coin1/coin2
  coin2: 'BTC', // coin2 in coin1/coin2
  sourceRef: 'gdax', // read price here
  sourceRefDelay: 500, // delay between API calls (ms) for reference price exchange
  sourceTrade: 'cryptopia', // trade here
  sourceTradeDelay: 300, // delay between API calls (ms) for trading exchange
  offsetPercent: 0.6, // percent offset from reference price for bids and asks
  positionFraction: 0.47, // fraction of available coins to place order with
  leadsSharedEvents: false // if this bot fetches/cancels for all on same exchange
});

// initialize the bot
startLoops(st);

console.log('Reached the end of server.js file');
