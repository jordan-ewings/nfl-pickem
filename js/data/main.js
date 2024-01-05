import { DATA } from './data.js';
import * as tblData from './tblData.js';

/* ------------------------------------------------ */

await DATA.fetch();
tblData.init();

makeWeekButtons();

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
        DATA.tblData = DATA.full.filter((x) => x.week == week)[0];
        tblData.update();
      });

      btn.classList.add('btn', 'text-dim2', 'fw-medium', 'text-nowrap');
      btn.innerHTML = `${wlab}`;
      btn.id = 'btn' + w;
      fCont.appendChild(btn);
    }
  });

  let currbtn = document.getElementById('btn' + DATA.currweek);
  currbtn.classList.add('active', 'active-week');
  currbtn.scrollIntoView({ behavior: "smooth", block: "end", inline: "center" });
}

