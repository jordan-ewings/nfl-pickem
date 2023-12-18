/* ------------------------------------------------ */

async function getSheet(sheet) {
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

function procStats(PlayerStats) {
  let raw = PlayerStats;
  raw.forEach((x) => {
    let fields = Object.keys(x);
    let fieldsStr = ['player', 'rank'];
    let fieldsInt = fields.filter((f) => !fieldsStr.includes(f));
    let fieldsPct = fields.filter((f) => f.includes('pct'));
    fieldsInt = fieldsInt.filter((f) => !fieldsPct.includes(f));
    fieldsInt.forEach((f) => {
      x[f] = parseInt(x[f]);
    });
    fieldsPct.forEach((f) => {
      x[f] = parseFloat(x[f]);
    });
    let rankVal = x.rankVal;
    let rankLabel = x.rank;
    x.rank = rankVal;
    x.rankLabel = rankLabel;
    delete x.rankVal;
  });

  raw.forEach((x, i) => {
    let week = x.week;
    let player = x.player;
    let rank = x.rank;
    if (week == 1) {
      x.rankChange = 0;
      return;
    }
    let prevWeek = week - 1;
    let prevRank = raw.filter((y) => y.week == prevWeek && y.player == player)[0].rank;
    let rankChange = rank - prevRank;
    rankChange = -rankChange;
    x.rankChange = rankChange;
  })

  let data = raw;
  return data;
}
