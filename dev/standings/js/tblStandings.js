import { DATA } from './data.js';
import { createFromTemplate, getItem, formatNumber, formatRecord } from './util.js';

/* ------------------------------------------------ */

export const get = () => document.getElementById('tblStandings');
export const getRows = () => get().querySelectorAll('tbody tr');
export const getPlayerRow = (player) => get().querySelector('tbody tr[data-player="' + player + '"]');
export const getActiveRow = () => get().querySelector('tbody tr.active-row');
export const getActivePlayer = () => (getActiveRow() == null) ? null : getActiveRow().getAttribute('data-player');

/* ------------------------------------------------ */

export function init() {

  let tbl = get();
  let thead = createFromTemplate('headStandings');
  let tbody = document.createElement('tbody');
  tbl.innerHTML = '';
  tbl.appendChild(thead);
  tbl.appendChild(tbody);

  let data = DATA.Stats;
  let week = data[data.length - 1].week;
  data = data.filter((x) => x.week == week);
  data.sort((a, b) => {
    if (a.rankOrder < b.rankOrder) return -1;
    if (a.rankOrder > b.rankOrder) return 1;
    return 0;
  });


  data.forEach((x) => {
    let row = createRow(x);
    row.setAttribute('data-player', x.player);
    row.setAttribute('role', 'button');

    tbody.appendChild(row);
  });

}

/* ------------------------------------------------ */

function createRow(x) {

  let row = createFromTemplate('rowStandings');
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
    let rankChange = getItem(row, 'rankChange');
    rankChange.classList.remove('d-none');
    rankChange.classList.add(color);

    let rankChangeIcon = getItem(row, 'rankChangeIcon');
    rankChangeIcon.classList.remove('d-none');
    rankChangeIcon.classList.add(...[icon, color]);
  }

  return row;
}
