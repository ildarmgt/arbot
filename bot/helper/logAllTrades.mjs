import _ from 'lodash';
import fs from 'fs';
import csvWriter from 'csv-write-stream';

import calcRefExchanges from './calcRefExchanges';

export default async function logAllTrades (st, job, trades) {

  const FILE_PATH = 'alltrades_' + job.coin1 + job.coin2 + '.csv';
  let pair = job.coin1 + '/' + job.coin2;

  try {
    let writer = csvWriter();
    if (!fs.existsSync(FILE_PATH)) {
      writer = csvWriter({ headers: [
        'datetime',
        'timestamp',
        'exchange',
        'pair',
        'refPrice',
        'tradePrice',
        'offset',
        'amount',
        'profit'
      ]});

    } else {
      writer = csvWriter({sendHeaders: false});
    }

    writer.pipe(fs.createWriteStream(FILE_PATH, {flags: 'a'}));

    trades.forEach(trade => {
      let refPrice = calcRefExchanges(st)[trade.symbol];
      let tradePrice = trade.price;
      let offset = _.floor((tradePrice - refPrice) / refPrice * 100.0, 2);

      writer.write({
        datetime: trade.datetime,
        timestamp: trade.timestamp,
        exchange: job.exchange,
        pair: trade.symbol,
        refPrice: refPrice,
        tradePrice: tradePrice,
        offset: offset,
        amount: trade.amount,
        profit: Math.abs(_.floor(trade.amount * offset / 100.0, 8))
      });
    });

    writer.end();
    // write down the time of last entry so don't repeat trades
    st.exchanges[job.exchange].fetchedAllTradesTime[pair] = new Date().getTime();

  } catch (e) {
    console.error('Failed writing others', pair, 'trades to file');
  }

  console.log('all trade log updated for', pair);

}
