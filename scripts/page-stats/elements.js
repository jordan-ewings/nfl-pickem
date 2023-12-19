/* ------------------------------------------------ */

function generateFilters() {

  let userOptions = document.getElementById('userOptions');
  let inputs = ['player', 'field'];
  inputs.forEach((input) => {

    let group = document.createElement('div');
    group.classList.add('px-2', 'text-sm3', 'dataPicker');
    group.setAttribute('id', input + 'Picker');
    group.setAttribute('data-name', input);

    let optionsKey = input + 's';
    let options = DATA.Chart[optionsKey].map((x) => {
      let label, value;
      if (input == 'field') {
        label = x.label;
        value = x.field;
      } else if (input == 'player') {
        label = x;
        value = x;
      }
      return { label: label, value: value };
    });

    options.forEach((option, index) => {

      let div = document.createElement('div');
      div.classList.add('d-flex', 'justify-content-between', 'align-items-center');
      div.classList.add('form-check', 'form-switch');

      let className = input + 'Choice';
      let inp = document.createElement('input');
      inp.classList.add('form-check-input', className);
      inp.setAttribute('type', 'checkbox');
      inp.setAttribute('role', 'switch');
      inp.setAttribute('id', input + index);
      inp.setAttribute('name', input);
      inp.setAttribute('data-name', input);
      inp.setAttribute('data-value', option.value);
      inp.setAttribute('data-label', option.label);
      inp.addEventListener('change', (e) => {
        let picker = e.target.closest('.dataPicker');
        let options = picker.querySelectorAll('input:checked');
        if (options.length == 0) {
          e.target.setAttribute('checked', '');
          e.target.checked = true;
          return;
        }

        let checked = e.target.checked;
        if (checked) {
          e.target.setAttribute('checked', '');
        } else {
          e.target.removeAttribute('checked');
        }


        let toggler = picker.closest('.dropdown').querySelector('.dropdown-toggle');
        let text = '';
        if (options.length == 1) {
          text = options[0].getAttribute('data-label');
        } else {
          text = 'Multiple';
        }
        toggler.innerText = text;

        // if has multiple selected, switch other input (field or player) options to radio
        let thisname = e.target.getAttribute('data-name');
        let othername = (thisname == 'player') ? 'field' : 'player';
        let otherpicker = document.getElementById(othername + 'Picker');
        let otherinputs = otherpicker.querySelectorAll('input');
        if (options.length > 1) {
          otherinputs.forEach((input) => {
            input.setAttribute('type', 'radio');
          });
        } else {
          otherinputs.forEach((input) => {
            input.setAttribute('type', 'checkbox');
          });
        }

        updateChart(e);
      });

      if (index == 0) {
        inp.setAttribute('checked', '');
        DATA.Chart.active[optionsKey].push(option.value);
      }

      let label = document.createElement('label');
      label.classList.add('form-check-label');
      label.setAttribute('for', input + index);
      label.innerText = option.label;

      div.appendChild(inp);
      div.appendChild(label);
      group.appendChild(div);
    });


    let menu = document.createElement('div');
    menu.classList.add('dropdown-menu', 'bg-main');
    menu.appendChild(group);

    let toggler = document.createElement('button');
    toggler.classList.add('btn', 'btn-sm', 'dropdown-toggle', 'w-100');
    toggler.setAttribute('type', 'button');
    toggler.setAttribute('data-bs-toggle', 'dropdown');

    let inital = group.querySelector('input:checked');
    toggler.innerText = inital.getAttribute('data-label');

    let dropdown = document.createElement('div');
    dropdown.classList.add('dropdown');
    dropdown.appendChild(toggler);
    dropdown.appendChild(menu);

    let label = document.createElement('label');
    label.classList.add('form-label', 'text-sm4', 'text-dim2', 'text-uppercase', 'mb-0');
    label.setAttribute('for', input + 'Picker');
    label.innerText = input + 's';

    // wrapper
    let wrapper = document.createElement('div');
    wrapper.classList.add('col-6', 'text-center');
    wrapper.appendChild(label);
    wrapper.appendChild(dropdown);

    userOptions.appendChild(wrapper);
  });
}
