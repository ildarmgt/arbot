export default class Bot {
  constructor (init) {
    this.type = init.type; // String. 'arbot' is a trading bot, 'info' just pulls necessary prices (e.g. BTCUSD)
    this.id = init.id; // Integer. this is automatically defined
    this.botStepDelay = init.botStepDelay; // Integer. ms to pause between bot loop executions. if bot shares exchange with another, best to have this same as orders have to be canceled at same time for both as the pair with "leadsSharedEvents" set to true;
    this.coin1 = init.coin1; // String. coin1 in coin1/coin2
    this.coin2 = init.coin2; // String. coin2 in coin1/coin2
    this.sourceRef = init.sourceRef; // String. read price from exchange of this name
    this.sourceRefDelay = init.sourceRefDelay; // Integer. delay between API calls (ms) for reference price exchange
    this.sourceTrade = init.sourceTrade; // String. trade on exchange of this name
    this.sourceTradeDelay = init.sourceTradeDelay; // Integer. delay between API calls (ms) for trading exchange
    this.offsetPercent = init.offsetPercent; // Array[Float]. percent offset from reference price for bids and asks
    this.positionFraction = init.positionFraction; // Array[Float]. fraction of available coins to place order with
    this.minSTDEV = init.minSTDEV; // Float. min standard deviation for use. If standard deviation is smaller, it will fall back to simple offset algorithm from reference price so bot doesn't lose money by having offset smaller than exchange fee per trade (e.g. 0.2% for cryptopia). If standard deviation is higher, it would switch to using statistics for placing orders. simple algo uses offsetPercent array. stdev algo uses offsetSTDEV array.
    this.offsetSTDEV = init.offsetSTDEV; // Array[Float]. if stdev is used, what multipliers on 1 standard deviation to use up and down from the mean of distribution.
    this.leadsSharedEvents = init.leadsSharedEvents; // Boolean. if this bot fetches balances and cancels orders for all on same exchange. Exactly 1 bot or pair should have this set to true on each exchange, not more, not less. (TODO: automate this)
  }
}
