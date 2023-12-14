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
  });

  // let fields = Object.keys(raw[0]);
  // let wkFields = fields.filter((f) => f.includes('wk_'));
  // wkFields.forEach((f) => {
  //   let cumField = f.replace('wk_', '');
  //   let newCumFieldName = 'cum_' + cumField;
  //   raw.forEach((x) => {
  //     x[newCumFieldName] = x[cumField];
  //     x[cumField] = x[f];
  //     delete x[f];
  //   });
  // });

  let data = raw;

  return data;
}

