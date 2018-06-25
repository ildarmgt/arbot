/**
 * These bots are loaded first
 */
export default function initialBots (st) {

  st.bots.push({
    type: 'info',
    id: st.botId++,
    botStepDelay: 30000, // ms to pause between bot loop executions
    coin1: 'BTC', // coin1 in coin1/coin2
    coin2: 'USD', // coin2 in coin1/coin2
    sourceRef: 'bitstamp', // read price here
    sourceRefDelay: 1000 // delay between API calls (ms) for reference price exchange
  });

  st.bots.push({
    type: 'arbot',
    id: st.botId++,
    botStepDelay: 30000, // ms to pause between bot loop executions
    coin1: 'XMR', // coin1 in coin1/coin2
    coin2: 'BTC', // coin2 in coin1/coin2
    sourceRef: 'hitbtc', // read price here
    sourceRefDelay: 1000, // delay between API calls (ms) for reference price exchange
    sourceTrade: 'cryptopia', // trade here
    sourceTradeDelay: 300, // delay between API calls (ms) for trading exchange
    offsetPercent: [0.45, 0.65], // % offset from ref price for bids and asks (if no stdev used)
    positionFraction: [0.50, 0.49], // fraction of available coins to place order with
    minSTDEV: 0.25, // min standard deviation for use (has to do with fees per trade & sample quality)
    offsetSTDEV: [1, 2], // if stdev is used, what multipliers to use up and down
    leadsSharedEvents: true // if this bot fetches/cancels for all on same exchange
  });

  st.bots.push({
    type: 'arbot',
    id: st.botId++,
    botStepDelay: 30000, // ms to pause between bot loop executions
    coin1: 'LTC', // coin1 in coin1/coin2
    coin2: 'BTC', // coin2 in coin1/coin2
    sourceRef: 'gdax', // read price here
    sourceRefDelay: 1000, // delay between API calls (ms) for reference price exchange
    sourceTrade: 'cryptopia', // trade here
    sourceTradeDelay: 300, // delay between API calls (ms) for trading exchange
    offsetPercent: [0.45, 0.55], // percent offset from reference price for bids and asks
    positionFraction: [0.50, 0.49], // fraction of available coins to place order with
    minSTDEV: 0.25, // min standard deviation for use (has to do with fees per trade & sample quality)
    offsetSTDEV: [1, 2], // if stdev is used, what multipliers to use up and down
    leadsSharedEvents: false // if this bot fetches/cancels for all on same exchange
  });

}
