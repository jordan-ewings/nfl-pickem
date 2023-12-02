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

class El {

  constructor(tag) {
    this.tag = tag;
    this.classes = '';
    this.styles = '';
    this.src = '';
    this.inner = '';
    this.id = '';
  }

  addId(i) {
    this.id = i;
    return this;
  }

  addClass(c) {
    this.classes += ' ' + c;
    this.classes = this.classes.trim();
    return this;
  }

  addStyle(s) {
    this.styles += ' ' + s;
    this.styles = this.styles.trim();
    return this;
  }

  addSrc(s) {
    this.src = s;
    return this;
  }

  addChild(i) {
    if (!(typeof i === "string")) {
      this.inner += i.html();
    } else {
      this.inner += i;
    }
    return this;
  }

  addChildren(j) {
    j.forEach((i) => {
      if (!(typeof i === "string")) {
        this.inner += i.html();
      } else {
        this.inner += i;
      }
    });
    return this;
  }


  html() {
    let v = `<${this.tag}`;
    if (this.id != '') v += ` id="${this.id}"`;
    if (this.classes != '') v += ` class="${this.classes}"`;
    if (this.styles != '') v += ` style="${this.styles}"`;
    if (this.src != '') v += ` src="${this.src}"`;

    v += `>`;
    if (this.inner != '') v += `${this.inner}`;
    v += `</${this.tag}>`;
    return v;
  }
}