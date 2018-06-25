import numbers from 'numbers';
import _ from 'lodash';

import calcRefExchanges from './calcRefExchanges';

/**
 * This function
 * removes useless old data
 * adds new data
 * and calculates important numbers for bot if possible
 */
export default function analyzeData (st, job, trades) {

  // (TODO for now this is for each pair, but it should be for each exchange AND pair since
  // same pair can be on multiple exchanges)

  let lookBackTime = st.data.lookBackTime;
  let {coin1, coin2} = job;
  let pair = coin1 + '/' + coin2;
  let refPrice = _.floor(calcRefExchanges(st)[pair], 8);

  // initialize if necessary
  if (!st.data.history[pair]) st.data.history[pair] = {};
  if (!st.data.history[pair].raw) st.data.history[pair].raw = [];

  // only keep elements within time range
  // (TODO) to keep state small, might be necessary to either store and parse a file
  // (TODO) or to convert raw data into finite candle size as abstraction and smaller array
  st.data.history[pair].raw = st.data.history[pair].raw.filter(
    eaRaw => (new Date().getTime() - eaRaw.time) < lookBackTime
  );

  // add new data (if recent enough)

  // (TODO: reduce calculation times & mem use by avoiding resizing arrays!! proof of concept for now, but won't scale for large data sets)
  trades.forEach(trade => {
    if ((new Date().getTime() - trade.timestamp) < lookBackTime) {
      let newEntry = {
        price: trade.price,
        refPrice: refPrice,
        time: trade.timestamp
      };
      // console.log(pair, newEntry);
      st.data.history[pair].raw.push(newEntry);
    }
  });

  // analyze data

  // get array of just raw deviations
  let rawData = st.data.history[pair].raw.map(value =>
    _.floor((value.price - value.refPrice) / value.refPrice * 100, 4)
  );

  // process said array
  let stdev = _.floor(numbers.statistic.standardDev(rawData), 4);
  let mean = _.floor(numbers.statistic.mean(rawData), 4);
  let median = _.floor(numbers.statistic.median(rawData), 4);

  // console.log(
  //   pair,
  //   'size:', rawData.length || 'n/a',
  //   'mean:', mean,
  //   'median:', median,
  //   'stdev:', stdev
  // );

  // console.log(
  //   pair,
  //   '1dev (', '+' + _.floor(mean + 1 * stdev, 2),
  //   ',', _.floor(mean - 1 * stdev, 2),
  //   '), 2dev (', '+' + _.floor(mean + 2 * stdev, 2),
  //   ',', _.floor(mean - 2 * stdev, 2), ')'
  // );

  // store these calculations
  st.data.history[pair].rawCalc = {
    size: rawData.length,
    mean: mean,
    median: median,
    stdev: stdev,
    stdev1top: _.floor(mean + 1 * stdev, 4),
    stdev1bottom: _.floor(mean - 1 * stdev, 4),
    stdev2top: _.floor(mean + 2 * stdev, 4),
    stdev2bottom: _.floor(mean - 2 * stdev, 4)
  };

}
