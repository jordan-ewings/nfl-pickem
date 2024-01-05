import { getSheet } from '../../js/util.js';

/* ------------------------------------------------ */

export const DATA = {
  fetch: getData,
  Stats: [],
}

/* ------------------------------------------------ */

async function getData() {

  let data = await getSheet('PlayerStats');

  data.forEach((x) => {
    let fields = Object.keys(x);
    let fieldsStr = ['player', 'rank'];
    let fieldsInt = fields.filter((f) => !fieldsStr.includes(f));
    let fieldsPct = fields.filter((f) => f.includes('pct'));
    fieldsInt = fieldsInt.filter((f) => !fieldsPct.includes(f));
    fieldsInt.forEach((f) => {
      x[f] = parseInt(x[f]);
    });
    fieldsPct.forEach((f) => {
      x[f] = parseFloat(x[f]);
    });
    let rankVal = x.rankVal;
    let rankLabel = x.rank;
    x.rank = rankVal;
    x.rankLabel = rankLabel;
    delete x.rankVal;

    x.wk_record = x.wk_wins + '-' + x.wk_losses;
    x.record = x.wins + '-' + x.losses;
    // x.games_back = x.games_back == 0 ? '-' : x.games_back.toFixed(0);
    x.week_label = 'Week ' + x.week;
  });

  data.forEach((x, i) => {
    let week = x.week;
    let player = x.player;
    let rank = x.rank;
    if (week == 1) {
      x.rankChange = '-';
      return;
    }
    let prevWeek = week - 1;
    let prevRank = data.filter((y) => y.week == prevWeek && y.player == player)[0].rank;
    let rankChange = rank - prevRank;
    rankChange = -rankChange;
    x.rankChange = rankChange;
  })

  console.log('DATA', data);

  DATA.Stats = data;
}