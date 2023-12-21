function createAlert(type, msg) {

  let alert = document.createElement('div');
  alert.classList.add('alert', 'd-flex', 'align-items-center');
  alert.classList.add('alert-' + type);
  alert.setAttribute('role', 'alert');

  let alertMsg = document.createElement('div');
  alertMsg.classList.add('me-auto', 'text-sm2');
  alertMsg.innerHTML = msg;
  alert.appendChild(alertMsg);

  let confirmBtn = document.createElement('button');
  confirmBtn.id = 'alertConfirmBtn';
  confirmBtn.classList.add('btn');
  confirmBtn.classList.add('btn-' + type, 'align-middle', 'ms-2');
  confirmBtn.setAttribute('type', 'button');
  confirmBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
  alert.appendChild(confirmBtn);

  let closeBtn = document.createElement('button');
  closeBtn.id = 'alertCloseBtn';
  closeBtn.classList.add('btn');
  closeBtn.classList.add('btn-outline-' + type, 'align-middle', 'ms-2')
  closeBtn.setAttribute('type', 'button');
  closeBtn.setAttribute('data-bs-dismiss', 'alert');
  closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  alert.appendChild(closeBtn);

  return alert;
}

/* ------------------------------------------------ */

function submitForm(e) {

  e.preventDefault();
  let modal = document.getElementById('modalFormContainer');
  let modalForm = modal.querySelector('#modalForm');
  let modalFooter = modal.querySelector('.modal-footer');
  let modalMessage = modal.querySelector('#modalMessage');
  let formData = new FormData(modalForm);

  let player = formData.get('player');
  let username = localStorage.getItem('username');
  if (username == null) {
    localStorage.setItem('username', player);
    postForm();
  } else if (username == player) {
    postForm();
  } else {

    let alertMsg = 'Are you sure you want to submit picks for <strong>' + player + '</strong>?';
    let alert = createAlert('warning', alertMsg);
    let confirmBtn = alert.querySelector('#alertConfirmBtn');
    confirmBtn.addEventListener('click', (e) => {
      let alert = e.target.closest('.alert');
      alert.remove();

      localStorage.setItem('username', player);
      postForm();
    });

    let closeBtn = alert.querySelector('#alertCloseBtn');
    closeBtn.addEventListener('click', (e) => {
      let alert = e.target.closest('.alert');
      alert.remove();
    });

    modalMessage.innerHTML = '';
    modalMessage.appendChild(alert);
  }
}

/* ------------------------------------------------ */

function postForm() {

  let modal = document.getElementById('modalFormContainer');
  let modalForm = modal.querySelector('#modalForm');
  let modalFooter = modal.querySelector('.modal-footer');
  let modalMessage = modal.querySelector('#modalMessage');
  let formData = new FormData(modalForm);

  let submitBtn = modal.querySelector('[type="submit"]');
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
  submitBtn.setAttribute('disabled', '');

  formData.append('timestamp', new Date().toLocaleString());
  let formUrlParams = new URLSearchParams(formData).toString();
  let formUrlRoot = 'https://script.google.com/macros/s/AKfycbxveY_vNT4LvlRThJQuaRszp9WmEXfKv376CgdNbRM1Gy5jWUjwGmxCo3Jv0fOpacpz/exec';
  let formUrl = formUrlRoot + '?' + formUrlParams;
  console.log(formUrl);

  var requestOptions = {
    method: 'POST',
    redirect: 'follow'
  };

  fetch(formUrl, requestOptions)
    .then(response => response.json())
    .then(result => {
      console.log(result);
      submitBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
      incorpFormData(result);
      console.log('success');

      setTimeout(() => {
        let modalBS = bootstrap.Modal.getInstance(modal);
        modalBS.hide();
        submitBtn.removeAttribute('disabled');
        submitBtn.innerHTML = 'Submit';
      }, 300);
    })
    .catch(error => {
      console.log('error', error);
      submitBtn.innerHTML = '<i class="fa-solid fa-exclamation"></i>';
      let alert = createAlert('danger', 'Something went wrong. Please try again.');
      alert.querySelector('#alertConfirmBtn').remove();
      modalMessage.innerHTML = '';
      modalMessage.appendChild(alert);

      setTimeout(() => {
        submitBtn.removeAttribute('disabled');
        submitBtn.innerHTML = 'Submit';
      }, 300);
    });

}

