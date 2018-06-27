import Bot from '../elements/Bot'; // import Bot class

import settings from '../settings.json'; // import my personal initial bot settings

/**
 * Loads initial settings from settings.json
 */
export default function initializeSettings (st) {

  // add each bot using imported settings.json with unique botId that's incremented by 1

  settings.bots.forEach(eaBotSetting => {
    st.bots.push(new Bot({...eaBotSetting, id: st.botId++}));
  });

}
