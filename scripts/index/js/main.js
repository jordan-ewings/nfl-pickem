/* ------------------------------------------------ */

function updateTblStandings() {

  let data = DATA.Stats;
  let week = data[data.length - 1].week;
  data = data.filter((x) => x.week == week);
  data.sort((a, b) => {
    if (a.rankOrder < b.rankOrder) return -1;
    if (a.rankOrder > b.rankOrder) return 1;
    return 0;
  });

  let tbldata = data.map((x) => {
    return {
      rank: x.rankLabel,
      player: x.player,
      change: x.rankChange == 0 ? '-' : x.rankChange.toFixed(0),
      rec_week: x.wk_wins + '-' + x.wk_losses,
      rec: x.wins + '-' + x.losses,
      gb: x.games_back == 0 ? '-' : x.games_back.toFixed(0),
      pc_dog_pick: (x.dog_pct * 100).toFixed(0) + '%',
      pc_dog_win: (x.dog_wpct * 100).toFixed(0) + '%',
    };
  });

  // update table
  let tbl = document.getElementById('tblStandings');
  let thead = tbl.querySelector('thead');
  let tbody = tbl.querySelector('tbody');
  thead.innerHTML = '';
  tbody.innerHTML = '';

  // update thead
  let names = ['', '', 'WK', 'TTL', 'GB', 'D%', 'DW%'];
  let tr = document.createElement('tr');
  names.forEach((x) => {
    let cell = document.createElement('th');
    cell.innerHTML = x;
    tr.appendChild(cell);
  });
  thead.appendChild(tr);

  let template = document.getElementById('row-template');
  tbldata.forEach((x) => {
    let row = template.content.cloneNode(true);
    Object.keys(x).forEach((k) => {
      let item = getItem(row, k);
      item.innerHTML = x[k];
    });

    if (x.change != '-') {
      let val = getItem(row, 'change');
      val.classList.remove('d-none');
      val.innerHTML = val.innerHTML.replace('-', '');
      if (parseInt(x.change) > 0) {
        val.classList.add('text-success-emphasis');
        getItem(row, 'change-up-icon').classList.remove('d-none');
      } else {
        val.classList.add('text-danger-emphasis');
        getItem(row, 'change-down-icon').classList.remove('d-none');
      }
    }

    tbody.appendChild(row);
  });

  console.log(tbldata);
  return;
}

function getItem(element, dataItem) {
  let item = element.querySelector('[data-item="' + dataItem + '"]');
  return item;
}