/* ------------------------------------------------ */

function incorpFormData(resp) {
  let player = resp.player;
  let gameids = Object.keys(resp);
  gameids = gameids.filter((x) => !isNaN(x));
  gameids.forEach((gameid) => {

    let p = resp[gameid];
    DATA.tblGames.games.forEach((g) => {
      if (g.game_id != gameid) return;
      g.responses.forEach((r) => {
        if (r.player != player) return;
        for (key in p) {
          r[key] = p[key];
        }
      });
    });
  });

  updateTblrows(update = true);
}

/* ------------------------------------------------ */

function prepareForm(e) {

  let modal = document.getElementById('modalFormContainer');
  let modalFormGames = document.getElementById('modalFormGames');
  let playerSelect = modal.querySelector('#player');

  let playerValue = playerSelect.value;
  let f_pickitem = e.target.parentElement.classList.contains('pickitem');
  if (f_pickitem) {
    let pickitem = e.target.parentElement;
    playerValue = pickitem.getAttribute('data-player');
    playerSelect.value = playerValue;
  }

  modalFormGames.classList.add('mb-3');
  modalFormGames.innerHTML = '';
  let tblrows = document.querySelectorAll('.tblrow');
  let openGames = tblrows.length;
  let pickedGames = 0;
  let openUnpickedGames = 0;
  let winGames = 0;
  let loseGames = 0;

  tblrows.forEach((tblrow, index) => {

    // let gameid = tblrow.getAttribute('data-game-id');
    let game = tblrowToInput(tblrow, playerValue);
    let picked = game.getAttribute('data-picked') == 'true';
    if (picked) pickedGames++;
    if (index == 0) game.classList.add('border-top-0');
    let disabled = game.querySelector('input[disabled]');
    if (disabled) openGames--;
    if (!picked && !disabled) openUnpickedGames++;

    let win = game.classList.contains('border-success');
    let lose = game.classList.contains('border-danger');
    if (win) winGames++;
    if (lose) loseGames++;

    modalFormGames.appendChild(game);
  });

  let head = document.getElementById('modalFormTitle');
  let headText = DATA.tblGames.week_label;
  head.innerHTML = '';
  head.appendChild(document.createTextNode(headText));

  let sub = document.getElementById('modalFormSubtitle');
  let subText = openGames + ' games open';
  if (openGames == 0) subText = 'No games open';
  if (openGames > 0) {
    if (openUnpickedGames > 0) subText += ' (' + openUnpickedGames + ' unpicked)';
    if (openUnpickedGames == 0) subText += ' (all picked)';
  }
  sub.innerHTML = '';
  sub.appendChild(document.createTextNode(subText));

  // record
  let sub2 = document.getElementById('modalFormSubtitle2');
  let sub2Text = 'Record: ' + winGames + '-' + loseGames;
  sub2.innerHTML = '';
  sub2.appendChild(document.createTextNode(sub2Text));

  updateTimeRemainingDivs();
  if (modal.hasAttribute('data-clockInt') == false) {
    setInterval(updateTimeRemainingDivs, 1000);
    modal.setAttribute('data-clockInt', 'true');
  }
}

/* ------------------------------------------------ */

