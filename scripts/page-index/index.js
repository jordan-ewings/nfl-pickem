/* ------------------------------------------------ */

function updateChart(options = {}) {

  let canvas = document.getElementById('chart');
  if (!canvas.hasAttribute('generated')) {
    generateChart();
    // generateFieldPicker();
    canvas.setAttribute('generated', '');
  }

  // let sets = DATA.Chart.datasets;
  let datasets = chart.config.data.datasets;
  let sets = DATA.Chart.datasets;
  if (datasets.length == 0) {
    let field = (options.field) ? options.field : 'rank';
    let player = (options.player) ? options.player : 'Jordan';
    let dataset = sets.filter((x) => x.meta.playerName == player && x.meta.fieldName == field)[0];
    datasets.push(dataset);
  }

  let activePlayers = [... new Set(datasets.map((x) => x.meta.playerName))];
  let activeFields = [... new Set(datasets.map((x) => x.meta.fieldName))];

  if (options.field) {
    let field = options.field;
    let action = 'add';
    if (field.startsWith('-')) {
      action = 'remove';
      field = field.replace('-', '');
    }

    if (action == 'add') {
      activePlayers.forEach((player) => {
        let isShown = datasets.filter((x) => x.meta.playerName == player && x.meta.fieldName == field).length > 0;
        if (isShown) return;
        let dataset = sets.filter((x) => x.meta.playerName == player && x.meta.fieldName == field)[0];
        datasets.push(dataset);
      });
    } else if (action == 'remove') {
      datasets = datasets.filter((x) => x.meta.fieldName != field);
    }
  }

  if (options.player) {
    let player = options.player;
    let action = 'add';
    if (player.startsWith('-')) {
      action = 'remove';
      player = player.replace('-', '');
    }

    if (action == 'add') {
      activeFields.forEach((field) => {
        let isShown = datasets.filter((x) => x.meta.playerName == player && x.meta.fieldName == field).length > 0;
        if (isShown) return;
        let dataset = sets.filter((x) => x.meta.playerName == player && x.meta.fieldName == field)[0];
        datasets.push(dataset);
      });
    } else if (action == 'remove') {
      datasets = datasets.filter((x) => x.meta.playerName != player);
    }
  }

  chart.config.data.datasets = datasets;
  // pass data/chart to external function to update chart
  handleDatasetChange(chart);
  // chart.update();
}

function getColorPalette() {
  let colors = [
    { name: 'blue', value: 'rgba(10, 132, 255, 1)' },
    { name: 'salmon', value: 'rgba(255, 99, 132, 1)' },
    { name: 'green', value: 'rgba(0, 255, 0, 1)' },
    { name: 'yellow', value: 'rgba(255, 255, 0, 1)' },
    { name: 'orange', value: 'rgba(255, 165, 0, 1)' },
    { name: 'purple', value: 'rgba(128, 0, 128, 1)' },
    { name: 'pink', value: 'rgba(255, 192, 203, 1)' },
    { name: 'brown', value: 'rgba(165, 42, 42, 1)' },
    { name: 'gray', value: 'rgba(128, 128, 128, 1)' },
    { name: 'black', value: 'rgba(0, 0, 0, 1)' },
  ];
  return colors;
}

