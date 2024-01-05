import { DATA } from './data.js';
import { createFromTemplate, getItem, formatNumber, formatRecord } from '../../js/util.js';

/* ------------------------------------------------ */

export const get = () => document.getElementById('tblWeekly');
export const getRows = () => get().querySelectorAll('tbody tr');
export const getContainer = () => document.getElementById('tblWeeklyContainer');
export const show = () => getContainer().classList.remove('d-none');
export const hide = () => getContainer().classList.add('d-none');

/* ------------------------------------------------ */

export function init() {

  let tbl = get();
  let thead = createFromTemplate('headWeekly');
  let tbody = document.createElement('tbody');
  tbl.innerHTML = '';
  tbl.appendChild(thead);
  tbl.appendChild(tbody);

  return;
}

/* ------------------------------------------------ */

export function setPlayer(player) {

  let tbl = get();
  let tbody = tbl.querySelector('tbody');
  tbody.innerHTML = '';

  let data = getPlayerData(player);
  data.forEach((x) => {
    let row = createRow(x);
    tbody.appendChild(row);
  });

  let info = getContainer().querySelector('.cont-card-info');
  info.textContent = player;

  return;
}

/* ------------------------------------------------ */

function getPlayerData(player) {

  let data = DATA.Stats;
  data = data.filter((x) => x.player == player);
  data.sort((a, b) => {
    if (a.week < b.week) return -1;
    if (a.week > b.week) return 1;
    return 0;
  });

  return data;
}

/* ------------------------------------------------ */

function createRow(x) {

  let row = createFromTemplate('rowWeekly');
  let items = row.querySelectorAll('[data-item]');
  items.forEach((item) => {
    let dataItem = item.getAttribute('data-item');
    let value = x[dataItem];
    if (value === undefined) return;
    let displayValue = formatNumber(value, '0', '-');
    if (dataItem.includes('pct')) displayValue = formatNumber(value, '0%', '-');
    if (dataItem == 'rankChange' && value < 0) displayValue = displayValue.replace('-', '');

    if (dataItem.includes('record')) {
      let rec = formatRecord(displayValue);
      item.appendChild(rec);
    } else {
      item.innerHTML = displayValue;
    }
  });

  if (x.rankChange != 0) {
    let color = x.rankChange > 0 ? 'text-success-emphasis' : 'text-danger-emphasis';
    let icon = x.rankChange > 0 ? 'fa-circle-up' : 'fa-circle-down';

    let rankChangeIcon = getItem(row, 'rankChangeIcon');
    rankChangeIcon.classList.remove('d-none');
    rankChangeIcon.classList.add(...[icon, color]);
  }

  return row;
}
