function loadNav(active) {
  let slot = document.querySelector('#navPlaceholder');
  fetch('templates/nav.html')
    .then(response => response.text())
    .then(nav => {
      slot.outerHTML = nav;
    })
    .then(() => {
      document.querySelector('#nav-' + active)
        .classList.add('active');
    });
}
