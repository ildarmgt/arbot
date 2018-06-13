'use strict';

// initial user defined parameters
let st = {}; // local state
st.jobs = []; // store each job/action to get done
st.jobId = 0; // count jobs
st.bots = []; // store each trading pair into separate bots
st.exchanges = {}; // store initialized exchanges
st.data = {}; // store performance data
st.bots.push({
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

// libraries
const _ = require('lodash'); // useful math libarary
const auth = require('./auth.json'); // import my personal authentication data
const ccxt = require('ccxt'); // add the exchange libraries

// initialize the bot
startBot();

console.log('Reached the end of server.js file');

// ===================== END =========================

// --- main functions ------

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
      // st.exchanges[bot.sourceRef].userAgent = '';

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

      // set timer params
      st.exchanges[bot.sourceTrade].lastUsed = new Date().getTime();
      st.exchanges[bot.sourceTrade].inUse = false;

      // initialize new exchange by name
      await runLoadMarkets(bot.sourceTrade);
    }

    // usd exchange third
    if (!st.exchanges[bot.sourceUSD]) {
      // get trade exchange handle if not added yet
      st.exchanges[bot.sourceUSD] = new ccxt[bot.sourceUSD]();
      console.log(st.exchanges[bot.sourceUSD].id, 'exchange initialized');

      // set timer params
      st.exchanges[bot.sourceUSD].lastUsed = new Date().getTime();
      st.exchanges[bot.sourceUSD].inUse = false;

      // initialize new exchange by name
      await runLoadMarkets(bot.sourceUSD);
    }

  }

  // run the main bot loop that generates jobs
  console.log('starting bot loop');
  loopBots();

  // run job execution loop
  console.log('starting job running loop');
  runJobs();

  // (TODO) how to create jobs - big loop doing step by step job adds
}

// this goes through all the bots and generates necessary jobs
async function loopBots () {

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

  printBalances();

  await new Promise(resolve => setTimeout(resolve, 30000)); // delay
  loopBots();
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

      // remove done job from job list
      st.jobs.splice(jobIndex, 1);

      // console.log('executing job #', eaJob.id, eaJob.name);

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
      ': successful fetchTicker',
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
      ': successful fetch_balance'
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
      ': successful cancel orders'
    );

  } catch (e) {
    console.error(st.exchanges[eaJob.exchange].id, ': failed cancel orders');
    if (!eaJob.retry) {
      eaJob.retry = true;
      await new Promise(resolve => setTimeout(resolve, eaJob.sourceDelay));
      await runCancelOrders(eaJob);
    }
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
        ': successful buy order placed'
      );
    } else {
      console.log(st.exchanges[eaJob.exchange].id, eaJob.coin2, 'balance too low for buy order');
    }
  } catch (e) {
    console.error(st.exchanges[eaJob.exchange].id, ': failed buy order');
    if (!eaJob.retry) {
      eaJob.retry = true;
      await new Promise(resolve => setTimeout(resolve, eaJob.sourceDelay));
      await runCreateLimitBuyOrder(eaJob);
    }
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
        ': successful sell order placed'
      );
    } else {
      console.log(st.exchanges[eaJob.exchange].id, eaJob.coin1, 'balance too low for sell order');
    }
  } catch (e) {
    console.error(st.exchanges[eaJob.exchange].id, ': failed sell order');
    if (!eaJob.retry) {
      eaJob.retry = true;
      await new Promise(resolve => setTimeout(resolve, eaJob.sourceDelay));
      await runCreateLimitSellOrder(eaJob);
    }
  }
  readyExchange(eaJob);
}

// print balances in original, BTC, and USD
function printBalances () {

  let holdings = {};
  let totalBTC = 0;
  let totalUSD = 0;

  // temp solution, later to be gotten from reference exchanges in all the bots
  let referenceExchanges = {
    'XMR/BTC': 'hitbtc',
    'BTC/USD': 'bitstamp'
  };

  console.log('===============================================');
  console.log('                   BALANCES                    ');
  console.log('-----------------------------------------------');

  // collect non-zero balances across all accounts
  for (let exchangeKey in st.exchanges) {
    for (let coinKey in st.exchanges[exchangeKey].balances) {
      let balance = st.exchanges[exchangeKey].balances[coinKey].total;
      if (balance > 0) {
        holdings[coinKey] = { value: balance };
      }
    }
  }

  // convert all balances to BTC and USD if possible
  for (let coinKey in holdings) {
    // get conversion factor to BTC
    let conversionFactorToBTC = (coinKey === 'BTC')
      ? 1
      : st.exchanges[referenceExchanges[coinKey + '/' + 'BTC']][coinKey + '/' + 'BTC'].last;

    // calculate BTC value of all coins
    if (conversionFactorToBTC) {
      let btcValue = _.floor(holdings[coinKey].value * conversionFactorToBTC, 8);
      holdings[coinKey].valueInBTC = btcValue;
      totalBTC += btcValue || 0;
    }

    // get conversion factor BTC to USD
    let conversionFactorToUSD = st.exchanges[referenceExchanges['BTC/USD']]['BTC/USD'].last;
    // calculate USD value of all coins
    if (conversionFactorToUSD) {
      let usdValue = _.floor(holdings[coinKey].valueInBTC * conversionFactorToUSD, 8);
      holdings[coinKey].valueInUSD = usdValue;
      totalUSD += usdValue || 0;
    }

    console.log(
      holdings[coinKey].value.toFixed(8), coinKey, '(',
      holdings[coinKey].valueInBTC.toFixed(8), 'BTC,',
      holdings[coinKey].valueInUSD.toFixed(2), 'USD )'
    );
  }

  // record first balances
  // if first data isn't recorded yet, record it
  if (!(st.data.firstBTC && st.data.firstUSD)) { // if even one of initial records don't exist, record this pass as initial
    st.data.firstBTC = _.floor(totalBTC, 8);
    st.data.firstUSD = _.floor(totalUSD, 2);
    st.data.firstTime = new Date().getTime();
  }

  console.log('-----------------------------------------------');
  console.log('Total:', totalBTC.toFixed(8), 'BTC,', totalUSD.toFixed(2), 'USD');
  console.log('-----------------------------------------------');
  console.log(
    'BTC change:',
    st.data.firstBTC ? _.round((totalBTC / st.data.firstBTC - 1.0) * 100.0, 2).toFixed(2) + '%' : 'N/A',
    'USD change:',
    st.data.firstUSD ? _.round((totalUSD / st.data.firstUSD - 1.0) * 100.0, 2).toFixed(2) + '%' : 'N/A'
  );
  console.log('Run time:', st.data.firstTime ? diffToDays(new Date().getTime() - st.data.firstTime) : 'N/A');
  console.log('===============================================');

}

function diffToDays (inMS) {
  let MSinSec = 1000;
  let MSinMin = MSinSec * 60;
  let MSinHour = MSinMin * 60;
  let MSinDay = MSinHour * 24;

  let days = _.floor(inMS / MSinDay);
  let hours = _.floor((inMS % MSinDay) / MSinHour);
  let minutes = _.floor((inMS % MSinDay % MSinHour) / MSinMin);
  let seconds = _.floor((inMS % MSinDay % MSinHour % MSinMin) / MSinSec, 1);

  return days + ' days ' + hours + ' hours ' + minutes + ' minutes ' + seconds.toFixed(1) + ' seconds';
}
