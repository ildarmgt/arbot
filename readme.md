# Description

  Reads price on a big exchange and places orders on a smaller exchange with larger spread taking advantage of slippage.

# Status

  Testing. No GUI or front end yet.

# Instructions

  ## Requires

  * Node.js v10
  * Text editor to create and edit the settings.json and auth.json in project root folder (e.g. vscode, gedit `apt install gedit`)
  * Uncertain: I had to enable ntpd for more accurate clock on Linux Ubuntu 18.04 or it would have issues rapidly placing orders ([instructions](https://www.digitalocean.com/community/tutorials/how-to-set-up-time-synchronization-on-ubuntu-16-04))

  ## To create a folder with the bot

    git clone https://github.com/ildarmgt/arbot.git arbot

  ## Set up

    cd arbot
    npm install

  Need api keys for exchanges used for trading placed in a file in project root folder called `auth.json`

  Create it however (e.g. `touch auth.json`) and paste keys inside (e.g. `gedit auth.json`) like this example for cryptopia:

    {
      "cryptopia": {
        "PUBLIC_KEY": "public key here",
        "PRIVATE_KEY": "secret private key here"
      }
    }

  Also need initial settings file (like what bots to run initially).
  In project root folder, create `settings.json` (e.g. `touch settings.json`).
  Fill (e.g. `gedit settings.json`) with something like this example for 2 trading bots plus BTCUSD price fetching:

    {
      "bots": [
        {
          "type": "info",
          "botStepDelay": 30000,
          "coin1": "BTC",
          "coin2": "USD",
          "sourceRef": "bitstamp",
          "sourceRefDelay": 1000
        },
        {
          "type": "arbot",
          "botStepDelay": 30000,
          "coin1": "XMR",
          "coin2": "BTC",
          "sourceRef": "hitbtc",
          "sourceRefDelay": 1000,
          "sourceTrade": "cryptopia",
          "sourceTradeDelay": 300,
          "offsetPercent": [0.5, 0.6],
          "positionFraction": [0.50, 0.49],
          "minSTDEV": 0.25,
          "offsetSTDEV": [1, 2],
          "leadsSharedEvents": true
        },
        {
          "type": "arbot",
          "botStepDelay": 30000,
          "coin1": "LTC",
          "coin2": "BTC",
          "sourceRef": "gdax",
          "sourceRefDelay": 1000,
          "sourceTrade": "cryptopia",
          "sourceTradeDelay": 300,
          "offsetPercent": [0.45],
          "positionFraction": [0.9],
          "minSTDEV": 0.25,
          "offsetSTDEV": [1.5],
          "leadsSharedEvents": false
        }
      ]
    }

  Explanation of the bot parameters can be found as comments in `./elements/Bot.mjs' for now

  ## To run

  `npm start`





