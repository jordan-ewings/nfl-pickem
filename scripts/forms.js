
function submitForm(e) {
  e.preventDefault();

  // change submit button to show loading
  let submitBtn = e.target.querySelector('[type="submit"]');
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
  submitBtn.setAttribute('disabled', '');

  let formData = new FormData(e.target);
  formData.append('timestamp', new Date().toLocaleString());
  let formUrlParams = new URLSearchParams(formData).toString();
  let formUrlRoot = 'https://script.google.com/macros/s/AKfycbxveY_vNT4LvlRThJQuaRszp9WmEXfKv376CgdNbRM1Gy5jWUjwGmxCo3Jv0fOpacpz/exec';
  let formUrl = formUrlRoot + '?' + formUrlParams;
  console.log(formUrl);

  var requestOptions = {
    method: 'POST',
    redirect: 'follow'
  };

  let modal = document.getElementById('modalFormContainer');
  let modalFooter = modal.querySelector('.modal-footer');
  let modalMessage = document.getElementById('modalMessage');
  let modalForm = document.getElementById('modalForm');

  fetch(formUrl, requestOptions)
    .then(response => response.json())
    .then(result => {
      console.log(result);
      submitBtn.innerHTML = '<i class="fa-solid fa-check"></i>';

      // incorpFormData(formData);
      setTimeout(() => {
        let modalBS = bootstrap.Modal.getInstance(modal);
        modalBS.hide();
        // modalMessage.classList.add('d-none');
        submitBtn.removeAttribute('disabled');
        submitBtn.innerHTML = 'Change Picks';
      }, 300);
    })
    .catch(error => {
      console.log('error', error);
      submitBtn.innerHTML = '<i class="fa-solid fa-exclamation"></i>';
      modalMessage.classList.remove('d-none');
      modalMessage.textContent = 'Something went wrong. Please try again.';
      setTimeout(() => {
        modalMessage.classList.add('d-none');
        submitBtn.removeAttribute('disabled');
        submitBtn.innerHTML = 'Change Picks';
      }, 3000);
    });

}

function incorpFormData(formData) {
  let player = formData.get('player');
  let gameids = [...formData.keys()];
  // filter out non-gameid keys (gameid keys only contain numbers)
  gameids = gameids.filter((x) => !isNaN(x));
  gameids.forEach((gameid) => {
    let teamname = formData.get(gameid);
    let gamerow = document.querySelector('.gamerow[data-gameid="' + gameid + '"]');
    let teamrow = gamerow.querySelector('.teamrow[data-teamfull="' + teamname + '"]');
    let tblrow = gamerow.closest('.tblrow');
    let pickitem = tblrow.querySelector('.pickitem[data-player="' + player + '"]');
    pickitem.setAttribute('data-pick-teamfull', teamrow.getAttribute('data-teamfull'));
    pickitem.setAttribute('data-pick-teamshort', teamrow.getAttribute('data-teamshort'));
    pickitem.setAttribute('data-pick-team', teamrow.getAttribute('data-team'));
    pickitem.querySelector('img').src = teamrow.querySelector('img').src;
  });
}


