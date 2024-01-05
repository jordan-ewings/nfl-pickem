import { getSheet } from '../util.js';

/* ------------------------------------------------ */

export const DATA = {
  LOADED: false,
  TBL_LOADED: false,
  fetch: getData,
  query: queryData,
}

/* ------------------------------------------------ */

var USING_LIVE = true;

async function getData() {

  DATA['SeasonInfo'] = await getSheet('SeasonInfo');
  DATA['Games'] = await getSheet('Games');
  DATA['Responses'] = await getSheet('Responses');

  DATA.currweek = DATA.SeasonInfo.filter((x) => x.current == '1')[0]['week'];
  DATA.full = procGames(DATA.Games, DATA.Responses);
  if (USING_LIVE == true) {
    DATA.live = await fetchLive(DATA.currweek);
    DATA.full = updateData(DATA.full, DATA.live);
  }

  if (!DATA.tblGames) {
    DATA.tblGames = DATA.full.filter((x) => x.week == DATA.currweek)[0];
  } else {
    let tblWeek = DATA.tblGames.week;
    DATA.tblGames = DATA.full.filter((x) => x.week == tblWeek)[0];
  }

  if (DATA.LOADED == false) {
    document.getElementById('view-loading').classList.add('d-none');
    DATA.LOADED = true;
  }

  console.log(DATA);
}

/* ------------------------------------------------ */

function queryData() {
  let data = DATA.full.map((x) => x.games).flat();
  return data;
}

/* ------------------------------------------------ */

function procGames(dbGames, dbResponses) {

  let data = dbGames.map((game) => {

    game.gametime_raw = game.gametime;
    game.gameday = game.gametime_short.split(' @ ')[0];
    game.gameday_long = game.gametime_long.split(' @ ')[0];
    game.gametime = game.gametime_short.split(' @ ')[1];
    game.away_logo = (game.away_team != 'TBD') ? game.away_logo.replace('500', '500-dark') : game.away_logo;
    game.home_logo = (game.home_team != 'TBD') ? game.home_logo.replace('500', '500-dark') : game.home_logo;
    delete game.gametime_short; delete game.gametime_long;

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

/* ------------------------------------------------ */

async function fetchLive(week) {

  console.log('FETCHING LIVE');
  const resp = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?seasontype=2&dates=2023&week=' + week);
  const raw = await resp.text();
  const events = JSON.parse(raw)['events'];

  let proc = events.map((game) => {

    let data = {};
    data.game_id = game.id;
    game.competitions[0].competitors.map((r) => {
      let pref = r.homeAway;
      data[pref + '_id'] = r.id;
      data[pref + '_team'] = r.team.abbreviation;
      data[pref + '_teamshort'] = r.team.shortDisplayName;
      data[pref + '_teamfull'] = r.team.displayName;
      data[pref + '_score'] = r.score;
      data[pref + '_poss'] = '0';
    });

    data.state = game.status.type.state;
    data.stateshort = game.status.type.shortDetail;
    if (data.state == 'pre') {
      data.home_score = '';
      data.away_score = '';
    }

    data.win_team = '';
    data.win_teamshort = '';
    data.win_teamfull = '';
    if (data.state == 'post') {
      let home_score = parseInt(data.home_score);
      let away_score = parseInt(data.away_score);
      if (home_score > away_score) {
        data.win_team = data.home_team;
        data.win_teamshort = data.home_teamshort;
        data.win_teamfull = data.home_teamfull;
      } else if (home_score < away_score) {
        data.win_team = data.away_team;
        data.win_teamshort = data.away_teamshort;
        data.win_teamfull = data.away_teamfull;
      } else {
        data.win_team = 'TIE';
        data.win_teamshort = 'TIE';
        data.win_teamfull = 'TIE';
      }
    }


    if (!game.competitions[0].situation) return data;
    let comp = game.competitions[0];
    if (comp.situation.possession) {
      data.poss_loc = comp.situation.possessionText;
      data.poss_dd = comp.situation.shortDownDistanceText;
      let pid = comp.situation.possession;
      if (pid == data.home_id) data.home_poss = '1';
      if (pid == data.away_id) data.away_poss = '1';
    }

    delete data.home_id; delete data.away_id;

    return data;
  });

  console.log(proc);
  return proc;
}

/* ------------------------------------------------ */

function updateData(proc, live) {

  console.log('UPDATING LIVE');
  let data = proc.map((w) => {

    w.games = w.games.map((g) => {
      let glive = live.filter((x) => x.game_id == g.game_id);
      if (glive.length == 1) {
        glive = glive[0];
        for (let key in glive) {
          g[key] = glive[key];
        }
      }

      if (g.responses) {
        g.responses = g.responses.map((r) => {
          if (g.state == 'post' && r.f_win == '') {
            r.f_win = (r.status == 'OK' && r.pick_team == g.win_team) ? '1' : '0';
          }
          return r;
        });
      }

      return g;
    });
    return w;
  });

  console.log(data);
  return data;
}
