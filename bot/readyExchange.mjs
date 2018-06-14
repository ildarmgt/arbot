/**
 * Update exchange status to not in use and set last used timestamp
 */
function readyExchange (st, eaJob) {
  st.exchanges[eaJob.exchange].lastUsed = new Date().getTime(); // time stamp
  st.exchanges[eaJob.exchange].inUse = false; // done using
}

export default readyExchange;