function handleDatasetChange(chart) {
  // need to set labels, colors, and scales
  let datasets = chart.config.data.datasets;
  if (datasets.length == 0) {
    chart.clear();
    return;
  }

  let players = [...new Set(datasets.map((x) => x.meta.playerName))];
  let sOpts = getScaleOptions(datasets);
  console.log(sOpts);
  let mode = (players.length > 1) ? 'byPlayer' : 'byStat';
  let colors = getColorPalette();
  colors = colors.map((x) => x.value);

  if (mode == 'byPlayer') {
    datasets.forEach((dataset, index) => {
      let newDefs = {
        yAxisID: 'y',
        label: dataset.meta.playerName,
        borderColor: colors[index],
        backgroundColor: setColorAlpha(colors[index], 0.3),
        pointBackgroundColor: setColorAlpha(colors[index], 0.3),
        pointBorderColor: colors[index],
      };
      Object.assign(dataset, newDefs);
    });
  }

  if (mode == 'byStat') {
    datasets.forEach((dataset, index) => {
      let field = dataset.meta.fieldName;
      let yAxisID = 'y';
      if (sOpts.y1) {
        if (sOpts.y1.fields.includes(field)) yAxisID = 'y1';
      }

      let newDefs = {
        label: dataset.meta.fieldInfo.label,
        yAxisID: yAxisID,
        borderColor: colors[index],
        backgroundColor: setColorAlpha(colors[index], 0.3),
        pointBackgroundColor: setColorAlpha(colors[index], 0.3),
        pointBorderColor: colors[index],
      };
      Object.assign(dataset, newDefs);
    });
  }

  let suggestedRange = true;
  let minField = (suggestedRange) ? 'suggestedMin' : 'min';
  let maxField = (suggestedRange) ? 'suggestedMax' : 'max';
  let scales = chart.config.options.scales;
  let yAxisIDs = ['y', 'y1'];
  yAxisIDs.forEach((yAxisID) => {
    let ax = scales[yAxisID];
    let axOpts = sOpts[yAxisID];
    if (!axOpts) {
      ax.reverse = null;
      ax[minField] = null;
      ax[maxField] = null;
      return;
    }
    // if (axOpts.type == 'pct') {
    //   ax.reverse = false;
    //   ax[minField] = null;
    //   ax[maxField] = null;
    // } else {
    ax.reverse = axOpts.reverse;
    ax[minField] = axOpts.min;
    ax[maxField] = axOpts.max;
    // }
    scales[yAxisID] = ax;
  });

  console.log(scales);


  chart.update();

}

function getScaleOptions(datasets) {

  // get all unique field metas, then assign each to a y-axis
  let fieldMetas = [...new Set(datasets.map((x) => x.meta.fieldInfo))];
  let fieldTypes = [...new Set(fieldMetas.map((x) => x.type))];
  fieldMetas.sort((a, b) => {
    let aIndex = fieldTypes.indexOf(a.type);
    let bIndex = fieldTypes.indexOf(b.type);
    if (aIndex < bIndex) return -1;
    if (aIndex > bIndex) return 1;
    return 0;
  });

  let axTypes = {};
  fieldMetas.forEach((x, index) => {
    // let fieldMetaSet = fieldMetas.filter((y) => y.type == x);

    if (!axTypes.y) {
      axTypes.y = {};
      axTypes.y.type = x.type;
      axTypes.y.fields = [x.field];
      axTypes.y.reverse = x.reverse;
      axTypes.y.min = x.min;
      axTypes.y.max = x.max;
      return;
    }
    if (!axTypes.y1) {
      // only if the remaining field types aren't different
      if (index < fieldMetas.length - 1) {
        let remainingFieldMetas = fieldMetas.slice(index + 1);
        let remainingFieldTypes = [...new Set(remainingFieldMetas.map((j) => j.type))];
        remainingFieldTypes = remainingFieldTypes.filter((j) => j != x.type);
        if (remainingFieldTypes.length > 0) {
          return;
        }
      }
      axTypes.y1 = {};
      axTypes.y1.type = x.type;
      axTypes.y1.fields = [x.field];
      axTypes.y1.reverse = x.reverse;
      axTypes.y1.min = x.min;
      axTypes.y1.max = x.max;
      return;
    }
    if (axTypes.y1.type == x.type) {
      axTypes.y1.fields.push(x.field);
      // update min/max
      if (x.min < axTypes.y1.min) axTypes.y1.min = x.min;
      if (x.max > axTypes.y1.max) axTypes.y1.max = x.max;
      return;
    }
    if (axTypes.y.type == x.type) {
      axTypes.y.fields.push(x.field);
      // update min/max
      if (x.min < axTypes.y.min) axTypes.y.min = x.min;
      if (x.max > axTypes.y.max) axTypes.y.max = x.max;
      return;
    }

  });

  return axTypes;
}




// let fieldOptions = DATA.Chart.fields;
// let chartData = DATA.Chart.data;

// let datasets = chart.config.data.datasets;
// let scales = chart.config.options.scales;

// if (mode == 'byPlayer') {
//   let field = fields[0];
//   let fieldMeta = fieldOptions.filter((x) => x.field == field)[0];
//   scales.y.min = fieldMeta.min;
//   scales.y.max = fieldMeta.max;
//   scales.y.reverse = fieldMeta.reverse;

