'use strict';

// initial user defined parameters
let st = {}; // local state
st.botStepMilliseconds = 30000; // ms to pause between bot loop executions
st.coin1 = 'XMR'; // coin1 in coin1/coin2
st.coin2 = 'BTC'; // coin2 in coin1/coin2
st.sourceRef = 'hitbtc'; // read price here
st.sourceTrade = 'cryptopia'; // trade here
st.sourceTradeDelay = 500; // delay between API calls (ms)
st.sourceTradeDelayLimit = 200; // min call delay between calls (ms)
st.offsetPercent = 1; // percent offset from reference price for bids and asks
st.orderFraction = 0.95; // fraction of available coins to place order with

// libraries
const _ = require('lodash'); // useful math libarary
const auth = require('./auth.json'); // import my personal authentication data
const ccxt = require('ccxt'); // add the exchange libraries

// initialize exchanges with auth info where necessary
st.exchangeRef = new ccxt[st.sourceRef](); // eslint-disable-line
st.exchangeTrade = new ccxt[st.sourceTrade]({ // eslint-disable-line
  apiKey: auth[st.sourceTrade].PUBLIC_KEY,
  secret: auth[st.sourceTrade].PRIVATE_KEY,
  enableRateLimit: true,
  rateLimit: _.round(st.sourceTradeDelayLimit)
});

// initialize the bot
startBot();

console.log('Reached the end of server.js file');
// ===================== END =========================

// --- async functions ------

async function startBot () {
  // initialize the bot once
  try {
    await st.exchangeRef.loadMarkets(); // load all the pairs info from API
    await st.exchangeTrade.loadMarkets(); // load all the pairs info from API
  } catch (e) { console.error('ERROR: loadMarkets()\n', e); }

  loopBot();
}

async function loopBot () {
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
