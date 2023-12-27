/* ------------------------------------------------ */

async function getData() {

  if (DATA.LOADED == false) document.getElementById('view-loading').classList.remove('d-none');

  DATA['SeasonInfo'] = await getSheet('SeasonInfo');
  DATA['Games'] = await getSheet('Games');
  DATA['Responses'] = await getSheet('Responses');

  DATA.currweek = DATA.SeasonInfo.filter((x) => x.current == '1')[0]['week'];
  DATA.full = procGames(DATA.Games, DATA.Responses);
  if (USING_LIVE == true) {
    DATA.live = await fetchLive(DATA.currweek);
    DATA.full = updateData(DATA.full, DATA.live);
  }

  if (!DATA.tblGames) {
    DATA.tblGames = DATA.full.filter((x) => x.week == DATA.currweek)[0];
  } else {
    let tblWeek = DATA.tblGames.week;
    DATA.tblGames = DATA.full.filter((x) => x.week == tblWeek)[0];
  }

  if (DATA.LOADED == false) {
    document.getElementById('view-loading').classList.add('d-none');
    DATA.LOADED = true;
  }

  console.log(DATA);
}

/* ------------------------------------------------ */

async function sendData() {

  if (DATA.TBL_LOADED == true) {
    let btn = document.getElementById('refresh-btn');
    let btn_html = btn.innerHTML;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm text-danger-emphasis" role="status" aria-hidden="true"></span>';

    await getData();
    updateTblrows(update = true);

    btn.innerHTML = '<i class="fa-solid fa-check text-success-emphasis"></i>';
    setTimeout(() => {
      btn.innerHTML = btn_html;
    }, 1500);
  } else {

    await getData();
    updateTblrows(update = false);

    makeWeekButtons();
    document.getElementById("refresh-btn").classList.remove('d-none');
    document.getElementById("toggle-picks-btn").classList.remove('d-none');
    document.getElementById("prog-games").classList.remove('d-none');

    // add event listeners
    let modalForm = document.getElementById('modalForm');
    modalForm.addEventListener('submit', (e) => {
      submitForm(e);
    });
    modalForm.querySelector('select[name="player"]').addEventListener('change', (e) => {
      prepareForm(e);
    });

    let modal = document.getElementById('modalFormContainer');
    // on open, add no-submit to footer
    modal.addEventListener('show.bs.modal', (e) => {
      let submitBtn = document.getElementById('form-submit-btn');
      submitBtn.classList.add('no-submit');
    });

    DATA.TBL_LOADED = true;

  }
}

function queryData(query = {}) {
  let data = DATA.full.map((x) => x.games).flat();
  let keys = Object.keys(query);
  if (keys.length == 0) return data;
  data = data.filter((x) => {
    let match = true;
    keys.forEach((key) => {
      if (x[key] != query[key]) match = false;
    });
    return match;
  });
  return data;
}



/* ------------------------------------------------ */

function makeWeekButtons() {

  let fCont = document.getElementById('filterCont');
  DATA.full.forEach((wdata) => {
    let w = wdata.week;
    let wlab = wdata.week_label;
    if (!document.getElementById('btn' + w)) {
      let btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('data-week', w);
      btn.addEventListener('click', (e) => {
        let btn = e.target;
        let week = btn.getAttribute('data-week');
        filterTable(week);
      });
      btn.classList.add('btn', 'text-dim2', 'fw-medium', 'text-nowrap');
      // btn.style.borderColor = 'transparent';
      btn.innerHTML = `${wlab}`;
      btn.id = 'btn' + w;
      fCont.appendChild(btn);
    }
  });

  let currbtn = document.getElementById('btn' + DATA.currweek);
  currbtn.classList.add('active', 'active-week');
  currbtn.scrollIntoView({ behavior: "smooth", block: "end", inline: "center" });
}

/* ------------------------------------------------ */

function filterTable(week) {

  DATA.tblGames = DATA.full.filter((x) => x.week == week)[0];
  updateTblrows();
  console.log(DATA.tblGames);

  let fCont = document.getElementById('filterCont');
  let btns = fCont.getElementsByClassName('btn');
  for (let j = 0; j < btns.length; j++) {
    let btn = btns.item(j);
    let btn_week = btn.getAttribute('data-week');
    if (btn_week == week) {
      btn.classList.add('active');
      btn.scrollIntoView({ behavior: "smooth", block: "end", inline: "center" });
    } else {
      btn.classList.remove('active');
    }
  }
}

/* ------------------------------------------------ */

function togglePicks() {

  let btn = document.getElementById('toggle-picks-btn');
  let picks_on = btn.innerHTML.includes('Hide') == true;
  if (picks_on == true) btn.innerHTML = 'Show Picks';
  if (picks_on == false) btn.innerHTML = 'Hide Picks';

  let tbl = document.getElementById('tblGames');
  let rows = tbl.getElementsByClassName('pickrow');
  for (let i = 0; i < rows.length; i++) {
    let row = rows.item(i);
    let is_shown = row.classList.contains('show') == true;
    if (!picks_on) {
      if (!is_shown) row.classList.add('show');
    } else {
      if (is_shown) row.classList.remove('show');
    }
  }
}
