/* ------------------------------------------------ */

function updateTblrows(update = false) {

  let tblGames = document.getElementById('tblGames');
  let games = DATA.tblGames.games;

  if (update == false) {
    document.getElementById('toggle-picks-btn').innerHTML = 'Show Picks';
    tblGames.innerHTML = '';
    let days = games.map((x) => x.gameday_long);
    days = days.filter((c, index) => days.indexOf(c) === index);
    days.forEach((d) => {
      let dayDiv = document.createElement('div');
      dayDiv.classList.add('daterow')
      dayDiv.classList.add('rounded-4');

      let day = document.createElement('h6');
      day.classList.add('text-center');
      day.textContent = d;
      dayDiv.appendChild(day);

      games.filter((x) => x.gameday_long == d).forEach((g) => {
        let tblrow = makeTblrow(g);
        dayDiv.appendChild(tblrow);
      });

      tblGames.appendChild(dayDiv);
    });
  } else {
    let tblrows = tblGames.getElementsByClassName('tblrow');
    for (let i = 0; i < tblrows.length; i++) {
      let tblrow = tblrows.item(i);
      let game_id = tblrow.getAttribute('data-game-id');
      let g = games.filter((x) => x.game_id == game_id)[0];
      let newrow = makeTblrow(g);
      let pickrow = tblrow.querySelector('.pickrow');
      if (pickrow) {
        if (pickrow.classList.contains('show')) {
          newrow.getElementsByClassName('pickrow')[0].classList.add('show');
        }
      }
      tblrow.replaceWith(newrow);
    }
  }

  ['pre', 'in', 'post'].forEach((state) => {
    let num_games = games.filter((x) => x.state == state).length;
    let pc_games = Math.round(num_games / games.length * 100);
    document.getElementById('prog-' + state).style.width = pc_games + '%';
  });

  // if no pickrows, disable toggle-picks-btn
  let pickrows = tblGames.getElementsByClassName('pickrow');
  if (pickrows.length == 0) {
    document.getElementById('toggle-picks-btn').classList.add('disabled');
  } else {
    document.getElementById('toggle-picks-btn').classList.remove('disabled');
  }
}

/* ------------------------------------------------ */

function getItem(element, dataItem) {
  let item = element.querySelector('[data-item="' + dataItem + '"]');
  return item;
}

function makeTblrow(g) {

  let template = document.getElementById('tblrow-template');
  let clone = template.content.cloneNode(true);
  let tblrow = clone.querySelector('.tblrow');
  tblrow.setAttribute('data-game-id', g.game_id);
  tblrow.classList.add('game-' + g.state);

  let gamerow = tblrow.querySelector('.gamerow');
  gamerow.setAttribute('data-game-id', g.game_id);


  ['away', 'home'].forEach((t) => {
    let teamrow = gamerow.querySelector('.teamrow-' + t);
    teamrow.setAttribute('data-game-id', g.game_id);
    teamrow.setAttribute('data-team', g[t + '_team']);
    teamrow.setAttribute('data-teamshort', g[t + '_teamshort']);
    teamrow.setAttribute('data-teamfull', g[t + '_teamfull']);

    ['logo', 'teamshort', 'poss', 'score', 'record'].forEach((key) => {
      let el = getItem(teamrow, key);
      if (el.tagName == 'SPAN') el.textContent = g[t + '_' + key];
      if (el.tagName == 'IMG') el.src = g[t + '_' + key];
      el.classList.add('d-none');
    });

    let logo = getItem(teamrow, 'logo');
    let teamshort = getItem(teamrow, 'teamshort');
    let poss = getItem(teamrow, 'poss');
    let score = getItem(teamrow, 'score');
    let record = getItem(teamrow, 'record');

    logo.classList.remove('d-none');
    teamshort.classList.remove('d-none');

    if (g.state == 'pre') {
      record.classList.remove('d-none');
    } else if (g.state == 'in') {
      score.classList.remove('d-none');
      if (g[t + '_poss'] == '1') poss.classList.remove('d-none');
    } else if (g.state == 'post') {
      score.classList.remove('d-none');
    }

    if (g.state == 'post') {
      if (g[t + '_team'] != g.win_team) {
        teamshort.classList.add('opacity-25');
        score.classList.add('opacity-25');
      }
    }

  });

  // fill statcol
  let statcol = gamerow.querySelector('.statcol');
  ['gameday', 'gametime', 'stateshort', 'poss_loc', 'poss_dd', 'spread'].forEach((key) => {
    let el = getItem(statcol, key);
    el.textContent = g[key];
    el.classList.add('d-none');
  });

  let gameday = getItem(statcol, 'gameday');
  let gametime = getItem(statcol, 'gametime');
  let stateshort = getItem(statcol, 'stateshort');
  let poss_loc = getItem(statcol, 'poss_loc');
  let poss_dd = getItem(statcol, 'poss_dd');
  let spread = getItem(statcol, 'spread');

  if (g.state == 'pre') {
    gameday.classList.remove('d-none');
    gametime.classList.remove('d-none');
    spread.classList.remove('d-none');
  } else if (g.state == 'in') {
    stateshort.classList.remove('d-none');
    stateshort.classList.add('text-danger');
    poss_loc.classList.remove('d-none');
    poss_dd.classList.remove('d-none');
  } else if (g.state == 'post') {
    stateshort.classList.remove('d-none');
    stateshort.classList.add('text-primary-emphasis');
    spread.classList.remove('d-none');
  }

  // fill pickrow
  if (!g.responses) {
    let pickrow = tblrow.querySelector('.pickrow');
    pickrow.remove();
    return tblrow;
  }

  gamerow.setAttribute('data-bs-toggle', 'collapse');
  gamerow.setAttribute('data-bs-target', '#picks-' + g.game_id);
  gamerow.setAttribute('role', 'button');

  let pickrow = tblrow.querySelector('.pickrow');
  pickrow.classList.add('collapse');
  pickrow.id = 'picks-' + g.game_id;
  // pickrow.id = pickrow.id.replace('_', '-');

  let pcols = pickrow.querySelector('.row-cols-3');
  g.responses.forEach((p, index) => {
    let col = pcols.querySelector('.col');
    if (index > 0) {
      let newcol = col.cloneNode(true);
      pcols.appendChild(newcol);
    }
  });

  g.responses.forEach((p, index) => {
    let pickitem = pcols.querySelector('.col:nth-child(' + (index + 1) + ') .pickitem');
    Object.keys(p).forEach((key) => {
      let label = key.replace('_', '-');
      pickitem.setAttribute('data-' + label, p[key]);
    });

    let logo = getItem(pickitem, 'pick_logo');
    let player = getItem(pickitem, 'player');
    let status = getItem(pickitem, 'status');

    logo.src = p.pick_logo;
    if (p.pick_logo == '') logo.classList.add('opacity-0');
    player.textContent = p.player;

    if (p.f_win == '1') pickitem.classList.add('opacity-100');
    if (p.f_win == '0' || p.status != 'OK') {
      pickitem.classList.add('opacity-25');
      pickitem.classList.remove('fw-medium');
    }
    if (p.status == 'LATE') {
      status.textContent = 'L';
      status.classList.remove('d-none');
    }

    pickitem.addEventListener('click', (e) => {
      prepareForm(e);
    });
  });

  return tblrow;

}