export default class State {
  constructor () {
    this.jobs = []; // store each job/action to get done
    this.jobId = 0; // count jobs
    this.bots = []; // store each trading pair into separate bots
    this.botId = 0; // count bots
    this.lib = {}; // store initialized exchange libararies
    this.exchanges = {}; // store most recent data fetched from exchanges
    this.data = {}; // store performance data
  }
}
