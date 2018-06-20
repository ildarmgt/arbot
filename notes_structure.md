st
  * bots[]
    * type
      * 'arbot' // liquidity bot
      * 'info' // just gets price (e.g. btcusd)
    * id
    * botStepDelay
    * coin1
    * coin2
    * sourceRef
  * lib // cctx or similar library object handles for api calls
    * 'exchange name'
  * exchanges
    * lastUsed // ms time stamp of last use
    * inUse // is being used now
    * 'exchange name'
      * 'coin1/coin2'
        * bid
        * ask
        * last
      * balances
        * 'coin'
          * total
          * free
      * totalBTC
      * totalUSD
  * data
    * firstBTC // est BTC at start of script
    * firstUSD // est USD at start of script
    * firstTime // timestamp script roughly began