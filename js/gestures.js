let touchstartX = 0;
let touchendX = 0;
let touchstartY = 0;
let touchendY = 0;

document.addEventListener('touchstart', function (event) {
  touchstartX = event.changedTouches[0].screenX;
  touchstartY = event.changedTouches[0].screenY;
}, false);

document.addEventListener('touchend', function (event) {
  touchendX = event.changedTouches[0].screenX;
  touchendY = event.changedTouches[0].screenY;
  handleGesture(event);
}, false);

document.getElementById('main').style.transition = "transform 0.3s ease";

function handleGesture(e) {

  let diffX = touchendX - touchstartX;
  let diffY = touchendY - touchstartY;
  let mvmtX = Math.abs(diffX);
  let mvmtY = Math.abs(diffY);
  let main = document.getElementById('main');

  if (mvmtX < 200) {
    main.style.transform = "translateX(0px)";
    return;
  }

  if (mvmtX > mvmtY && diffX < 0) {
    main.style.transform = "translateX(-100%)";
    setTimeout(() => {
      window.location.href = "schedule.html";
    }, 300);
  } else {
    main.style.transform = "translateX(0px)";
  }
}