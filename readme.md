# Description

  Reads price on a big exchange and places orders on a smaller exchange with larger spread taking advantage of slippage.

# Status

  Testing. Hard coded for cryptopia for now.

# Instructions

  ## Requires

  * Node.js v10
  * I had to enable ntpd for more accurate clock on ubuntu 18.04 or it would have issues rapidly placing orders ([instructions](https://www.digitalocean.com/community/tutorials/how-to-set-up-time-synchronization-on-ubuntu-16-04))

  ## To create a folder with the bot

    git clone https://github.com/ildarmgt/arbot.git arbot

  ## Set up

    cd arbot
    npm install

  Need api keys for exchanges used for trading placed in a file in project root folder called `auth.json`

  Create it however (e.g. `touch auth.json`) and paste keys inside like this example for cryptopia:

    {
      "cryptopia": {
        "PUBLIC_KEY": "public key here",
        "PRIVATE_KEY": "secret private key here"
      }
    }

  Also need initial settings file (like what bots to run initially).
  In project root folder, create `settings.json` (e.g. `touch settings.json`) and fill with something like this example:

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



  ## To run

  `npm start`





