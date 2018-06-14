// update exchange status to ready for more
function readyExchange (st, eaJob) {
  st.exchanges[eaJob.exchange].lastUsed = new Date().getTime(); // time stamp
  st.exchanges[eaJob.exchange].inUse = false; // done using
}

export default readyExchange;