function prepareForm(e) {

  let modal = document.getElementById('modalFormContainer');
  let modalFormGames = document.getElementById('modalFormGames');
  let modalForm = document.getElementById('modalForm');
  let modalFooter = document.getElementById('modalForm').querySelector('.modal-footer');
  if (!modalFooter.classList.contains('d-none')) {
    modalFooter.classList.add('d-none');
  }

  let playerSelect = modal.querySelector('#player');

  let playerValue = playerSelect.value;
  let f_playerSet = playerSelect.value != 'Player';
  let f_pickitem = e.target.parentElement.classList.contains('pickitem');
  if (f_pickitem) {
    let pickitem = e.target.parentElement;
    playerValue = pickitem.getAttribute('data-player');
    playerSelect.value = playerValue;

    // store week number in modalForm
    // let weekDiv = pickitem.closest('.week-games');
    let weekNum = DATA.tblGames.week;
    modalForm.setAttribute('data-week', weekNum);

  }

  let weekNum = modalForm.getAttribute('data-week');
  let tblrows = document.querySelectorAll('.tblrow');
  modalFormGames.innerHTML = '';
  let openGames = tblrows.length;
  let pickedGames = 0;

  tblrows.forEach((tblrow) => {

    let teamSelectValue = '';
    let pickFormatting = [];
    let pickitem = tblrow.querySelector('.pickitem[data-player="' + playerValue + '"]');
    let is_faded = pickitem.classList.contains('opacity-25');
    let status = pickitem.getAttribute('data-status');
    teamSelectValue = pickitem.getAttribute('data-pick-teamfull');

    if (tblrow.classList.contains('game-post')) {
      if (is_faded) {
        pickFormatting = ['border-danger'];
      } else {
        pickFormatting = ['border-success'];
      }
    }

    let gamerow = tblrow.querySelector('.gamerow');
    let gameid = gamerow.getAttribute('data-gameid');
    let gametime_raw = gamerow.getAttribute('data-gametime');
    let gametime = new Date(gametime_raw);
    let currtime = new Date();
    let time_diff = (currtime - gametime) / 1000 / 60;
    let is_open = time_diff < 5;
    if (!is_open) openGames--;

    // wrap each team in a radio button input
    modalFormGames.appendChild(gamerow.cloneNode(true));
    let game = modalFormGames.querySelector('.gamerow[data-gameid="' + gameid + '"]');

    // remove data attributes related to collapsing
    game.removeAttribute('data-bs-toggle');
    game.removeAttribute('data-bs-target');

    game.classList.add('rounded-end-3', 'mb-3', 'bg-main', 'pb-2', 'ps-1');
    game.style.borderTop = 'none';
    game.style.borderLeft = '3px solid #0e0e0e';
    game.classList.add(...pickFormatting);
    game.setAttribute('data-picked', 'false')
    if (teamSelectValue != '') game.setAttribute('data-picked', 'true');

    let timeRemainingDiv = document.createElement('div');
    timeRemainingDiv.classList.add('dl-clock');
    timeRemainingDiv.classList.add('d-flex', 'flex-row', 'flex-nowrap', 'justify-content-start', 'text-smaller');
    if (is_open) timeRemainingDiv.classList.add('mt-2');
    timeRemainingDiv.setAttribute('data-deadline', gametime_raw);
    game.querySelector('.col-9').appendChild(timeRemainingDiv);

    if (status == 'LATE') {
      let late = document.createElement('div');
      late.classList.add('rounded-pill', 'text-center', 'text-smaller');
      late.classList.add('bg-danger', 'text-white');
      late.textContent = 'LATE';
      late.classList.add('mt-2', 'ms-auto', 'me-1');
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

      // if teamSelectValue matches teamName, check the input
      if (teamSelectValue == teamName) {
        input.setAttribute('checked', '');
        input.setAttribute('data-origchecked', 'true');
        pickedGames++;
      } else {
        input.setAttribute('data-origchecked', 'false');
      }

      if (!is_open) {
        input.setAttribute('disabled', '');
      }

      // if any input values change, show modal footer
      input.addEventListener('change', (e) => {

        let modal = document.getElementById('modalFormContainer');
        let modalFooter = modal.querySelector('.modal-footer');
        let footerHidden = modalFooter.classList.contains('d-none');
        let formInputs = modal.querySelectorAll('input');

        let inputs_changed = false;
        formInputs.forEach((input) => {
          let gr = input.closest('.gamerow');
          let orig_checked = input.getAttribute('data-origchecked') == 'true';
          if (input.checked && !orig_checked) {
            inputs_changed = true;
            gr.classList.add('border-primary');
            // }
          } else {
            if (input.checked && orig_checked) {
              gr.classList.remove('border-primary');
            }
          }
        });

        if (inputs_changed == true) {
          if (footerHidden) modalFooter.classList.remove('d-none');
        } else {
          if (!footerHidden) modalFooter.classList.add('d-none');
        }
      });

      tempDiv.appendChild(input);
      tempDiv.appendChild(label);
      team.replaceWith(tempDiv);

    });
  });

  let mHeader = document.getElementById('modalFormContainerLabel');
  let headtext = 'Week ' + weekNum;
  mHeader.innerHTML = '';
  // mHeader.textContent = headtext;
  mHeader.appendChild(document.createTextNode(headtext));

  let mSub = document.getElementById('modalFormSubtitle');
  let ttlGames = tblrows.length;
  let subtext = ttlGames + ' game' + ((ttlGames == 1) ? '' : 's') + ' (';
  if (openGames == 0) {
    subtext += 'all closed)';
  } else {
    subtext += openGames + ' open)';
  }
  mSub.innerHTML = '';
  mSub.appendChild(document.createTextNode(subtext));

  let mSub2 = document.getElementById('modalFormSubtitle2');

  let subtext2 = pickedGames + ' of ' + ttlGames + ' games picked';
  if (pickedGames == 0) subtext2 = 'No games picked';
  // mSub2.textContent = subtext2;
  mSub2.innerHTML = '';
  mSub2.appendChild(document.createTextNode(subtext2));

  updateTimeRemainingDivs();
  if (modal.hasAttribute('data-clockInt') == false) {
    setInterval(updateTimeRemainingDivs, 5000);
    modal.setAttribute('data-clockInt', 'true');
  }
}



function updateTimeRemainingDivs() {

  let dlClocks = document.querySelectorAll('.dl-clock');
  dlClocks.forEach((dlClock) => {
    let deadline = dlClock.getAttribute('data-deadline');
    let timeRemaining = calcTimeRemaining(deadline);
    dlClock.innerHTML = '';
    dlClock.appendChild(timeRemaining);
  });
}

function calcTimeRemaining(deadline) {

  let eLab = document.createDocumentFragment();

  let now = new Date();
  let start = new Date(deadline);
  if (now > start) {
    // return;
    // let e = document.createElement('span');
    // e.classList.add('text-dim');
    // e.textContent = 'Closed';
    // eLab.appendChild(e);
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
    eColor += 'text-dim';
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

  let durClasses = ['text-smaller', 'opacity-75', 'fw-light'];
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