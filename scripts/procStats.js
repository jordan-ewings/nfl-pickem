/* ------------------------------------------------ */

function procStats(PlayerStats) {
  let raw = PlayerStats;
  raw.forEach((x) => {
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

  // add 'rankChange' field
  // for each player, it will be the change in rank from the previous week
  // for the first week, it will be 0
  raw.forEach((x, i) => {
    let week = x.week;
    let player = x.player;
    let rank = x.rank;
    if (week == 1) {
      x.rankChange = 0;
      return;
    }
    let prevWeek = week - 1;
    let prevRank = raw.filter((y) => y.week == prevWeek && y.player == player)[0].rank;
    let rankChange = rank - prevRank;
    // invert the sign of rankChange to make it more intuitive
    rankChange = -rankChange;
    x.rankChange = rankChange;
  })


  let data = raw;

  return data;
}
