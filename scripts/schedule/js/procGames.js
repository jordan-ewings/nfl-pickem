/* ------------------------------------------------ */

function procGames(dbGames, dbResponses) {
  let data = dbGames.map((game) => {
    let responses = dbResponses.filter((x) => x['game_id'] == game['game_id']);
    game.gametime_raw = game.gametime;
    game.gameday = game.gametime_short.split(' @ ')[0];
    game.gameday_long = game.gametime_long.split(' @ ')[0];
    game.gametime = game.gametime_short.split(' @ ')[1];
    game.away_logo = (game.away_team != 'TBD') ? game.away_logo.replace('500', '500-dark') : game.away_logo;
    game.home_logo = (game.home_team != 'TBD') ? game.home_logo.replace('500', '500-dark') : game.home_logo;
    let rec = [
      'game_id', 'gametime_raw', 'deadline', 'week', 'week_label', 'gameday_long', 'gameday', 'gametime', 'state', 'stateshort',
      'away_team', 'away_teamshort', 'away_teamfull', 'away_record', 'away_logo', 'away_score', 'away_color',
      'home_team', 'home_teamshort', 'home_teamfull', 'home_record', 'home_logo', 'home_score', 'home_color',
      'spread', 'win_team']
      .reduce((obj2, key) => (obj2[key] = game[key], obj2), {});

    if (responses.length > 0) {
      rec['responses'] = responses;
    }
    return rec;
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

  const proc = events.map((game) => {

    let comp = game.competitions[0];
    let hid = comp.competitors[0].id;
    let aid = comp.competitors[1].id;

    let data = {};
    data.game_id = game.id;
    data.week = game.week.number;
    data.home_score = game.competitions[0].competitors[0].score;
    data.away_score = game.competitions[0].competitors[1].score;
    data.state = game.status.type.state;
    data.stateshort = game.status.type.shortDetail;
    data.home_poss = '0';
    data.away_poss = '0';

    if (comp.situation) {
      if (comp.situation.possession) {
        let pid = comp.situation.possession;
        if (pid == hid) data.home_poss = '1';
        if (pid == aid) data.away_poss = '1';
        data.poss_loc = comp.situation.possessionText;
        data.poss_dd = comp.situation.shortDownDistanceText;
      }
    }

    return data;
  });

  console.log(proc);
  return proc;
}

/* ------------------------------------------------ */

function updateData(proc, live) {
  console.log('UPDATING LIVE');
  let week = live[0].week.toString();
  let data = proc.map((w) => {
    if (w.week == week) {
      w.games = w.games.map((game) => {
        let g = game;
        let glive = live.filter((x) => x.game_id == g.game_id)[0];
        g.away_score = glive.away_score;
        g.home_score = glive.home_score;
        g.state = glive.state;
        g.stateshort = glive.stateshort;
        g.away_poss = glive.away_poss;
        g.home_poss = glive.home_poss;
        g.poss_loc = glive.poss_loc;
        g.poss_dd = glive.poss_dd;
        let ascore = parseInt(glive.away_score);
        let hscore = parseInt(glive.home_score);

        if (g.state == 'post') {
          if (ascore > hscore) {
            g.win_team = g.away_team;
          } else if (hscore > ascore) {
            g.win_team = g.home_team;
          } else {
            g.win_team = 'TIE';
          }
        }
        return g;
      });
    }
    return w;
  });

  // console.log(data);
  return data;
}
