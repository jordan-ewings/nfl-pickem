
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

  let x = {};
  x.offset = true;
  x.grid = {};
  x.grid.display = false;
  x.grid.color = colors.gridLine;
  x.ticks = {};
  x.ticks.color = colors.axisText;
  x.ticks.padding = 8;
  x.ticks.maxRotation = 90;
  x.ticks.minRotation = 0;
  // x.ticks.includeBounds = false;
  x.border = {};
  x.border.display = false;

  let y = {};
  y.offset = true;
  y.grid = {};
  y.grid.color = colors.gridLine;
  y.grid.drawTicks = false;
  y.grid.drawBorder = false;
  y.ticks = {};
  y.ticks.color = colors.axisText;
  y.ticks.padding = 0;
  y.ticks.includeBounds = false;
  y.border = {};
  y.border.display = false;

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

  let options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'x',
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
    },
  };

  return options;
}