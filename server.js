'use strict';

// initial user defined parameters
let st = {}; // local state
st.jobs = []; // store each job/action to get done
st.bots = []; // store each trading pair into separate bots
st.exchanges = {}; // store initialized exchanges
st.bots.push({
  botStepMilliseconds: 30000, // ms to pause between bot loop executions
  coin1: 'XMR', // coin1 in coin1/coin2
  coin2: 'BTC', // coin2 in coin1/coin2
  sourceRef: 'hitbtc', // read price here
  sourceTrade: 'cryptopia', // trade here
  sourceTradeDelay: 500, // delay between API calls (ms)
  sourceTradeDelayLimit: 200, // min call delay between calls (ms)
  offsetPercent: 1, // percent offset from reference price for bids and asks
  orderFraction: 0.95 // fraction of available coins to place order with
});

// libraries
const _ = require('lodash'); // useful math libarary
const auth = require('./auth.json'); // import my personal authentication data
const ccxt = require('ccxt'); // add the exchange libraries

// initialize the bot
startBot();

console.log('Reached the end of server.js file');

// ===================== END =========================

// --- async functions ------

async function startBot () {
  // initialize the bot once

  // initialize exchanges with auth info where necessary
  st.bots.forEach((bot, i) => {

    if (!st.exchanges[bot.sourceRef]) {
      // get reference exchange handle if not added yet
      st.exchanges[bot.sourceRef] = new ccxt[bot.sourceRef]();

      // initialize new exchange by name
      loadMarkets(bot.sourceRef);
    }

    if (!st.exchanges[bot.sourceTrade]) {
      // get trade exchange handle if not added yet
      st.exchanges[bot.sourceTrade] = new ccxt[bot.sourceTrade]({
        apiKey: auth[bot.sourceTrade].PUBLIC_KEY,
        secret: auth[bot.sourceTrade].PRIVATE_KEY,
        enableRateLimit: true,
        rateLimit: _.round(st.sourceTradeDelayLimit)
      });

      // initialize new exchange by name
      runLoadMarkets(bot.sourceTrade);
    }
  });

  // run job executioner loop
  runJobs();

  // run the main bot loop
  loopBot();

  // (TODO) how to create jobs - big loop doing step by step job adds
}

// required initialization of an exchange
async function runLoadMarkets (exchangeName) {
  try {
    await st.exchanges[exchangeName].loadMarkets(); // load all the pairs info from API
  } catch (e) { console.error('failed loadMarkets() for ', exchangeName, e); }
}

async function runFetchTicker (eaJob, jobIndex) {
  // remove job from job list
  st.jobs.splice(jobIndex, 1);

  // (DELAY) get price info based on exchange name & pair stored in the job
  let fetchedTicker = await st.exchanges[eaJob.exchange].fetchTicker(eaJob.pair);

  // store price info in the state
  if (!st.exchanges[eaJob.exchange]) st.exchanges[eaJob.exchange] = {};
  st.exchanges[eaJob.exchange][eaJob.coin1 + '-' + eaJob.coin2] = fetchedTicker;
}

async function runJobs () {
  st.jobs.forEach((eaJob, jobIndex) => {
    if (eaJob.name === 'fetchTicker') runFetchTicker(eaJob, jobIndex);
  });
}

async function loopBot () {

  // loopBot();
}

async function loopBot2 () {
  // repeat this bot logic on a loop

  st.pair = st.coin1 + '/' + st.coin2;
  st.minAmountLimitUnit2 = st.exchangeTrade.markets[st.pair].info.MinimumBaseTrade;

  // get pair price info
  try {
    st.priceInfo = await st.exchangeRef.fetchTicker(st.pair);
    st.priceAvg = _.floor(0.5 * st.priceInfo.bid + 0.5 * st.priceInfo.ask, 8);
    console.log(st.exchangeRef.id, 'reference price:', st.priceAvg.toFixed(8), st.priceInfo.symbol);
  } catch (e) { console.error('ERROR: fetchTicker', e); }

  // get all account balances
  try {
    st.balances = await st.exchangeTrade.fetch_balance();
    console.log(st.exchangeTrade.id, st.balances.XMR.total.toFixed(8), st.coin1);
    console.log(st.exchangeTrade.id, st.balances.BTC.total.toFixed(8), st.coin2);
    await new Promise(resolve => setTimeout(resolve, st.sourceTradeDelay)); // delay ms
  } catch (e) { console.error('ERROR: fetch_balance', e); }

  console.log('\n');

  // cancel all orders
  try {
    await st.exchangeTrade.cancelOrder(undefined, undefined, {Type: 'All'});
    console.log('All previous orders removed!');
    await new Promise(resolve => setTimeout(resolve, st.sourceTradeDelay)); // delay ms
  } catch (e) { console.error('Canceled no previous orders'); }

  // place new updated orders
  // e.g. amount measured in Coin1 and price measured in Coin2 for Coin1/Coin2 on cryptopia

  try {
    let buyOrderPrice = _.floor(st.priceAvg * (100 - st.offsetPercent) / 100.0, 8);
    let buyOrderAmmountUnit2 = _.floor(st.balances[st.coin2].total * st.orderFraction, 8);
    let buyOrderAmmountUnit1 = _.floor(buyOrderAmmountUnit2 / buyOrderPrice, 8);

    if (buyOrderAmmountUnit1 > st.minAmountLimitUnit2) {
      await st.exchangeTrade.createLimitBuyOrder(st.pair, buyOrderAmmountUnit1, buyOrderPrice);
      console.log(st.exchangeTrade.id, 'bid:', buyOrderAmmountUnit1.toFixed(8), st.coin1, '@', buyOrderPrice.toFixed(8), st.pair);
      await new Promise(resolve => setTimeout(resolve, st.sourceTradeDelay)); // delay ms
    }
  } catch (e) { console.error('Failed attempt to createLimitBuyOrder'); }

  try {
    let sellOrderPrice = _.floor(st.priceAvg * (100 + st.offsetPercent) / 100.0, 8);
    let sellOrderAmmountUnit1 = _.floor(st.balances[st.coin1].total * st.orderFraction, 8);
    let sellOrderAmmountUnit2 = _.floor(sellOrderAmmountUnit1 * sellOrderPrice, 8);

    if (sellOrderAmmountUnit2 > st.minAmountLimitUnit2) {
      await st.exchangeTrade.createLimitSellOrder(st.pair, sellOrderAmmountUnit1, sellOrderPrice);
      console.log(st.exchangeTrade.id, 'ask:', sellOrderAmmountUnit1.toFixed(8), st.coin1, '@', sellOrderPrice.toFixed(8), st.pair);
      await new Promise(resolve => setTimeout(resolve, st.sourceTradeDelay)); // delay ms
    }
  } catch (e) { console.error('Failed attempt to createLimitSellOrder'); }

  console.log('\n\n--- pause ---\n');

  await new Promise(resolve => setTimeout(resolve, st.botStepMilliseconds)); // delay X seconds
  loopBot(); // loop itself

}
