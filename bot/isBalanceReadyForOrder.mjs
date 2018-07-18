/**
 * See if exchange recently had orders canceled.
 * Will wait job.maxWaitTime to see if it changes
 */
export default async function isBalanceReadyForOrder (st, eaJob) {
  let waitingStartedTime = new Date().getTime();

  while (true) {
    let now = new Date().getTime();

    // keep checking for last cancelation of orders time stamp
    let lastCanceled = st.exchanges[eaJob.exchange].lastCanceled;

    // if has never been canceled, we know it's not ready
    if (!lastCanceled) {
      return false;
    }

    // if it has been canceled under maxWaitTime ago, it's ready
    let timeSinceCancel = now - lastCanceled;
    if (timeSinceCancel < eaJob.maxWaitTime) {
      return true;
    }

    // if too much time has passed since calling this function,
    // it's been too long and balances are probably not ready
    let timeSinceWaitingStarted = now - waitingStartedTime;
    if (timeSinceWaitingStarted > eaJob.maxWaitTime) {
      return false;
    }

    await new Promise(resolve => setTimeout(resolve, 10));
  }
}
