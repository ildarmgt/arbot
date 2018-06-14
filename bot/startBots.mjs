import loopThisBot from './loopThisBot';

/**
 * A function that begins a separate async
 * loop of each bot's job generation
 */
export default async function startBots (st) {

  // create jobs based on each bot description
  // createJobsFromBot is async and happens in parallel
  st.bots.forEach(bot => {
    loopThisBot(st, bot);
  });

}
