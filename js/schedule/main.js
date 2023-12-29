import { DATA } from './data.js';
import { TBLGAMES } from './tblGames.js';
import { prepareForm, submitForm } from './forms.js';

/* ------------------------------------------------ */

await DATA.get();
TBLGAMES.send();
makeWeekButtons();
document.getElementById("refresh-btn").classList.remove('d-none');
document.getElementById("toggle-picks-btn").classList.remove('d-none');
document.getElementById("prog-games").classList.remove('d-none');

/* ------------------------------------------------ */

// modal related

let modalForm = document.getElementById('modalForm');
modalForm.addEventListener('submit', (e) => {
  submitForm(e);
});
modalForm.querySelector('select[name="player"]').addEventListener('change', (e) => {
  prepareForm(e);
});

/* ------------------------------------------------ */

document.getElementById('refresh-btn').addEventListener('click', async () => {

  let btn = document.getElementById('refresh-btn');
  let btn_html = btn.innerHTML;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm text-danger-emphasis" role="status" aria-hidden="true"></span>';

  await DATA.get();
  TBLGAMES.update();

  btn.innerHTML = '<i class="fa-solid fa-check text-success-emphasis"></i>';
  setTimeout(() => {
    btn.innerHTML = btn_html;
  }, 1000);
});

document.getElementById('toggle-picks-btn').addEventListener('click', () => {
  togglePicks();
});

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
  TBLGAMES.send();
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