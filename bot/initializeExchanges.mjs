import ccxt from 'ccxt'; // add the exchange libraries
import _ from 'lodash'; // useful math libarary

import runLoadMarkets from './runLoadMarkets';
import auth from '../auth.json'; // import my personal authentication data

export default async function initializeExchanges (st) {
  for (let bot of st.bots) {

    // 1. reference exchange first

    if (!st.lib[bot.sourceRef]) {
      console.log('Initializing', bot.sourceRef, 'b/c of bot id', bot.id);
      // get reference exchange handle if not added yet
      st.lib[bot.sourceRef] = new ccxt[bot.sourceRef]();
      st.exchanges[bot.sourceRef] = { id: st.lib[bot.sourceRef].id };

      // set timer params
      st.exchanges[bot.sourceRef].lastUsed = new Date().getTime();
      st.exchanges[bot.sourceRef].inUse = false;

      // initialize new exchange by name
      await runLoadMarkets(st, bot.sourceRef);

      console.log(st.lib[bot.sourceRef].id, 'exchange initialized');
    }

    // 2. trade exchange second (if exists)

    if (bot.sourceTrade && !st.lib[bot.sourceTrade]) {
      console.log('Initializing', bot.sourceTrade, 'b/c of bot id', bot.id);
      // get trade exchange handle if not added yet
      st.lib[bot.sourceTrade] = new ccxt[bot.sourceTrade]({
        apiKey: auth[bot.sourceTrade].PUBLIC_KEY,
        secret: auth[bot.sourceTrade].PRIVATE_KEY,
        enableRateLimit: false,
        rateLimit: _.round(bot.sourceTradeDelayLimit)
      });
      st.exchanges[bot.sourceTrade] = { id: st.lib[bot.sourceTrade].id };

      // set timer params
      st.exchanges[bot.sourceTrade].lastUsed = new Date().getTime();
      st.exchanges[bot.sourceTrade].inUse = false;

      // initialize new exchange by name
      await runLoadMarkets(st, bot.sourceTrade);

      // trade exchange is where cancels and balance calls are made
      // have to define which bot gets to do those calls for each one
      // by placing it here, the first bot gets to cancel and fetch balances
      // others just follow
      st.exchanges[bot.sourceTrade].leadsSharedEvents = true;

      console.log(st.lib[bot.sourceTrade].id, 'exchange initialized');
    }
  }
}