function tblrowToInput(tblrow, playerValue) {

  let gameid = tblrow.getAttribute('data-game-id');
  let gdata = queryData().filter((x) => x['game_id'] == gameid)[0];
  let pdata = gdata.responses.filter((x) => x.player == playerValue)[0];

  let gamerow = tblrow.querySelector('.gamerow');
  let pickitem = tblrow.querySelector('.pickitem[data-player="' + playerValue + '"]');

  let pickFormatting = [];
  let is_faded = pickitem.classList.contains('opacity-25');
  let pickfull = pdata.pick_teamfull;
  if (gdata.state == 'post') {
    if (is_faded) pickFormatting = ['border-danger'];
    if (!is_faded) pickFormatting = ['border-success'];
  }

  let gametime = new Date(gdata.gametime_raw);
  let time_diff = (new Date() - gametime) / 1000 / 60;
  let is_open = time_diff < 5;

  let game = gamerow.cloneNode(true);
  game.removeAttribute('data-bs-toggle');
  game.removeAttribute('data-bs-target');

  game.style.borderLeft = '3px solid #0e0e0e';
  game.classList.add(...pickFormatting);
  game.setAttribute('data-picked', 'false')
  if (pickfull != '') game.setAttribute('data-picked', 'true');

  let timeRemainingDiv = document.createElement('div');
  timeRemainingDiv.classList.add('dl-clock', 'd-flex', 'flex-row', 'flex-nowrap', 'justify-content-start', 'text-sm5');
  if (is_open) timeRemainingDiv.classList.add('mt-2', 'ms-1');
  timeRemainingDiv.setAttribute('data-deadline', gdata.deadline);
  game.querySelector('.col-9').appendChild(timeRemainingDiv);

  let status = pdata.status;
  if (status == 'LATE') {
    let late = document.createElement('div');
    late.classList.add('rounded-pill', 'text-center', 'text-smaller');
    late.classList.add('bg-danger', 'text-white');
    late.classList.add('mt-2', 'ms-auto', 'me-1');
    late.textContent = 'LATE';
    game.querySelector('.col-3').appendChild(late);
  }

  let teams = game.querySelectorAll('.teamrow');

  teams.forEach((team) => {
    let tempDiv = document.createElement('div');
    let teamName = team.getAttribute('data-teamfull');
    let teamId = teamName.split(' ').join('-');

    let label = document.createElement('label');
    label.classList.add('btn', 'btn-sm', 'd-flex', 'align-items-center');
    label.setAttribute('for', teamId);
    label.innerHTML = team.innerHTML;

    let input = document.createElement('input');
    input.classList.add('btn-check');
    input.setAttribute('type', 'radio');
    input.setAttribute('name', gameid);
    input.setAttribute('id', teamId);
    input.setAttribute('value', teamName);

    if (!is_open) input.setAttribute('disabled', '');
    input.setAttribute('data-origchecked', 'false');
    if (pickfull == teamName) {
      input.setAttribute('checked', '');
      input.setAttribute('data-origchecked', 'true');
    }

    input.addEventListener('change', (e) => {
      handlePickChange(e);
    });

    tempDiv.appendChild(input);
    tempDiv.appendChild(label);
    team.replaceWith(tempDiv);
  });

  return game;
}

/* ------------------------------------------------ */

function handlePickChange(e) {

  let modal = document.getElementById('modalFormContainer');
  let submitBtn = modal.querySelector('[type="submit"]');
  let noSubmit = submitBtn.classList.contains('no-submit');
  let formInputs = modal.querySelectorAll('input');

  let inputs_changed = false;
  formInputs.forEach((input) => {
    let gr = input.closest('.gamerow');
    let orig_checked = input.getAttribute('data-origchecked') == 'true';
    if (input.checked && !orig_checked) {
      inputs_changed = true;
      gr.classList.add('border-primary');
    } else {
      if (input.checked && orig_checked) {
        gr.classList.remove('border-primary');
      }
    }
  });

  if (inputs_changed == true) {
    if (noSubmit) submitBtn.classList.remove('no-submit');
  } else {
    if (!noSubmit) submitBtn.classList.add('no-submit');
  }

  let sub = document.getElementById('modalFormSubtitle');
  let gamerows = modal.querySelectorAll('.gamerow');
  let openUnpickedGames = 0;
  let openGames = 0;
  gamerows.forEach((gr) => {
    let picked = gr.querySelector('input:checked');
    let disabled = gr.querySelector('input[disabled]');
    if (!picked && !disabled) openUnpickedGames++;
    if (!disabled) openGames++;
  });

  let subText = openGames + ' games open';
  if (openGames == 0) subText = 'No games open';
  if (openGames > 0) {
    if (openUnpickedGames > 0) subText += ' (' + openUnpickedGames + ' unpicked)';
    if (openUnpickedGames == 0) subText += ' (all picked)';
  }
  sub.innerHTML = '';
  sub.appendChild(document.createTextNode(subText));

}

