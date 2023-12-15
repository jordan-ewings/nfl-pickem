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

/* ------------------------------------------------ */

function procChartData(Stats) {

  let DATA = {
    Chart: {},
  };

  let data = Stats;
  let weeks = [...new Set(data.map((x) => x.week))];
  let labels = weeks.map((x) => 'WK ' + x);
  DATA.Chart.labels = labels;

  let fields = [
    { field: 'rank', min: 1, max: 9, reverse: true, stepSize: 1 },
    { field: 'games_back', reverse: true },
    { field: 'wpct', min: .45, max: .7 },
    { field: 'dog_pct', min: 0, max: .4 },
    { field: 'dog_wpct', min: .25, max: .65 },
  ].map((field) => {
    let f = field.field;
    let label = f.replace(/_/g, ' ');
    label = label.replace('wpct', 'Win %');
    label = label.replace('pct', '%');
    label = label.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
    label = label.replace('Games Back', 'GB');

    field.label = label;
    return field;
  });
  DATA.Chart.fields = fields;

  let players = [...new Set(data.map((x) => x.player))];
  DATA.Chart.players = players;

  // append rows ('players'): Average, High, Low
  weeks.forEach((w) => {
    let weekData = data.filter((x) => x.week == w);
    let cFields = fields.map((x) => x.field);
    let newRows = [
      { player: 'Average', week: w },
      { player: 'High', week: w },
      { player: 'Low', week: w },
    ];
    cFields.forEach((f) => {
      let f_reversed = fields.filter((x) => x.field == f)[0].reverse;
      let vals = weekData.map((x) => x[f]);
      let avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      if (f.includes('pct')) {
        avg = Math.round(avg * 100) / 100;
      } else {
        avg = Math.round(avg);
      }
      let high = Math.max(...vals);
      let low = Math.min(...vals);
      if (f_reversed) {
        high = Math.min(...vals);
        low = Math.max(...vals);
      }
      newRows[0][f] = avg;
      newRows[1][f] = high;
      newRows[2][f] = low;
      if (f == 'rank') {
        newRows[0]['rankLabel'] = avg;
        newRows[1]['rankLabel'] = high;
        newRows[2]['rankLabel'] = low;
      }
    });

    data = data.concat(newRows);
  });
  DATA.Chart.players = DATA.Chart.players.concat(['Average']);

  let cdata = data.map((x) => {
    let obj = {};
    let fields = Object.keys(x);
    fields = fields.filter((f) => !['rankOrder', 'rankVal', 'rankLabel'].includes(f));
    fields.forEach((f) => {
      let val = x[f];
      let display = val;
      if (f == 'rank') {
        val = x['rank'];
        display = x['rankLabel'];
      }
      if (f.includes('pct')) {
        display = Math.round(val * 100) + '%';
      }
      obj[f] = {
        v: val,
        d: display,
      };
    });
    return obj;
  });

  DATA.Chart.data = cdata;

  return DATA.Chart;
}

