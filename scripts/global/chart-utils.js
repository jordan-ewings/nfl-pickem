
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

function getColor(name) {
  let colors = getColorPalette();
  let color = colors.filter((x) => x.name == name)[0].value;
  return color;
}

function setColorAlpha(value, alpha) {
  let color = value;
  let fmt = '';
  if (value.includes('rgb')) fmt = 'rgb';
  if (value.includes('rgba')) fmt = 'rgba';
  if (fmt == '') return value;

  let colorArr = color.replace(fmt, '').replace('(', '').replace(')', '').split(',');
  let colorAlpha = alpha;
  let colorAlphaStr = colorAlpha.toString();
  let colorAlphaArr = colorArr;
  if (colorArr.length == 3) {
    colorAlphaArr.push(colorAlphaStr);
  } else if (colorArr.length == 4) {
    colorAlphaArr[3] = colorAlphaStr;
  }

  let colorAlphaStrFmt = 'rgba(' + colorAlphaArr.join(',') + ')';
  return colorAlphaStrFmt;
}

function getChartOptions() {

  let colors = {
    defaultText: 'rgb(255, 255, 255, .85)',
    legendText: 'rgb(255, 255, 255, .75)',
    axisText: 'rgb(255, 255, 255, .6)',
    gridLine: 'rgb(255, 255, 255, .05)',
    tooltipBg: 'rgba(0, 0, 0, .8)',
    tooltipTitle: 'rgba(255, 255, 255, .85)',
    tooltipBody: 'rgba(255, 255, 255, .85)',
  };

  let fonts = {
    default: { size: 12, weight: '500' },
    legend: { size: 14, weight: '500' },
    axis: { size: 12, weight: '500' },
    tooltipTitle: { size: 14, weight: '500' },
    tooltipBody: { size: 12, weight: '500' },
  };

  // set default line/point styles
  let c = {
    color: 'rgba(10, 132, 255, 1)',
    colorAlpha: 'rgba(10, 132, 255, .2)',
  };

  // set default element styles
  let elements = {};
  elements.line = {
    fill: false,
    borderWidth: 3,
    tension: 0.4,
    // borderColor: c.color,
    // backgroundColor: c.colorAlpha,
  };

  elements.point = {
    radius: 3,
    borderWidth: 1,
    hoverRadius: 6,
    // borderColor: c.color,
    // backgroundColor: c.color,
  };

  let title = {};
  title.display = false;

  let legend = {};
  legend.display = true;
  legend.position = 'top';
  legend.align = 'center';
  legend.labels = {};
  legend.labels.color = colors.legendText;
  legend.labels.padding = 20;
  legend.labels.usePointStyle = true;
  legend.labels.font = fonts.legend;
  legend.labels.pointStyle = 'rect';
  // padding below legend
  legend.padding = 20;

  let x = {};
  x.offset = true;
  x.border = {};
  x.border.display = false;
  x.grid = {};
  x.grid.display = true;
  x.grid.drawOnChartArea = false;
  x.grid.color = colors.gridLine;
  x.grid.drawTicks = true;
  x.grid.drawBorder = false;
  x.ticks = {};
  x.ticks.color = colors.axisText;
  x.ticks.padding = 8;
  x.ticks.maxRotation = 90;
  x.ticks.minRotation = 90;


  let y = {};
  y.offset = true;
  y.position = 'left';
  y.reverse = false;
  y.border = {};
  y.border.display = false;
  y.grid = {};
  y.grid.color = colors.gridLine;
  y.grid.drawTicks = false;
  y.grid.drawBorder = false;
  y.ticks = {};
  y.ticks.color = colors.axisText;
  y.ticks.padding = 3;
  y.ticks.includeBounds = false;

  let y1 = JSON.parse(JSON.stringify(y));
  y1.position = 'right';
  y1.display = 'auto';
  y1.grid.drawOnChartArea = false;

  let ticksCallback = function (value, index, ticks) {
    let vals = ticks.map((x) => x.value);
    let min = Math.min(...vals);
    let max = Math.max(...vals);
    let isPctData = min >= 0 && max <= 1;
    if (isPctData) {
      return Math.round(value * 100) + '%';
    } else {
      return value;
    }
  };

  y.ticks.callback = ticksCallback;
  y1.ticks.callback = ticksCallback;

  let tooltip = {};
  tooltip.enabled = true;
  tooltip.backgroundColor = colors.tooltipBg;
  tooltip.titleColor = colors.tooltipTitle;
  tooltip.bodyColor = colors.tooltipBody;
  tooltip.titleFont = fonts.tooltipTitle;
  tooltip.bodyFont = fonts.tooltipBody;
  tooltip.padding = 8;
  tooltip.cornerRadius = 4;
  tooltip.borderWidth = 0;
  tooltip.boxPadding = 3;
  tooltip.bodySpacing = 3;
  tooltip.itemSort = function (a, b, data) {
    let active = DATA.Chart.active;
    if (active.players.length > 1) {
      // get data for each player
      let fieldMeta = a.dataset.meta.fieldInfo;
      if (fieldMeta.reverse == true) return a.parsed.y - b.parsed.y;
      if (fieldMeta.reverse == false) return b.parsed.y - a.parsed.y;
      return 0;
    } else if (active.players.length == 1) {
      // dont need to sort
      return 0;
    }
  };

  tooltip.callbacks = {};
  tooltip.callbacks.label = function (context) {
    let name = context.dataset.label;
    let value = context.dataset.data[context.dataIndex].display;
    let label = name + ': ' + value;
    return label;
  };

  let options = {
    responsive: true,
    maintainAspectRatio: false,
    elements: elements,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      title: title,
      legend: legend,
      tooltip: tooltip,
    },
    scales: {
      x: x,
      y: y,
      y1: y1,
    },
  };

  return options;
}