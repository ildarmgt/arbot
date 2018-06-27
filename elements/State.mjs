export default class State {
  constructor () {
    this.jobs = []; // store each job/action to get done
    this.jobId = 0; // count jobs
    this.bots = []; // store each trading pair into separate bots
    this.botId = 0; // count bots
    this.lib = {}; // store initialized exchange libararies
    this.exchanges = {}; // store most recent data fetched from exchanges

    this.data = {}; // store performance data
    this.data.lookBackTime = 4 * 60 * 60 * 1000; // miliseconds of look back time (TODO: make it adjustable for each exchange or bot)
    this.data.history = {}; // store old data
  }
}
