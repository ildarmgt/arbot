'use strict';

// initial user defined parameters
let st = {}; // local state
st.jobs = []; // store each job/action to get done
st.jobId = 0; // count jobs
st.bots = []; // store each trading pair into separate bots
st.exchanges = {}; // store initialized exchanges
st.bots.push({
  botStepMilliseconds: 30000, // ms to pause between bot loop executions
  coin1: 'XMR', // coin1 in coin1/coin2
  coin2: 'BTC', // coin2 in coin1/coin2
  sourceRef: 'hitbtc', // read price here
  sourceTrade: 'cryptopia', // trade here
  sourceRefDelay: 100, // delay between API calls (ms) for reference price exchange
  sourceRefDelayLimit: 10, // min call delay between calls (ms) for reference price exchange
  sourceTradeDelay: 500, // delay between API calls (ms) for trading exchange
  sourceTradeDelayLimit: 1, // min call delay between calls (ms) for trading exchange
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
  // st.bots.forEach((bot) => {
  for (let bot of st.bots) {
    // (TODO) combine both into one helper function

    // reference exchange first
    if (!st.exchanges[bot.sourceRef]) {
      // get reference exchange handle if not added yet
      st.exchanges[bot.sourceRef] = new ccxt[bot.sourceRef]();
      console.log(st.exchanges[bot.sourceRef].id, 'exchange initialized');

      // set timer params
      st.exchanges[bot.sourceRef].lastUsed = new Date().getTime();
      st.exchanges[bot.sourceRef].inUse = false;

      // testing
      st.exchanges[bot.sourceRef].userAgent = '';

      // initialize new exchange by name
      await runLoadMarkets(bot.sourceRef);
    }

    // trade exchange second
    if (!st.exchanges[bot.sourceTrade]) {
      // get trade exchange handle if not added yet
      st.exchanges[bot.sourceTrade] = new ccxt[bot.sourceTrade]({
        apiKey: auth[bot.sourceTrade].PUBLIC_KEY,
        secret: auth[bot.sourceTrade].PRIVATE_KEY,
        enableRateLimit: false,
        rateLimit: _.round(bot.sourceTradeDelayLimit)
      });
      console.log(st.exchanges[bot.sourceTrade].id, 'exchange initialized');

      // testing
      st.exchanges[bot.sourceTrade].userAgent = '';

      // set timer params
      st.exchanges[bot.sourceTrade].lastUsed = new Date().getTime();
      st.exchanges[bot.sourceTrade].inUse = false;

      // initialize new exchange by name
      await runLoadMarkets(bot.sourceTrade);
    }
  }

  // run the main bot loop that generates jobs
  console.log('starting bot loop');
  loopBot();

  // run job execution loop
  console.log('starting job running loop');
  runJobs();

  // (TODO) how to create jobs - big loop doing step by step job adds
}

// this goes through all the bots and generates necessary jobs
async function loopBot () {

  let waitfor = 300;

  st.jobs.push({ name: 'fetchTicker',
    id: st.jobId++,
    exchange: 'hitbtc',
    coin1: 'XMR',
    coin2: 'BTC',
    sourceDelay: waitfor,
    timestamp: new Date().getTime()
  });

  st.jobs.push({ name: 'fetch_balance',
    id: st.jobId++,
    exchange: 'cryptopia',
    sourceDelay: waitfor,
    timestamp: new Date().getTime()
  });

  st.jobs.push({ name: 'cancelOrders',
    id: st.jobId++,
    exchange: 'cryptopia',
    sourceDelay: waitfor,
    timestamp: new Date().getTime()
  });

  st.jobs.push({ name: 'createLimitBuyOrder',
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

  st.jobs.push({ name: 'createLimitSellOrder',
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
  await new Promise(resolve => setTimeout(resolve, 30000));
  loopBot();
}

async function runJobs () {
  // console.log('.');

  // st.jobs.forEach((eaJob, jobIndex) => {
  for (let jobIndex = 0; jobIndex < st.jobs.length; jobIndex++) {
    let eaJob = st.jobs[jobIndex];

    // check if the exchange is in use or used too recently
    let inUse = st.exchanges[eaJob.exchange].inUse;
    let timeSince = new Date().getTime() - st.exchanges[eaJob.exchange].lastUsed;
    let minDelay = eaJob.sourceDelay;
    let enoughTimePassed = timeSince > minDelay;

    if (!inUse && enoughTimePassed) {
      // mark exchange as busy
      st.exchanges[eaJob.exchange].inUse = true;
      // console.log(st.exchanges[eaJob.exchange].id, 'is busy');

      // remove done job from job list
      st.jobs.splice(jobIndex, 1);

      console.log('executing job #', eaJob.id, eaJob.name);

      let matchFound = false;
      if (eaJob.name === 'fetchTicker') { runFetchTicker(eaJob); matchFound = true; }
      if (eaJob.name === 'fetch_balance') { runFetchBalance(eaJob); matchFound = true; }
      if (eaJob.name === 'cancelOrders') { runCancelOrders(eaJob); matchFound = true; }
      if (eaJob.name === 'createLimitBuyOrder') { runCreateLimitBuyOrder(eaJob); matchFound = true; }
      if (eaJob.name === 'createLimitSellOrder') { runCreateLimitSellOrder(eaJob); matchFound = true; }

      // end loop so it restarts from beginning
      if (matchFound) break;
    }
  }
  // });

  // loop job execution function with a small delay
  await new Promise(resolve => setTimeout(resolve, 100));
  runJobs();
}

// update exchange status to ready for more
function readyExchange (eaJob) {
  st.exchanges[eaJob.exchange].lastUsed = new Date().getTime(); // time stamp
  st.exchanges[eaJob.exchange].inUse = false; // done using
  // console.log(st.exchanges[eaJob.exchange].id, 'is free & timer updated');
}

// required initialization of an exchange
async function runLoadMarkets (exchangeName) {
  try {
    console.log(st.exchanges[exchangeName].id, ': loadMarkets() start');
    await st.exchanges[exchangeName].loadMarkets(); // load all the pairs info from API
    console.log(st.exchanges[exchangeName].id, ': loadMarkets() done');
  } catch (e) { console.error('failed loadMarkets() for ', exchangeName); }
}

// get price info & store it in state
async function runFetchTicker (eaJob) {

  try {
    let pair = eaJob.coin1 + '/' + eaJob.coin2;

    // (ASYNC) get price info based on exchange name & pair stored in the job
    let response = await st.exchanges[eaJob.exchange].fetchTicker(pair);

    // store response info in the state
    st.exchanges[eaJob.exchange][pair] = response;

    console.log(
      st.exchanges[eaJob.exchange].id,
      'successful fetchTicker',
      st.exchanges[eaJob.exchange][pair].last,
      st.exchanges[eaJob.exchange][pair].symbol
    );

  } catch (e) {
    console.error(st.exchanges[eaJob.exchange].id, ': failed job', eaJob);
  }
  readyExchange(eaJob);
}

// get all account balances from an exchange of interest
async function runFetchBalance (eaJob) {

  try {

    // (ASYNC) get balances for specific exchange
    let response = await st.exchanges[eaJob.exchange].fetch_balance();

    // store response info in the state
    st.exchanges[eaJob.exchange].balances = response;

    console.log(
      st.exchanges[eaJob.exchange].id,
      'successful fetch_balance'
    );

  } catch (e) {
    console.error(st.exchanges[eaJob.exchange].id, ': failed job', eaJob);
  }
  readyExchange(eaJob);
}

// cancel all active orders
async function runCancelOrders (eaJob) {

  try {

    // (ASYNC) cancel all active orders
    await st.exchanges[eaJob.exchange].cancelOrder(undefined, undefined, {Type: 'All'});

    // no changes to state

    console.log(
      st.exchanges[eaJob.exchange].id,
      'successful cancel orders'
    );

  } catch (e) {
    console.error(st.exchanges[eaJob.exchange].id, ': failed cancel orders \n');
  }
  readyExchange(eaJob);
}

// place buy order
async function runCreateLimitBuyOrder (eaJob) {
  let pair = eaJob.coin1 + '/' + eaJob.coin2;
  let priceData = st.exchanges[eaJob.priceSource][pair];
  let priceAvg = _.floor(0.5 * (priceData.bid + priceData.ask), 8);
  let buyOrderPrice = _.floor(priceAvg * (100 + eaJob.offsetPercent) / 100.0, 8);
  let balanceCoin2 = st.exchanges[eaJob.exchange].balances[eaJob.coin2].total; // (TODO) cannot read property BTC of undefined
  let buyOrderAmountUnit2 = _.floor(balanceCoin2 * eaJob.positionFraction, 8);
  let buyOrderAmountUnit1 = _.floor(buyOrderAmountUnit2 / buyOrderPrice, 8);
  let minimumBaseTradeUnit2 = st.exchanges[eaJob.exchange].markets[pair].info.MinimumBaseTrade;

  try {
    if (buyOrderAmountUnit2 > minimumBaseTradeUnit2) {
      // (ASYNC) place buy order
      await st.exchanges[eaJob.exchange].createLimitBuyOrder(
        pair,
        buyOrderAmountUnit1,
        buyOrderPrice
      );

      // no changes to state

      console.log(
        st.exchanges[eaJob.exchange].id,
        'successful buy order placed'
      );
    } else {
      console.log(st.exchanges[eaJob.exchange].id, eaJob.coin2, 'balance too low for buy order');
    }
  } catch (e) {
    console.error(st.exchanges[eaJob.exchange].id, ': failed buy order \n');
  }
  readyExchange(eaJob);
}

// place buy order
async function runCreateLimitSellOrder (eaJob) {
  let pair = eaJob.coin1 + '/' + eaJob.coin2;
  let priceData = st.exchanges[eaJob.priceSource][pair];
  let priceAvg = _.floor(0.5 * (priceData.bid + priceData.ask), 8);
  let sellOrderPrice = _.floor(priceAvg * (100 + eaJob.offsetPercent) / 100.0, 8);
  let balanceCoin1 = st.exchanges[eaJob.exchange].balances[eaJob.coin1].total;
  let sellOrderAmountUnit1 = _.floor(balanceCoin1 * eaJob.positionFraction, 8);
  let sellOrderAmountUnit2 = _.floor(sellOrderAmountUnit1 * sellOrderPrice, 8);
  let minimumBaseTradeUnit2 = st.exchanges[eaJob.exchange].markets[pair].info.MinimumBaseTrade;

  try {
    if (sellOrderAmountUnit2 > minimumBaseTradeUnit2) {
      // (ASYNC) place buy order
      await st.exchanges[eaJob.exchange].createLimitSellOrder(
        pair,
        sellOrderAmountUnit1,
        sellOrderPrice
      );

      // no changes to state

      console.log(
        st.exchanges[eaJob.exchange].id,
        'successful sell order placed'
      );
    } else {
      console.log(st.exchanges[eaJob.exchange].id, eaJob.coin1, 'balance too low for buy order');
    }
  } catch (e) {
    console.error(st.exchanges[eaJob.exchange].id, ': failed sell order \n');
  }
  readyExchange(eaJob);
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

    if (buyOrderAmmountUnit2 > st.minAmountLimitUnit2) {
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
