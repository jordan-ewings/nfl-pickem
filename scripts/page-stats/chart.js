/* ------------------------------------------------ */

function updateChart(e = null, options = {}) {

  let canvas = document.getElementById('chart');
  if (!canvas.hasAttribute('generated')) {
    generateChart();
    canvas.setAttribute('generated', '');
  }

  let inputType = '';
  if (e) inputType = 'event';
  if (Object.keys(options).length > 0) inputType = 'options';
  if (inputType == '') inputType = 'defaults';

  if (inputType == 'defaults') {
    let fields = DATA.Chart.active.fields;
    let players = DATA.Chart.active.players;
    let sets = DATA.Chart.datasets;
    sets = sets.filter((x) => fields.includes(x.meta.fieldName));
    sets = sets.filter((x) => players.includes(x.meta.playerName));
    chart.config.data.datasets = sets;

  } else if (inputType == 'event') {
    let el = e.target;
    let option = el.getAttribute('data-name');
    let value = el.getAttribute('data-value');
    let checked = el.checked;
    let mode = (checked) ? 'add' : 'remove';
    if (el.getAttribute('type') == 'radio') mode = 'replace';
    options[option] = value;
    options.mode = mode;
    toggleDatasets(chart, options);

  } else if (inputType == 'options') {
    toggleDatasets(chart, options);

  }

  updateChartDatasetFormats(chart);
  updateChartOptions(chart);

  console.log(DATA.Chart.active);
  chart.update();
}

function toggleDatasets(chart, options) {
  let active = DATA.Chart.active;
  let datasets = chart.config.data.datasets;
  let sets = DATA.Chart.datasets;

  let type = (options.field) ? 'field' : 'player';
  let alt = (type == 'field') ? 'player' : 'field';
  let val = options[type];
  let mode = options.mode;
  let activeVals = active[type + 's'];
  let activeAltVals = active[alt + 's'];
  sets = sets.filter((x) => x.meta[type + 'Name'] == val);

  if (mode == 'add') {
    activeVals.push(val);
    activeAltVals.forEach((altVal) => {
      let set = sets.filter((x) => x.meta[alt + 'Name'] == altVal)[0];
      let isShown = datasets.filter((x) => x.meta[alt + 'Name'] == altVal && x.meta[type + 'Name'] == val).length > 0;
      if (isShown) return;
      datasets.push(set);
    });
  } else if (mode == 'remove') {
    activeVals = activeVals.filter((x) => x != val);
    datasets = datasets.filter((x) => x.meta[type + 'Name'] != val);
  } else if (mode == 'replace') {
    activeVals = [val];
    datasets = sets.filter((x) => activeAltVals.includes(x.meta[alt + 'Name']));
  }

  chart.config.data.datasets = datasets;
  DATA.Chart.active[type + 's'] = activeVals;
}

/* ------------------------------------------------ */

function updateChartDatasetFormats(chart) {

  let datasets = chart.config.data.datasets;
  let players = [...new Set(datasets.map((x) => x.meta.playerName))];
  let mode = (players.length > 1) ? 'byPlayer' : 'byStat';

  let colors = getColorPalette();
  colors = colors.map((x) => x.value);
  datasets.forEach((dataset, index) => {
    let label = dataset.meta.fieldInfo.label;
    if (mode == 'byPlayer') label = dataset.meta.playerName;
    let newDefs = {
      label: label,
      borderColor: colors[index],
      backgroundColor: setColorAlpha(colors[index], 0.3),
      pointBackgroundColor: setColorAlpha(colors[index], 0.3),
      pointBorderColor: colors[index],
    };
    Object.assign(dataset, newDefs);
  });
  chart.config.data.datasets = datasets;
}

/* ------------------------------------------------ */

function updateChartOptions(chart) {

  let datasets = chart.config.data.datasets;
  let scaleOptions = getScaleOptions(datasets);
  datasets.forEach((dataset) => {
    let field = dataset.meta.fieldName;
    let yAxisID = 'y';
    if (scaleOptions.y1) {
      if (scaleOptions.y1.fields.includes(field)) yAxisID = 'y1';
    }
    dataset.yAxisID = yAxisID;
  });
  chart.config.data.datasets = datasets;

  let scales = chart.config.options.scales;
  let yAxisIDs = ['y', 'y1'];
  yAxisIDs.forEach((yAxisID) => {
    let ax = scales[yAxisID];
    let axOpts = scaleOptions[yAxisID];
    if (!axOpts) return;
    ax.reverse = axOpts.reverse;
    if (axOpts.fields.includes('rank')) {
      ax.suggestedMin = 1;
      ax.suggestedMax = 9;
    } else {
      ax.suggestedMin = null;
      ax.suggestedMax = null;
    }
    scales[yAxisID] = ax;
  });

  chart.config.options.scales = scales;
}

/* ------------------------------------------------ */

function getScaleOptions(datasets) {

  // get all unique field metas, then assign each to a y-axis
  let fieldMetas = [...new Set(datasets.map((x) => x.meta.fieldInfo))];
  let fieldTypes = [...new Set(fieldMetas.map((x) => x.type))];
  fieldMetas.sort((a, b) => {

    let aIndex = fieldTypes.indexOf(a.type);
    let bIndex = fieldTypes.indexOf(b.type);
    if (a.type != 'pct' && b.type == 'pct') return -1;
    if (a.type == 'pct' && b.type != 'pct') return 1;
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
      if (x.min < axTypes.y1.min) axTypes.y1.min = x.min;
      if (x.max > axTypes.y1.max) axTypes.y1.max = x.max;
      return;
    }
    if (axTypes.y.type == x.type) {
      axTypes.y.fields.push(x.field);
      if (x.min < axTypes.y.min) axTypes.y.min = x.min;
      if (x.max > axTypes.y.max) axTypes.y.max = x.max;
      return;
    }

  });

  return axTypes;
}



/* ------------------------------------------------ */

function generateChart() {

  let ctx = document.getElementById('chart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: DATA.Chart.labels,
      datasets: [],
    },
    options: getChartOptions(),
  });

  chart.options.plugins.legend.onClick = (e, legendItem) => {
    let tooltipShown = chart.options.plugins.tooltip.enabled;
    if (tooltipShown) {
      chart.options.plugins.tooltip.enabled = false;
      chart.update();
    }
  }

  chart.options.onClick = (e, activeElements) => {
    let tooltipShown = chart.options.plugins.tooltip.enabled;
    if (!tooltipShown) {
      chart.options.plugins.tooltip.enabled = true;
      chart.update();
    }

  }


}


