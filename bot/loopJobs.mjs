import runFetchTicker from './runFetchTicker';
import runFetchBalance from './runFetchBalance';
import runCancelOrders from './runCancelOrders';
import runBuyOrder from './runBuyOrder';
import runSellOrder from './runSellOrder';

async function loopJobs (st) {
  // console.log('.');

  // st.jobs.forEach((eaJob, jobIndex) => {
  for (let jobIndex = 0; jobIndex < st.jobs.length; jobIndex++) {
    let eaJob = st.jobs[jobIndex];

    // check if the exchange is in use or used too recently
    let inUse = st.exchanges[eaJob.exchange].inUse;
    let timeSince = new Date().getTime() - st.exchanges[eaJob.exchange].lastUsed;
    let minDelay = eaJob.exchangeDelay;
    let enoughTimePassed = timeSince > minDelay;

    if (!inUse && enoughTimePassed) {
      // mark exchange as busy
      st.exchanges[eaJob.exchange].inUse = true;

      // console.log('executing job #', eaJob.id, eaJob.name);

      let matchFound = false;

      if (eaJob.name === 'fetchTicker') { runFetchTicker(st, eaJob); matchFound = true; }
      if (eaJob.name === 'fetchBalances') { runFetchBalance(st, eaJob); matchFound = true; }
      if (eaJob.name === 'cancelOrders') { runCancelOrders(st, eaJob); matchFound = true; }
      if (eaJob.name === 'createBuyOrder') { runBuyOrder(st, eaJob); matchFound = true; }
      if (eaJob.name === 'createSellOrder') { runSellOrder(st, eaJob); matchFound = true; }

      // remove done job from job list
      st.jobs.splice(jobIndex, 1);

      // end loop so it restarts from beginning in case there was important task earlier
      if (matchFound) {
        break;
      } else {
        console.log(`warning: job should've ran but no match found:`, eaJob);
      }
    }
  }
  // });

  // loop job execution function with a small delay
  await new Promise(resolve => setTimeout(resolve, 100));
  loopJobs(st);
}

export default loopJobs;