//   players.forEach((player) => {
//     let dataset = {};
//     dataset.type = 'line';
//     dataset.label = player;
//     dataset.data = chartData
//       .filter((x) => x.player.v == player)
//       .map((x) => {
//         return Object.assign(x, {
//           x: x.week.v,
//           y: x[field].v,
//           display: x[field].d,
//           fieldMeta: fieldMeta,
//         })
//       });
//     dataset.player = player;
//     dataset.field = field;
//     datasets.push(dataset);
//   });

//   console.log(datasets);

//   chart.update();
//   return;
// }

// if (mode == 'byStat') {

//   let colors = [
//     // light blue
//     { color: 'rgba(10, 132, 255, 0.7)', colorAlpha: 'rgba(10, 132, 255, 0.3)' },
//     // salmon
//     { color: 'rgba(255, 99, 132, 0.7)', colorAlpha: 'rgba(255, 99, 132, 0.3)' },
//   ];

//   let player = players[0];
//   let fieldMetas = fieldOptions.filter((x) => fields.includes(x.field));
//   fieldMetas.sort((a, b) => {
//     // sort by a.field/b.field according to order of fields array
//     let aIndex = fields.indexOf(a.field);
//     let bIndex = fields.indexOf(b.field);
//     if (aIndex < bIndex) return -1;
//     if (aIndex > bIndex) return 1;
//     return 0;
//   });
//   fieldMetas = fieldMetas.map((x, index) => {
//     let yAxis = 'y';
//     if (index > 0) yAxis = 'y1';
//     x.yAxis = yAxis;

//     // set 
//     return x;
//   });

//   let suggestedRange = true;
//   let minField = (suggestedRange) ? 'suggestedMin' : 'min';
//   let maxField = (suggestedRange) ? 'suggestedMax' : 'max';

//   let fieldMeta1 = fieldMetas[0];
//   if (fieldMeta1.reverse) scales.y.reverse = true;
//   scales.y[minField] = fieldMeta1.min;
//   scales.y[maxField] = fieldMeta1.max;

//   if (fields.length > 1) {
//     let fieldMeta2 = fieldMetas[1];
//     if (fieldMeta2.reverse) scales.y1.reverse = true;
//     scales.y1[minField] = fieldMeta2.min;
//     scales.y1[maxField] = fieldMeta2.max;
//   }

//   fields.forEach((field, index) => {
//     let fieldMeta = fieldMetas.filter((x) => x.field == field)[0];
//     let yAxis = fieldMeta.yAxis;
//     let dataset = {};
//     dataset.type = 'line';
//     dataset.label = fieldMeta.label;
//     dataset.data = chartData
//       .filter((x) => x.player.v == player)
//       .map((x) => {
//         let cdata = {
//           x: x.week.v,
//           y: x[field].v,
//           display: x[field].d,
//           fieldMeta: fieldMeta,
//         };
//         return { ...x, ...cdata };
//       });
//     dataset.player = player;
//     dataset.field = field;
//     dataset.yAxisID = yAxis;
//     dataset.borderColor = colors[index].color;
//     dataset.backgroundColor = colors[index].colorAlpha;
//     dataset.pointBackgroundColor = colors[index].colorAlpha;
//     dataset.pointBorderColor = colors[index].color;
//     datasets[index] = dataset;
//   });

//   console.log(datasets);

//   chart.update();
//   return;
// }
// }

function generateFieldPicker() {
  // toggle buttons for fields
  let group = document.createElement('div');
  group.classList.add('btn-group');
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', 'Field Picker');
  group.setAttribute('id', 'fieldPicker');

  let fields = DATA.Chart.fields;
  fields.forEach((field) => {
    let btn = document.createElement('button');
    btn.classList.add('btn', 'btn-sm', 'fieldPickerBtn');
    btn.setAttribute('type', 'button');
    btn.setAttribute('data-bs-toggle', 'button');
    btn.setAttribute('data-field', field.field);
    btn.innerHTML = field.label;
    btn.addEventListener('click', function () {
      let field = this.getAttribute('data-field');
      let toggledOn = this.classList.contains('active');
      if (!toggledOn) field = '-' + field;
      updateChart({ field: field });
    });
    group.appendChild(btn);
  });

  let container = document.getElementById('fieldPickerContainer');
  container.appendChild(group);
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
