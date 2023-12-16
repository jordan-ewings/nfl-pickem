
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
    let meta = DATA.Chart.live;
    if (meta.mode == 'byPlayer') {
      let field = meta.fields[0];
      if (field.reverse) return b.parsed - a.parsed;
      if (!field.reverse) return a.parsed - b.parsed;
    } else if (meta.mode == 'byStat') {
      if (a.label < b.label) return -1;
      if (a.label > b.label) return 1;
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