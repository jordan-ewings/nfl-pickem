/* ------------------------------------------------ */

function updateChart(options = {}) {

  let canvas = document.getElementById('chart');
  if (!canvas.hasAttribute('generated')) {
    generateChart();
    canvas.setAttribute('generated', '');
  }

  let meta = DATA.Chart.live;
  if (options.mode) meta.mode = options.mode;
  if (options.fields) meta.fields = options.fields;
  if (options.players) meta.players = options.players;
  console.log(meta);

  let players = meta.players;
  let fields = meta.fields;
  let mode = meta.mode;
  let fieldOptions = DATA.Chart.fields;
  let chartData = DATA.Chart.data;

  let datasets = chart.config.data.datasets;
  let scales = chart.config.options.scales;

  if (mode == 'byPlayer') {
    let field = fields[0];
    let fieldMeta = fieldOptions.filter((x) => x.field == field)[0];
    scales.y.min = fieldMeta.min;
    scales.y.max = fieldMeta.max;
    scales.y.reverse = fieldMeta.reverse;

    players.forEach((player) => {
      let dataset = {};
      dataset.type = 'line';
      dataset.label = player;
      dataset.data = chartData
        .filter((x) => x.player.v == player)
        .map((x) => {
          return Object.assign(x, {
            x: x.week.v,
            y: x[field].v,
            display: x[field].d,
            fieldMeta: fieldMeta,
          })
        });
      datasets.push(dataset);
    });

    chart.update();
    return;
  }

  if (mode == 'byStat') {

    let colors = [
      // light blue
      { color: 'rgba(10, 132, 255, 0.7)', colorAlpha: 'rgba(10, 132, 255, 0.3)' },
      // salmon
      { color: 'rgba(255, 99, 132, 0.7)', colorAlpha: 'rgba(255, 99, 132, 0.3)' },
    ];

    let player = players[0];
    let fieldMetas = fieldOptions.filter((x) => fields.includes(x.field));
    fieldMetas.sort((a, b) => {
      // sort by a.field/b.field according to order of fields array
      let aIndex = fields.indexOf(a.field);
      let bIndex = fields.indexOf(b.field);
      if (aIndex < bIndex) return -1;
      if (aIndex > bIndex) return 1;
      return 0;
    });
    fieldMetas = fieldMetas.map((x, index) => {
      let yAxis = 'y';
      if (index > 0) yAxis = 'y1';
      x.yAxis = yAxis;

      // set 
      return x;
    });

    let suggestedRange = true;
    let minField = (suggestedRange) ? 'suggestedMin' : 'min';
    let maxField = (suggestedRange) ? 'suggestedMax' : 'max';

    let fieldMeta1 = fieldMetas[0];
    if (fieldMeta1.reverse) scales.y.reverse = true;
    scales.y[minField] = fieldMeta1.min;
    scales.y[maxField] = fieldMeta1.max;

    if (fields.length > 1) {
      let fieldMeta2 = fieldMetas[1];
      if (fieldMeta2.reverse) scales.y1.reverse = true;
      scales.y1[minField] = fieldMeta2.min;
      scales.y1[maxField] = fieldMeta2.max;
    }

    fields.forEach((field, index) => {
      let fieldMeta = fieldMetas.filter((x) => x.field == field)[0];
      let yAxis = fieldMeta.yAxis;
      let dataset = {};
      dataset.type = 'line';
      dataset.label = fieldMeta.label;
      dataset.data = chartData
        .filter((x) => x.player.v == player)
        .map((x) => {
          let cdata = {
            x: x.week.v,
            y: x[field].v,
            display: x[field].d,
            fieldMeta: fieldMeta,
          };
          return { ...x, ...cdata };
        });
      dataset.yAxisID = yAxis;
      dataset.borderColor = colors[index].color;
      dataset.backgroundColor = colors[index].colorAlpha;
      dataset.pointBackgroundColor = colors[index].colorAlpha;
      dataset.pointBorderColor = colors[index].color;
      datasets[index] = dataset;
    });

    chart.update();
    return;
  }
}

/* ------------------------------------------------ */

function generateChart() {

  let ctx = document.getElementById('chart').getContext('2d');
  let options = getChartOptions();
  let config = {
    type: 'line',
    data: {
      labels: DATA.Chart.labels,
      datasets: [],
    },
    options: options,
  };

  // config.options.plugins.legend.display = false;

  chart = new Chart(ctx, config);

  // to store metadata about chart being displayed
  DATA.Chart.live = {
    'mode': 'byStat',
    'players': [],
    'fields': ['rank', 'wpct'],
  };
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
    return {
      field: f,
      label: label,
      min: min,
      max: max,
      reverse: reverse,
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
