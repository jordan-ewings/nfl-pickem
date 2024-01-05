import { DATA } from './data.js';
import { createFromTemplate, getItem, formatNumber, formatRecord } from '../util.js';

/* ------------------------------------------------ */

export const get = () => document.getElementById('tblData');
export const getRows = () => get().querySelectorAll('tbody tr');

/* ------------------------------------------------ */

const gamerowCols = [
  'responses',
  'gametime',
  'away_team', 'away_teamshort', 'away_record',
  'home_team', 'home_teamshort', 'home_record',
  'spread', 'away_score', 'home_score',
  'state', 'win_team', 'win_teamshort',
];

const responseCols = [
  'stamp', 'player', 'pick_team', 'pick_teamshort', 'f_win', 'f_underdog', 'status'
];

/* ------------------------------------------------ */

export function init() {

  let tbl = get();
  let thead = createHead(gamerowCols);
  let tbody = document.createElement('tbody');
  tbl.innerHTML = '';
  tbl.appendChild(thead);
  tbl.appendChild(tbody);

  update(DATA.currweek);
}

/* ------------------------------------------------ */

export function update() {

  let tbl = get();
  let tbody = tbl.querySelector('tbody');
  tbody.innerHTML = '';

  let data = DATA.tblData;
  data.games.forEach((game) => {
    let rowData = {};
    gamerowCols.forEach((key) => {
      if (game[key] == undefined) return;
      rowData[key] = game[key];
    });

    let row = createRow(rowData);
    row.classList.add('game-row');
    row.setAttribute('data-game', game.game_id);
    row.setAttribute('data-week', game.week);

    tbody.appendChild(row);
  });

  setWeekButtons();
}

/* ------------------------------------------------ */

function setWeekButtons() {

  let week = DATA.tblData.week;
  let btns = document.querySelectorAll('#filterCont button');
  btns.forEach((btn) => {
    let btn_week = btn.getAttribute('data-week');
    if (btn_week == week) {
      btn.classList.add('active');
      btn.scrollIntoView({ behavior: "smooth", block: "end", inline: "center" });
    } else {
      btn.classList.remove('active');
    }
  });

  return;
}


/* ------------------------------------------------ */

function createRow(x) {

  let row = createFromTemplate('rowData');

  let button = document.createElement('button');
  button.innerHTML = '<i class="fa-regular fa-caret-right"></i>';
  button.classList.add('btn', 'btn-sm', 'text-nowrap');
  button.setAttribute('type', 'button');
  button.classList.add('p-0');
  let cell = document.createElement('td');
  cell.appendChild(button);
  row.appendChild(cell);

  if (x.responses) {

    button.classList.add('text-primary');
    button.addEventListener('click', (e) => {
      let gamerow = e.target.closest('.game-row');
      let responses = x.responses;
      handleResponses(gamerow, responses);
    });


  }

  Object.keys(x).forEach((key) => {

    if (typeof x[key] == 'object') return;
    let cell = document.createElement('td');
    let value = x[key];
    let displayValue = value;
    // let displayValue = formatNumber(value, '0', '-');
    // if (key.includes('pct')) displayValue = formatNumber(value, '0%', '-');
    cell.innerHTML = displayValue;
    row.appendChild(cell);
  });



  return row;
}

/* ------------------------------------------------ */

function handleResponses(gamerow, responses) {

  let row = gamerow.nextElementSibling;
  if (row && row.classList.contains('game-row-responses')) {
    row.remove();
    return;
  }

  row = document.createElement('tr');
  row.classList.add('game-row-responses');
  let cell = document.createElement('td');
  cell.setAttribute('colspan', '100%');
  row.appendChild(cell);

  let tbl = document.createElement('table');
  tbl.classList.add('table', 'table-borderless');
  tbl.innerHTML = '';
  cell.appendChild(tbl);

  let thead = createHead(responseCols);
  let tbody = document.createElement('tbody');
  tbl.appendChild(thead);
  tbl.appendChild(tbody);

  responses.forEach((response) => {

    let rowData = {};
    responseCols.forEach((key) => {
      rowData[key] = response[key];
    });

    let row = createRow(rowData);
    row.classList.add('game-row-response');
    row.setAttribute('data-player', response.player);
    row.setAttribute('data-week', response.week);

    tbody.appendChild(row);
  });

  gamerow.after(row);
}



/* ------------------------------------------------ */

function createHead(keys) {

  // let keys = Object.keys(x);
  let thead = createFromTemplate('headData');
  let row = thead.querySelector('tr');
  let cell1 = document.createElement('th');
  cell1.innerHTML = '';
  row.appendChild(cell1);

  keys.forEach((key) => {
    if (key == 'responses') return;
    let cell = document.createElement('th');
    cell.innerHTML = key;
    row.appendChild(cell);
  });

  return thead;

}



