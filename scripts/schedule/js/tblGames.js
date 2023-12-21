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
      let day = document.createElement('h6');
      day.classList.add('text-center', 'text-dim1', 'fw-semibold', 'pt-3', 'pb-3', 'mb-0', 'mt-0');
      day.textContent = d;
      dayDiv.appendChild(day);
      tblGames.appendChild(dayDiv);

      games.filter((x) => x.gameday_long == d).forEach((g) => {
        let tblrow = makeTblrow(g);
        tblGames.appendChild(tblrow);
      });
    });
  } else {
    let tblrows = tblGames.getElementsByClassName('tblrow');
    for (let i = 0; i < tblrows.length; i++) {
      let tblrow = tblrows.item(i);
      let game_id = tblrow.getAttribute('data-gameid');
      let g = games.filter((x) => x.game_id == game_id)[0];
      let newrow = makeTblrow(g);
      // if pickrow of tblrow has class show, add class show to new pickrow
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

function makeTblrow(g) {
  let template = document.getElementById('tblrow-template');
  let clone = template.content.cloneNode(true);
  let tblrow = clone.querySelector('.tblrow');
  tblrow.setAttribute('data-gameid', g.game_id);
  tblrow.classList.add('game-' + g.state);

  let gamerow = tblrow.querySelector('.gamerow');
  gamerow.setAttribute('data-gameid', g.game_id);
  gamerow.setAttribute('data-week', g.week);
  gamerow.setAttribute('data-gametime', g.gametime_raw);
  gamerow.setAttribute('data-deadline', g.deadline);

  ['away', 'home'].forEach((t) => {
    let teamrow = gamerow.querySelector('.teamrow-' + t);
    teamrow.setAttribute('data-gameid', g.game_id);
    teamrow.setAttribute('data-team', g[t + '_team']);
    teamrow.setAttribute('data-teamshort', g[t + '_teamshort']);
    teamrow.setAttribute('data-teamfull', g[t + '_teamfull']);

    ['logo', 'teamshort', 'poss', 'score', 'record'].forEach((item) => {
      let el = teamrow.querySelector('[data-item="' + item + '"]');
      if (item == 'logo') {
        el.src = g[t + '_logo'];
        return;
      }

      if (item == 'poss') {
        if (g[t + '_poss'] != '1') el.classList.add('d-none');
        return;
      }

      if (item == 'score') {
        if (g.state == 'pre') el.classList.add('d-none');
        // return;
      }

      if (item == 'record') {
        if (g.state != 'pre') el.classList.add('d-none');
        // return;
      }

      el.textContent = g[t + '_' + item];
    });

    // add opacity-25 class to teamrow if team didn't win (keep logo at full opacity)
    if (g.state == 'post') {
      if (g[t + '_team'] != g.win_team) {
        let spanEls = teamrow.querySelectorAll('span');
        spanEls.forEach((el) => {
          el.classList.add('opacity-25');
        });
      }
    }
  });

  // fill statcol
  ['gameday', 'gametime', 'stateshort', 'poss_loc', 'poss_dd', 'spread'].forEach((key) => {
    let el = gamerow.querySelector('[data-item="' + key + '"]');
    el.textContent = g[key];
    el.classList.add('d-none');
    if (g.state == 'pre') {
      if (key == 'gameday') el.classList.remove('d-none');
      if (key == 'gametime') el.classList.remove('d-none');
      if (key == 'spread') el.classList.remove('d-none');
    } else if (g.state == 'in') {
      if (key == 'stateshort') {
        el.classList.remove('d-none');
        el.classList.add('text-danger');
      }
      if (key == 'poss_loc') el.classList.remove('d-none');
      if (key == 'poss_dd') el.classList.remove('d-none');
    } else if (g.state == 'post') {
      if (key == 'stateshort') {
        el.classList.remove('d-none');
        el.classList.add('text-primary-emphasis');
      }
      if (key == 'spread') el.classList.remove('d-none');
    }
  });

  // fill pickrow
  if (!g.responses) {
    let pickrow = tblrow.querySelector('.pickrow');
    pickrow.remove();
    return tblrow;
  }

  let state = g.state;
  let win_team = g.win_team;

  gamerow.setAttribute('data-bs-toggle', 'collapse');
  gamerow.setAttribute('data-bs-target', '#picks-' + g.game_id);
  gamerow.setAttribute('role', 'button');

  let pickrow = tblrow.querySelector('.pickrow');
  pickrow.classList.add('collapse');
  pickrow.id = 'picks-' + g.game_id;
  pickrow.id = pickrow.id.replace('_', '-');

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

    let logo = pickitem.querySelector('[data-item="pick_logo"]');
    logo.src = p.pick_logo;
    if (p.pick_logo == '') logo.classList.add('opacity-0');
    let player = pickitem.querySelector('[data-item="player"]');
    player.textContent = p.player;

    let pick_team = p.pick_team;
    if (p.status != 'OK') {
      pickitem.classList.add('opacity-25');
      let status = pickitem.querySelector('[data-item="status"]');
      if (p.status == 'LATE') {
        status.textContent = 'L';
        status.classList.remove('d-none');
      }
    } else {
      if (state == 'post') {
        if (pick_team == win_team) {
          pickitem.classList.add('opacity-100');
        } else {
          pickitem.classList.add('opacity-25');
        }
      }
    }

    pickitem.addEventListener('click', (e) => {
      prepareForm(e);
    });
  });

  return tblrow;

}