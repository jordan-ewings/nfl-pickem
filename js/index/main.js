import { DATA } from './data.js';
import * as tblStandings from './tblStandings.js';
import * as tblWeekly from './tblWeekly.js';

/* ------------------------------------------------ */

await DATA.fetch();

tblStandings.init();
tblStandings.getRows().forEach((row) => {
  row.addEventListener('click', function () {
    let player = this.getAttribute('data-player');
    handlePlayerToggle(player);
  });
});

tblWeekly.init();

/* ------------------------------------------------ */

function handlePlayerToggle(player) {

  let row = tblStandings.getPlayerRow(player);
  let activePlayer = tblStandings.getActivePlayer();

  tblStandings.getRows().forEach((row) => {
    row.classList.remove('active-row');
  });

  if (activePlayer == null || activePlayer != player) {
    row.classList.add('active-row');
    tblWeekly.setPlayer(player);
    tblWeekly.show();
    return;
  }

  if (activePlayer == player) {
    tblWeekly.hide();
    return;
  }

}