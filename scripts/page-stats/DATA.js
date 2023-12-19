/* ------------------------------------------------ */

function procChartData(Stats) {

  let DATA = {
    Chart: {},
  };

  let data = Stats;
  let weeks = [...new Set(data.map((x) => x.week))];
  let labels = weeks.map((x) => 'WK ' + x);
  DATA.Chart.labels = labels;

  let fieldNames = ['rank', 'games_back', 'wpct', 'dog_pct', 'dog_wpct'];
  let fields = fieldNames.map((f) => {
    let label = f.replace(/_/g, ' ');
    label = label.replace('wpct', 'Win %');
    label = label.replace('pct', '%');
    label = label.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
    label = label.replace('Games Back', 'GB');

    let min = Math.min(...data.map((x) => x[f]));
    let max = Math.max(...data.map((x) => x[f]));
    let revFields = ['rank', 'games_back'];
    let reverse = revFields.includes(f);

    let type = '';
    if (f.includes('pct')) type = 'pct';
    if (!f.includes('pct')) {
      if (!reverse) type = 'intAsc';
      if (reverse) type = 'intDesc';
    }

    return {
      field: f,
      label: label,
      min: min,
      max: max,
      reverse: reverse,
      type: type,
    };
  });
  DATA.Chart.fields = fields;

  let players = [...new Set(data.map((x) => x.player))];
  DATA.Chart.players = players;

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

  let datasets = [];
  DATA.Chart.players.forEach((player) => {
    DATA.Chart.fields.forEach((fieldMeta) => {
      let playerData = DATA.Chart.data.filter((x) => x.player.v == player);
      let field = fieldMeta.field;
      let dataset = {
        meta: {
          playerName: player,
          fieldName: field,
          fieldInfo: fieldMeta,
        },
        data: playerData.map((x) => {
          let cjs = {
            x: x.week.v,
            y: x[field].v,
            display: x[field].d,
          };
          return { ...x, ...cjs };
        }),
      };
      datasets.push(dataset);
    });
  });

  DATA.Chart.datasets = datasets;

  DATA.Chart.active = {
    players: [],
    fields: [],
  };

  return DATA.Chart;
}

/* ------------------------------------------------ */

function procStandings() {
  let raw = DATA.Stats;

  let weeks = [...new Set(raw.map((g) => g.week))];
  let players = [...new Set(raw.map((g) => g.player))];
  let data = {};
  players.forEach((p) => {
    let playerData = raw.filter((g) => g.player == p);
    data[p] = [];
    weeks.forEach((w) => {
      let weekData = playerData.find((g) => g.week == w);
      data[p].push(weekData);
    });
  });

  let currWeek = weeks[weeks.length - 1];
  let standings = [];
  Object.keys(data).forEach((p) => {
    let playerData = data[p];
    let sData = playerData.find((g) => g.week == currWeek);
    let s = {
      rankOrder: sData.rankOrder,
      rank: sData.rankLabel,
      player: sData.player,
      changeVal: sData.rankChange,
      change: sData.rankChange == 0 ? '-' : sData.rankChange.toFixed(0),
      rec_week: sData.wk_wins + '-' + sData.wk_losses,
      rec: sData.wins + '-' + sData.losses,
      gb: sData.games_back == 0 ? '-' : sData.games_back.toFixed(0),
      pc_dog_pick: (sData.dog_pct * 100).toFixed(0) + '%',
      pc_dog_win: (sData.dog_wpct * 100).toFixed(0) + '%',
      history: playerData
    };
    standings.push(s);
  });

  standings.sort((a, b) => {
    if (a.rankOrder < b.rankOrder) {
      return -1;
    } else if (a.rankOrder > b.rankOrder) {
      return 1;
    } else {
      return 0;
    }
  });

  return standings;
}
