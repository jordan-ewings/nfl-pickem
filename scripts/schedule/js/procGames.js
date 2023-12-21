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

/* ------------------------------------------------ */

// async function fetchLive(week) {

//   console.log('FETCHING LIVE');
//   const resp = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?seasontype=2&dates=2023&week=' + week);
//   const raw = await resp.text();
//   const events = JSON.parse(raw)['events'];

//   const proc = events.map((game) => {

//     let comp = game.competitions[0];
//     let hid = comp.competitors[0].id;
//     let aid = comp.competitors[1].id;

//     let data = {};
//     data.game_id = game.id;
//     data.week = game.week.number;
//     data.home_score = game.competitions[0].competitors[0].score;
//     data.away_score = game.competitions[0].competitors[1].score;
//     data.state = game.status.type.state;
//     data.stateshort = game.status.type.shortDetail;
//     data.home_poss = '0';
//     data.away_poss = '0';

//     if (comp.situation) {
//       if (comp.situation.possession) {
//         let pid = comp.situation.possession;
//         if (pid == hid) data.home_poss = '1';
//         if (pid == aid) data.away_poss = '1';
//         data.poss_loc = comp.situation.possessionText;
//         data.poss_dd = comp.situation.shortDownDistanceText;
//       }
//     }

//     return data;
//   });

//   console.log(proc);
//   return proc;
// }

// /* ------------------------------------------------ */

// function updateData(proc, live) {
//   console.log('UPDATING LIVE');
//   let week = live[0].week.toString();
//   let data = proc.map((w) => {
//     if (w.week == week) {
//       w.games = w.games.map((game) => {
//         let g = game;
//         let glive = live.filter((x) => x.game_id == g.game_id)[0];
//         g.away_score = glive.away_score;
//         g.home_score = glive.home_score;
//         g.state = glive.state;
//         g.stateshort = glive.stateshort;
//         g.away_poss = glive.away_poss;
//         g.home_poss = glive.home_poss;
//         g.poss_loc = glive.poss_loc;
//         g.poss_dd = glive.poss_dd;
//         let ascore = parseInt(glive.away_score);
//         let hscore = parseInt(glive.home_score);

//         if (g.state == 'post') {
//           if (ascore > hscore) {
//             g.win_team = g.away_team;
//           } else if (hscore > ascore) {
//             g.win_team = g.home_team;
//           } else {
//             g.win_team = 'TIE';
//           }
//         }
//         return g;
//       });
//     }
//     return w;
//   });

//   // console.log(data);
//   return data;
// }
