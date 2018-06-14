import loopThisBot from './loopThisBot';

/**
 * loopBots is a function that begins the
 * loop of each bot's job generation
 */
async function loopBots (st) {

  // create jobs based on each bot description
  // createJobsFromBot is async and happens in parallel
  st.bots.forEach(bot => {
    loopThisBot(st, bot);
  });

}

export default loopBots;
