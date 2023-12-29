import { DATA } from './data.js';
import * as UTIL from '../util.js';

/* ------------------------------------------------ */

export function init() {
  updateTblStandings();
}

/* ------------------------------------------------ */

function createRow(x, isWeekly = false) {

  let row = UTIL.createFromTemplate('row-template');
  let tbldata = {
    rank: x.rankLabel,
    player: x.player,
    change: x.rankChange == 0 ? '-' : x.rankChange.toFixed(0),
    rec_week: x.wk_wins + '-' + x.wk_losses,
    rec: x.wins + '-' + x.losses,
    gb: x.games_back == 0 ? '-' : x.games_back.toFixed(0),
  };

  if (isWeekly == false) {
    tbldata.pc_dog_pick = (x.dog_pct * 100).toFixed(0) + '%';
    tbldata.pc_dog_win = (x.dog_wpct * 100).toFixed(0) + '%';
  } else {
    tbldata.pc_dog_pick = (x.wk_dog_pct * 100).toFixed(0) + '%';
    tbldata.pc_dog_win = (x.wk_dog_wpct * 100).toFixed(0) + '%';
  }

  Object.keys(tbldata).forEach((k) => {
    let item = getItem(row, k);
    item.innerHTML = tbldata[k];
  });

  if (tbldata.change != '-') {
    let val = getItem(row, 'change');
    if (isWeekly == false) val.classList.remove('d-none');
    val.innerHTML = val.innerHTML.replace('-', '');
    if (parseInt(tbldata.change) > 0) {
      val.classList.add('text-success-emphasis');
      getItem(row, 'change-up-icon').classList.remove('d-none');
    } else {
      val.classList.add('text-danger-emphasis');
      getItem(row, 'change-down-icon').classList.remove('d-none');
    }
  }

  let recIndexes = [2, 3];
  recIndexes.forEach((i) => {
    let rec = row.children[i];
    let wlSpl = rec.innerHTML.split('-');
    let wl = [wlSpl[0], '-', wlSpl[1]];
    rec.innerHTML = '';
    let div = document.createElement('div');
    div.classList.add('d-flex', 'w-100', 'justify-content-center');
    wl.forEach((x, j) => {
      let span = document.createElement('div');
      if (j == 1) {
        span.classList.add('text-dim2', 'text-center');
        span.style.width = '10px';
      }
      span.innerHTML = x;
      div.appendChild(span);
    });

    rec.appendChild(div);
  });

  return row;
}

/* ------------------------------------------------ */

function createHeader() {

  let thead = document.createElement('thead');
  let names = ['', 'PLAYER', 'WK', 'TTL', 'GB', 'D%', 'DW%'];
  let tr = document.createElement('tr');
  names.forEach((x) => {
    let cell = document.createElement('th');
    if (x == 'PLAYER') cell.classList.add('text-start');
    cell.innerHTML = x;
    tr.appendChild(cell);
  });
  thead.appendChild(tr);

  return thead;
}

/* ------------------------------------------------ */

function createBody() {

  let tbody = document.createElement('tbody');
  return tbody;
}

/* ------------------------------------------------ */

function updateTblStandings() {

  let tbl = document.getElementById('tblStandings');

  let thead = createHeader();
  tbl.appendChild(thead);

  let tbody = createBody();
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
    row.addEventListener('click', (e) => {
      updateTblWeekly(x.player);
    });

    tbody.appendChild(row);
  });

  return;
}

/* ------------------------------------------------ */

function updateTblWeekly(player) {

  let tblStandings = document.getElementById('tblStandings');
  let playerRows = tblStandings.querySelectorAll('tbody tr');
  playerRows.forEach((x) => {
    x.classList.remove('active-row');
  });
  let playerRow = tblStandings.querySelector('tbody tr[data-player="' + player + '"]');
  playerRow.classList.add('active-row');

  let cont = document.getElementById('tblWeeklyContainer');
  cont.classList.remove('d-none');
  let tbl = cont.querySelector('table');
  tbl.innerHTML = '';

  let thead = createHeader();
  // replace 'PLAYER' with 'WEEK'
  let thSet = thead.querySelectorAll('th');
  thSet[1].innerHTML = 'WEEK';
  tbl.appendChild(thead);

  let tbody = createBody();
  tbl.appendChild(tbody);

  let data = DATA.Stats;
  data = data.filter((x) => x.player == player);
  data.sort((a, b) => {
    if (a.week < b.week) return -1;
    if (a.week > b.week) return 1;
    return 0;
  });

  data.forEach((x, idx) => {
    let row = createRow(x, true);
    let week = x.week;
    let weekStr = 'Week ' + week;
    let playerItem = getItem(row, 'player');
    playerItem.innerHTML = weekStr;
    let cont = getItem(row, 'player-cont');
    cont.classList.remove('fw-medium');

    let dogOpps = x.wk_dog_opps;
    if (dogOpps == 0) {
      getItem(row, 'pc_dog_pick').innerHTML = '-';
      getItem(row, 'pc_dog_win').innerHTML = '-';
    }

    tbody.appendChild(row);
  });

  let info = cont.querySelector('.cont-card-info');
  info.textContent = player;
}

/* ------------------------------------------------ */

function getItem(element, dataItem) {
  let item = element.querySelector('[data-item="' + dataItem + '"]');
  return item;
}