/* ------------------------------------------------ */

function updateTimeRemainingDivs() {

  let dlClocks = document.querySelectorAll('.dl-clock');
  dlClocks.forEach((dlClock) => {
    let deadline = dlClock.getAttribute('data-deadline');
    let timeRemaining = calcTimeRemaining(deadline);
    dlClock.innerHTML = '';
    dlClock.appendChild(timeRemaining);
  });
}

/* ------------------------------------------------ */

function calcTimeRemaining(deadline) {

  let eLab = document.createDocumentFragment();

  let now = new Date();
  let start = new Date(deadline);
  if (now > start) {
    return eLab;
  }

  let rem = Math.abs(start - now) / (1000);
  let remD = Math.floor(rem / (60 * 60 * 24));
  let rem2 = rem - remD * 60 * 60 * 24;
  let remH = Math.floor(rem2 / (60 * 60));
  let rem3 = rem2 - remH * 60 * 60;
  let remM = Math.floor(rem3 / 60);
  let rem4 = rem3 - remM * 60;
  let remS = Math.floor(rem4);

  let vshow = {};
  let eColor = '';
  if (remD != 0) {
    vshow.M = 'd-none';
    vshow.S = 'd-none';
    eColor += 'text-dim1';
  } else if (remD == 0 && remH != 0) {
    vshow.D = 'd-none';
    vshow.S = 'd-none';
    eColor += 'text-primary-emphasis';
  } else if (remD == 0 && remH == 0 && remM != 0) {
    vshow.D = 'd-none';
    vshow.H = 'd-none';
    eColor += 'text-danger-emphasis';
  } else if (remD == 0 && remH == 0 && remM == 0 && remS != 0) {
    vshow.D = 'd-none';
    vshow.H = 'd-none';
    vshow.M = 'd-none';
    eColor += 'text-danger';
  }

  // add clock icon before
  let eIcon = document.createElement('i');
  eIcon.classList.add('fa-regular', 'fa-clock');
  eIcon.classList.add(eColor);
  eIcon.style.paddingTop = '.2rem';
  eIcon.style.paddingBottom = '.2rem';
  eIcon.style.paddingRight = '.15rem';
  eLab.appendChild(eIcon);

  let durClasses = ['text-sm5', 'fw-light'];
  let eSuffs = { 'D': 'DAY', 'H': 'HOUR', 'M': 'MIN', 'S': 'SEC' };
  let eVals = { 'D': remD, 'H': remH, 'M': remM, 'S': remS };
  ['D', 'H', 'M', 'S'].forEach((x) => {
    let e = document.createElement('div');
    e.classList.add(vshow[x]);
    e.classList.add(eColor);
    e.classList.add('my-0', 'py-0')
    let eVal = document.createElement('span');
    eVal.classList.add('px-1');
    eVal.textContent = eVals[x].toString();
    let eSuff = document.createElement('span');
    eSuff.classList.add(...durClasses);
    eSuff.textContent = (eVals[x].toString() == 1) ? eSuffs[x] : eSuffs[x] + 'S';
    e.appendChild(eVal);
    e.appendChild(eSuff);
    eLab.appendChild(e);
  });

  return eLab;

}