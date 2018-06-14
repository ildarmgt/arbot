import initializeExchanges from './initializeExchanges';
import loopBots from './loopBots';
import loopJobs from './loopJobs';
import totalBalances from './totalBalances';
/**
 * startLoops is a function that initiates
 * all the necessary async loops. Runs once.
 */
export default async function startLoops (st) {

  // initialize exchanges with auth info where necessary
  console.log('initializing exchanges');
  await initializeExchanges(st);

  // run the main bot loop that generates jobs
  console.log('starting bot loop');
  loopBots(st);

  // run job execution loop
  console.log('starting job running loop');
  loopJobs(st);

  // starting info loop
  console.log('starting performance view loop');
  totalBalances(st);
  // (TODO) how to create jobs - big loop doing step by step job adds
}
