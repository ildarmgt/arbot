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

  ## To run

  `npm start`





