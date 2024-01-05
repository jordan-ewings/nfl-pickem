import { getSheet } from '../util.js';

/* ------------------------------------------------ */

export const DATA = {
  fetch: getData,
  query: queryData,
}

/* ------------------------------------------------ */

async function getData() {

  DATA['SeasonInfo'] = await getSheet('SeasonInfo');
  DATA['Games'] = await getSheet('Games');
  DATA['Responses'] = await getSheet('Responses');
  DATA['PlayerStats'] = await getSheet('PlayerStats');

  DATA.currweek = DATA.SeasonInfo.filter((x) => x.current == '1')[0]['week'];
  DATA.full = procData(DATA.Games, DATA.Responses);
  DATA.tblData = DATA.full.filter((x) => x.week == DATA.currweek)[0];

  console.log(DATA);
}

/* ------------------------------------------------ */

function queryData() {
  let data = DATA.full.map((x) => x.games).flat();
  return data;
}

/* ------------------------------------------------ */

function procData(dbGames, dbResponses) {

  let data = dbGames.map((game) => {
    let responses = dbResponses.filter((x) => x['game_id'] == game['game_id']);
    if (responses.length > 0) {
      game.responses = responses;
    }
    return game;
  });

  let weeks = data.map((x) => x['week']);
  weeks = weeks.filter((c, index) => weeks.indexOf(c) === index);
  let weeklydata = weeks.map((w) => {
    let games = data.filter((x) => x['week'] == w);
    let week_label = games[0]['week_label'];
    return {
      week: w,
      week_label: week_label,
      games: games
    }
  });

  return weeklydata;
}

