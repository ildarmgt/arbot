/**
 * Goes through current bots and grabs price reference exchanges
 * for each pair to do conversions.
 * Returns an object with key of pair and value of the last price
 */
export default function calcRefExchanges (st) {
  // array of pairs & exchanges used for references
  // based on current bots and not old recorded data
  let sources = st.bots.map(bot => {
    return {
      pair: bot.coin1 + '/' + bot.coin2,
      exchangeName: bot.sourceRef
    };
  });

  let refs = sources.reduce((refsSoFar, source) => {
    // if exchange or pair is not recorded yet, lastPrice will be undefined
    let lastPrice = st.exchanges[source.exchangeName]
      ? (
        st.exchanges[source.exchangeName][source.pair] // ?
          ? st.exchanges[source.exchangeName][source.pair].last
          : undefined
      )
      : undefined;

    // if lastPrice was found, amend ref to include a new pair
    return (
      lastPrice // ?
        ? { ...refsSoFar, [source.pair]: lastPrice }
        : refsSoFar
    );
  }, {}); // start with empty object

  // some important conversions from traded coins to reference BTC and USD metrics
  refs['BTC/BTC'] = 1;
  refs['USD/USD'] = 1; // probably not necessary
  refs['USDT/USD'] = 1; // possible to find conversion but not worth it

  return refs;
}
