'use strict';
const runFetchTicker = require('./runFetchTicker');
const runFetchBalance = require('./runFetchBalance');
const runCancelOrders = require('./runCancelOrders');
const runBuyOrder = require('./runBuyOrder');
const runSellOrder = require('./runSellOrder');

async function loopJobs (st) {
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

      if (eaJob.name === 'fetchTicker') { runFetchTicker(st, eaJob); matchFound = true; }
      if (eaJob.name === 'fetch_balance') { runFetchBalance(st, eaJob); matchFound = true; }
      if (eaJob.name === 'cancelOrders') { runCancelOrders(st, eaJob); matchFound = true; }
      if (eaJob.name === 'createLimitBuyOrder') { runBuyOrder(st, eaJob); matchFound = true; }
      if (eaJob.name === 'createLimitSellOrder') { runSellOrder(st, eaJob); matchFound = true; }

      // end loop so it restarts from beginning in case there was important task earlier
      if (matchFound) break;
    }
  }
  // });

  // loop job execution function with a small delay
  await new Promise(resolve => setTimeout(resolve, 100));
  loopJobs(st);
}

export default loopJobs;
