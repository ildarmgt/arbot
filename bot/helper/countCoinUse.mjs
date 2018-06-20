/**
 * returns total number of pairs this coin is traded in
 */
export default function countCoinUse (st, coinName) {
  let countUses = 0;
  st.bots.forEach(bot => {
    if (bot.type === 'arbot') {
      if (bot.coin1 === coinName || bot.coin2 === coinName) {
        countUses++;
      }
    }
  });
  return countUses;
}
