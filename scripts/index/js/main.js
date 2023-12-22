
let DATA = {};

getPlayerStats()
  .then((data) => {
    DATA.Stats = data;
    updateTblStandings();
  })
  .catch((err) => console.log(err));

/* ------------------------------------------------ */

function createRow(x, isWeekly = false) {

  let template = document.getElementById('row-template');
  let row = template.content.cloneNode(true);
  row = row.querySelector('tr');
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

  return row;
}

/* ------------------------------------------------ */

function updateTblStandings() {

  let tbl = document.getElementById('tblStandings');

  let thead = tbl.querySelector('thead');
  thead.innerHTML = '';
  let names = ['', '', 'WK', 'TTL', 'GB', 'D%', 'DW%'];
  let tr = document.createElement('tr');
  names.forEach((x) => {
    let cell = document.createElement('th');
    cell.innerHTML = x;
    tr.appendChild(cell);
  });
  thead.appendChild(tr);

  let tbody = tbl.querySelector('tbody');
  tbody.innerHTML = '';

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
  // find player row
  let cells = tblStandings.querySelectorAll('tbody tr td');
  cells.forEach((x) => {
    x.classList.remove('bg-primary', 'bg-opacity-10');
    x.classList.remove('border', 'border-primary-subtle', 'border-start-0', 'border-end-0');
  });
  let playerRow = tblStandings.querySelector('tbody tr[data-player="' + player + '"]');
  let playerCells = playerRow.querySelectorAll('td');
  playerCells.forEach((x) => {
    x.classList.add('bg-primary', 'bg-opacity-10');
    x.classList.add('border', 'border-primary-subtle', 'border-start-0', 'border-end-0');
  });

  let tblStandingsDiv = tblStandings.parentElement;
  let tblDiv = tblStandingsDiv.cloneNode(true);
  let tbl = tblDiv.querySelector('table');
  let tbody = tbl.querySelector('tbody');
  tbody.innerHTML = '';

  let data = DATA.Stats;
  data = data.filter((x) => x.player == player);
  data.sort((a, b) => {
    if (a.week < b.week) return -1;
    if (a.week > b.week) return 1;
    return 0;
  });

  data.forEach((x) => {
    let row = createRow(x, isWeekly = true);
    // edit row for weekly
    let week = x.week;
    let weekStr = 'WK ' + week;
    let playerItem = getItem(row, 'player');
    playerItem.innerHTML = weekStr;

    let dogOpps = x.wk_dog_opps;
    if (dogOpps == 0) {
      getItem(row, 'pc_dog_pick').innerHTML = '-';
      getItem(row, 'pc_dog_win').innerHTML = '-';
    }
    tbody.appendChild(row);
  });

  let tblHeading = document.createElement('div');
  tblHeading.classList.add('d-flex', 'align-items-center');
  tblHeading.classList.add('mt-0', 'mb-1', 'mx-0', 'py-2', 'px-3');
  tblHeading.classList.add('bg-primary', 'bg-opacity-10');
  tblHeading.classList.add('border', 'border-primary-subtle', 'border-start-0', 'border-end-0', 'border-top-0');
  tblHeading.classList.add('text-primary-emphasis');

  let headTitle = document.createElement('span');
  headTitle.classList.add('fw-medium');
  headTitle.innerHTML = 'Weekly';
  tblHeading.appendChild(headTitle);

  let headPlayer = document.createElement('span');
  headPlayer.classList.add('fw-light', 'ms-1', 'text-sm1', 'opacity-50');
  headPlayer.innerHTML = ' - ' + player;
  tblHeading.appendChild(headPlayer);

  let headClose = document.createElement('button');
  headClose.classList.add('btn', 'text-primary-emphasis', 'opacity-25', 'm-0', 'p-0', 'ms-auto');
  headClose.setAttribute('type', 'button');
  headClose.innerHTML = '<i class="fa-regular fa-xmark"></i>';
  headClose.addEventListener('click', (e) => {
    let cont = document.getElementById('tblWeeklyContainer');
    cont.classList.add('d-none');
    cont.innerHTML = '';
    let tblStandings = document.getElementById('tblStandings');
    let cells = tblStandings.querySelectorAll('tbody tr td');
    cells.forEach((x) => {
      x.classList.remove('bg-primary', 'bg-opacity-10');
      x.classList.remove('border', 'border-primary-subtle', 'border-start-0', 'border-end-0');
    });
  });
  tblHeading.appendChild(headClose);

  let cont = document.getElementById('tblWeeklyContainer');
  cont.classList.remove('d-none');
  cont.innerHTML = '';
  cont.appendChild(tblHeading);
  cont.appendChild(tblDiv);
}

/* ------------------------------------------------ */

function getItem(element, dataItem) {
  let item = element.querySelector('[data-item="' + dataItem + '"]');
  return item;
}
