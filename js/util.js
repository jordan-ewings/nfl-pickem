/* ------------------------------------------------ */

export async function getSheet(sheet) {
  const shname = sheet.split(' ').join('+');
  const resp = await fetch('https://docs.google.com/spreadsheets/d/14ZYopWScY-nkBJ4Eq7DpLqRw6s2Fre3EWYkKsCIc8lU/gviz/tq?tqx=out:json&tq&sheet=' + shname);
  const raw = await resp.text();

  const table = JSON.parse(raw.substring(47).slice(0, -2))['table'];
  let headers;
  let data;

  if (table.parsedNumHeaders == 1) {
    headers = table.cols.map((x) => {
      if (x) return x.label;
    }).filter(function (el) {
      return el != null;
    });
    data = table.rows.filter((x, index) => index >= 0);
  } else {
    headers = table.rows[0].c.map((x) => {
      if (x) return x.v;
    }).filter(function (el) {
      return el != null;
    });
    data = table.rows.filter((x, index) => index >= 1);
  }

  data = data.map((row) => {
    let d = {};
    let cols = headers;
    cols.forEach((c) => {
      let val = row.c[headers.indexOf(c)];
      if (val == null) {
        d[c] = '';
      } else {
        if (val.f) {
          d[c] = val.f;
        } else {
          d[c] = val.v;
        }
      }
    });
    return d;
  });

  return data;
}

/* ------------------------------------------------ */

export function createFromTemplate(templateId) {
  let template = document.getElementById(templateId);
  let clone = template.content.cloneNode(true);
  return clone.firstElementChild;
}

/* ------------------------------------------------ */

export function getItem(element, dataItem) {
  let item = element.querySelector('[data-item="' + dataItem + '"]');
  return item;
}

/* ------------------------------------------------ */

export function formatNumber(val, f = '0', zero = 'default', scale = 1) {

  if (typeof val == 'string') return val;
  if (val == null) return '';
  if (isNaN(val)) return '';
  val = val / scale;

  let isPct = f.includes('%');
  let prefix = f.match(/^[^\d]*/)[0];
  let suffix = f.match(/[^\d]*$/)[0];
  f = f.replace(prefix, '').replace(suffix, '');

  let fs = f.split('.');
  let dec = fs.length == 2 ? fs[1].length : 0;
  let v = isPct ? val * 100 : val;

  let s = v.toFixed(dec);
  if (s == '-0') s = '0';
  let sSpl = s.split('.');
  let sInt = sSpl[0];
  let sDec = sSpl.length == 2 ? '.' + sSpl[1] : '';
  let sIntSpl = sInt.split('');
  let sIntRev = sIntSpl.reverse();
  let sIntRevSpl = [];
  sIntRev.forEach((x, i) => {
    if (i % 3 == 0 && i != 0) sIntRevSpl.push(',');
    sIntRevSpl.push(x);
  });

  let sIntRevSplRev = sIntRevSpl.reverse();
  let sIntRevSplRevStr = sIntRevSplRev.join('');
  let sVal = sIntRevSplRevStr + sDec;

  if (val == 0) {
    if (zero == 'default') {
      return prefix + sVal + suffix;
    } else {
      return zero;
    }
  }

  return prefix + sVal + suffix;
}

/* ------------------------------------------------ */

export function formatRecord(record) {
  let recordSpl = record.split('-');
  let wl = [recordSpl[0], '-', recordSpl[1]];
  let div = document.createElement('div');
  div.classList.add('d-flex', 'w-100', 'justify-content-center');
  wl.forEach((x, j) => {
    let span = document.createElement('div');
    if (j == 1) {
      span.classList.add('text-dim2', 'text-center');
      span.style.width = '10px';
    }
    span.innerHTML = x;
    div.appendChild(span);
  });
  return div;
}





