/**
 * returns total number of pairs traded with the arbots
 */
export default function countPairs (st, exchangeName) {
  let countPairs = 0;
  st.bots.forEach(bot => {
    if (bot.type === 'arbot') {
      if (bot.sourceTrade === exchangeName) {
        countPairs++;
      }
    }
  });
  return countPairs;
}
