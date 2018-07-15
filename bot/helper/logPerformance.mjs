// import _ from 'lodash';o
import fs from 'fs';
import csvWriter from 'csv-write-stream';

/**
 * write new performance data to csv file
 */
export default async function logPerformance (st) {

  const FILE_PATH = ('logs/my_performance.csv');

  try {
    let writer = csvWriter();

    // write headers to file if it doesn't exist, otherwise don't;
    if (!fs.existsSync(FILE_PATH)) {
      writer = csvWriter({ headers: [
        'datetime',
        'timestamp',
        'valueBTC',
        'valueUSD'
      ]});

    } else {
      writer = csvWriter({sendHeaders: false});
    }

    // add lines to file
    writer.pipe(fs.createWriteStream(FILE_PATH, {flags: 'a'}));

    writer.write({
      datetime: new Date(), // (TODO) convert to readable date
      timestamp: new Date().getTime(),
      valueBTC: st.data.totals.sumBTC.toFixed(8),
      valueUSD: st.data.totals.sumUSD.toFixed(2)
    });

    writer.end();

    console.log('Performance file update finished');

  } catch (e) {
    console.error('Failed writing performance to file');
  }

}
