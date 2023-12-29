import { getSheet } from '../util.js';

/* ------------------------------------------------ */

export const DATA = {
  get: getPlayerStats,
}

/* ------------------------------------------------ */

async function getPlayerStats() {

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
  });

  data.forEach((x, i) => {
    let week = x.week;
    let player = x.player;
    let rank = x.rank;
    if (week == 1) {
      x.rankChange = 0;
      return;
    }
    let prevWeek = week - 1;
    let prevRank = data.filter((y) => y.week == prevWeek && y.player == player)[0].rank;
    let rankChange = rank - prevRank;
    rankChange = -rankChange;
    x.rankChange = rankChange;
  })

  console.log(data);

  DATA.Stats = data;
}