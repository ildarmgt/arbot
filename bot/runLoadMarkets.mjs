'use strict';
// required initialization of an exchange
async function runLoadMarkets (st, exchangeName) {
  try {
    console.log(st.exchanges[exchangeName].id, ': loadMarkets() start');
    await st.lib[exchangeName].loadMarkets(); // load all the pairs info from API
    console.log(st.exchanges[exchangeName].id, ': loadMarkets() done');
  } catch (e) { console.error('failed loadMarkets() for ', exchangeName); }
}

export default runLoadMarkets;
