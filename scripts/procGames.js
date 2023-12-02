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
      'game_id', 'gametime_raw', 'week', 'week_label', 'gameday_long', 'gameday', 'gametime', 'state', 'stateshort',
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
