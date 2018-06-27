import startLoops from './bot/startLoops';
import initialBots from './bot/initializeSettings.mjs';
import State from './elements/State';

// create this app state
let st = new State();

// load the settings for initial set of bots
// this will error out if there's no proper initialbots.json (see readme.md)
initialBots(st);

// initialize the operation
// this will error out if there's a trading arbot & no proper auth.json (see readme.md)
startLoops(st);

console.log('Reached the end of server.mjs file');
