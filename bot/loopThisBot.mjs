// this function loops the action (job) generation of a single bot
// depending on type of bot it is, the job sequence will be different
export default async function loopThisBot (st, bot) {
  console.log('Bot #', bot.id, 'type', bot.type, 'loop initiated');
  // generate jobs

  if (bot.type === 'info') {

    // get ref price
    st.jobs.push({
      name: 'fetchTicker',
      id: st.jobId++,
      exchange: bot.sourceRef,
      coin1: bot.coin1,
      coin2: bot.coin2,
      exchangeDelay: bot.sourceRefDelay
    });
  }

  if (bot.type === 'arbot') {
    // steps 2 & 3 need to be shared between bots on same exchange

    // 1) get ref price
    st.jobs.push({
      name: 'fetchTicker',
      id: st.jobId++,
      exchange: bot.sourceRef,
      coin1: bot.coin1,
      coin2: bot.coin2,
      exchangeDelay: bot.sourceRefDelay,
      timestamp: new Date().getTime()
    });

    if (bot.leadsSharedEvents) {
      // 2) get updated account balances
      st.jobs.push({
        name: 'fetchBalances',
        id: st.jobId++,
        exchange: bot.sourceTrade,
        exchangeDelay: bot.sourceTradeDelay,
        timestamp: new Date().getTime()
      });

      // 3) cancel previous orders
      st.jobs.push({
        name: 'cancelOrders',
        id: st.jobId++,
        exchange: bot.sourceTrade,
        exchangeDelay: bot.sourceTradeDelay,
        timestamp: new Date().getTime()
      });
    }

    // 4) place buy order
    st.jobs.push({
      name: 'createBuyOrder',
      id: st.jobId++,
      exchange: bot.sourceTrade,
      coin1: bot.coin1,
      coin2: bot.coin2,
      priceSource: bot.sourceRef,
      offsetPercent: -bot.offsetPercent,
      positionFraction: bot.positionFraction,
      exchangeDelay: bot.sourceTradeDelay,
      maxWaitTime: bot.botStepDelay / 2,
      timestamp: new Date().getTime()
    });

    // 5) place sell order
    st.jobs.push({
      name: 'createSellOrder',
      id: st.jobId++,
      exchange: bot.sourceTrade,
      coin1: bot.coin1,
      coin2: bot.coin2,
      priceSource: bot.sourceRef,
      offsetPercent: bot.offsetPercent,
      positionFraction: bot.positionFraction,
      exchangeDelay: bot.sourceTradeDelay,
      maxWaitTime: bot.botStepDelay / 2,
      timestamp: new Date().getTime()
    });
  }

  // loose bot step delay
  await new Promise(resolve => setTimeout(resolve, bot.botStepDelay));

  // reoeat this loop
  loopThisBot(st, bot);
}
