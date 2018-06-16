/**
 * Goes through current bots and grabs price reference exchanges
 * for each pair to do conversions.
 * Returns an object with key of pair and value of the last price
 */
export default async function calcRefExchanges (st) {
  // array of pairs & exchanges used for references
  // based on current bots and not old recorded data
  let sources = st.bots.map(bot => {
    return {
      pair: bot.coin1 + '/' + bot.coin2,
      exchangeName: bot.sourceRef
    };
  });

  let ref = sources.reduce((thisRef, source) => {
    // if exchange or pair is not recorded yet, lastPrice will be undefined
    let lastPrice = st.exchanges[source.exchangeName]
      ? (
        st.exchanges[source.exchangeName][source.pair] // ?
          ? st.exchanges[source.exchangeName][source.pair].last
          : undefined
      )
      : undefined;

    // if lastPrice was found, amend ref to include a new pair
    return lastPrice // ?
      ? { ...thisRef, [source.pair]: lastPrice }
      : thisRef;
  }, {}); // start with empty object

  console.log(ref);
  return ref;
}
