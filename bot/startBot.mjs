'use strict';
import runLoadMarkets from './runLoadMarkets';
import loopBots from './loopBots';
import loopJobs from './loopJobs';

// libraries
import _ from 'lodash'; // useful math libarary
import auth from '../auth.json'; // import my personal authentication data
import ccxt from 'ccxt'; // add the exchange libraries

/**
 * startBot is a function that initiates the exchanges
 * and then initiates the loop for bots and jobs
 */
async function startBot (st) {
  // initialize the bot once

  // initialize exchanges with auth info where necessary
  // st.bots.forEach((bot) => {
  for (let bot of st.bots) {
    // (TODO) combine both into one helper function?

    // 1. reference exchange first
    if (!st.lib[bot.sourceRef]) {
      // get reference exchange handle if not added yet
      st.lib[bot.sourceRef] = new ccxt[bot.sourceRef]();
      st.exchanges[bot.sourceRef] = { id: st.lib[bot.sourceRef].id };
      console.log(st.lib[bot.sourceRef].id, 'exchange initialized');

      // set timer params
      st.exchanges[bot.sourceRef].lastUsed = new Date().getTime();
      st.exchanges[bot.sourceRef].inUse = false;

      // initialize new exchange by name
      await runLoadMarkets(st, bot.sourceRef);
    }

    // 2. trade exchange second (if exists)
    if (bot.sourceTrade && !st.lib[bot.sourceTrade]) {
      // get trade exchange handle if not added yet
      st.lib[bot.sourceTrade] = new ccxt[bot.sourceTrade]({
        apiKey: auth[bot.sourceTrade].PUBLIC_KEY,
        secret: auth[bot.sourceTrade].PRIVATE_KEY,
        enableRateLimit: false,
        rateLimit: _.round(bot.sourceTradeDelayLimit)
      });
      st.exchanges[bot.sourceTrade] = { id: st.lib[bot.sourceTrade].id };
      console.log(st.lib[bot.sourceTrade].id, 'exchange initialized');

      // set timer params
      st.exchanges[bot.sourceTrade].lastUsed = new Date().getTime();
      st.exchanges[bot.sourceTrade].inUse = false;

      // initialize new exchange by name
      await runLoadMarkets(st, bot.sourceTrade);
    }
  }

  // run the main bot loop that generates jobs
  console.log('starting bot loop');
  loopBots(st);

  // run job execution loop
  console.log('starting job running loop');
  loopJobs(st);

  // (TODO) how to create jobs - big loop doing step by step job adds
}

export default startBot;
