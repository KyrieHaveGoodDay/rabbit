$(function () {
  let $gameW;
  let $gameH;
  let xStart;
  let yStart;
  let xEnd;
  let yEnd;
  let $gameBarW;

  // check device
  const isMobile = () =>
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      ? true
      : false;
  const userEvent = isMobile() ? 'touchstart' : 'click';

  // loading progress
  let imgs = document.images,
    len = imgs.length,
    counter = 0;
  [].forEach.call(imgs, function (img) {
    if (img.complete) incrementCounter();
    else img.addEventListener('load', incrementCounter, false);
  });
  function incrementCounter() {
    counter++;
    if (counter === len) {
      console.log('All img load');
    }
  }
  let loadingTime = 1500;
  function countDown() {
    console.log(loadingTime);
    loadingTime -= 300;
    if (loadingTime < 0 || counter === len) {
      clearInterval(timer);
      setSize();
      $('.loading_mask').fadeOut(200);
    }
  }
  let timer = setInterval(countDown, 300);

  // variable
  const $item = $('.game__main--item');
  const $tool = $('.game__main--tool');
  const $progress = $('.game__footer--progress');
  const $itemFinal = $('.game__main--final');
  const $resultModal = $('.result-modal');
  const $resultLink = $('.result-link');
  const $rabbit = $('.game__main--rabbit');
  // 麻薯
  const svg1 = document.getElementById('circle1');
  const s1 = Snap(svg1);
  const s1state1 = Snap.select('#s1state1');
  const s1state2 = Snap.select('#s1state2');
  const s1state3 = Snap.select('#s1state3');
  const s1state1Points = s1state1.node.getAttribute('d');
  const s1state2Points = s1state2.node.getAttribute('d');
  const s1state3Points = s1state3.node.getAttribute('d');
  let s1toState2 = function () {
    s1state1.animate({ d: s1state2Points }, 200, s1toState1);
  };
  let s1toState1 = function () {
    s1state1.animate({ d: s1state1Points }, 1000, mina.elastic);
  };
  let s1toState3 = function () {
    s1state1.animate({ d: s1state3Points }, 400);
  };
  function mochiAni() {
    s1toState2();
  }

  // game variable
  let hitPoint = 0;
  let tl;

  function setSize() {
    $gameW = $('.game').width();
    $gameH = $('.game').height();
    xStart = $gameW * 0.53;
    yStart = $gameH * 0.47;
    xEnd = $gameW * 0.1;
    yEnd = $gameH * 0.92;
    $gameBarW = $('.game__footer--bar').width() / 20;
  }

  // hit controller
  function hitController() {
    // animation
    tl = gsap.timeline();
    tl.fromTo(
      $tool,
      { rotation: 0 },
      { xPercent: -70, yPercent: 30, duration: 0.05, rotation: -55, repeat: 1, yoyo: true }
    );
    mochiAni();

    if (hitPoint < 100) {
      hitPoint += 5;
      let nowPoint = hitPoint;
      addLight(nowPoint);
    } else {
      $item.addClass('pointer-none');
      s1state1.stop();
    }
    if (hitPoint >= 50 && hitPoint < 100) {
      gsap.set($rabbit, { backgroundPositionX: '50%' });
    }
  }

  // add points
  let easeObj = ['power1.in', 'power1.out', 'power2.out', 'power3.out', 'none'];

  // add light
  function addLight(nowPoint) {
    let $light = $('<img class="light" src="img/20210901/light.png">');
    gsap.set($light, { x: xStart, y: yStart });
    $('.game').append($light);
    let ease = easeObj[Math.floor(R(0, 5))];
    let tl = gsap.timeline();
    tl.to($light, {
      duration: 1,
      y: yEnd,
      onComplete: function () {
        checkItemStatus(nowPoint);
      },
    });
    tl.to($light, { duration: 1.1, x: xEnd, ease: ease }, 0);
    tl.to(
      $light,
      {
        duration: 0.3,
        opacity: 0,
        onComplete: function () {
          $light.remove();
        },
      },
      0.7
    );
    tl.to($progress, { duration: 0.4, width: `${100 - nowPoint}%`, ease: 'power2.out' }, 1);
    xEnd += $gameBarW;
    console.log(xEnd);
  }

  // check is game over?
  function checkItemStatus(nowPoint) {
    if (nowPoint >= 100) {
      gameOver();
    }
  }

  // game over
  function gameOver() {
    s1toState3();
    let tl = gsap.timeline();
    // mochi animate
    tl.to(svg1, { duration: 0.5, yPercent: -30 });
    tl.to($tool, { duration: 1, y: '-50%', opacity: 0 }, 0);
    tl.set($rabbit, { backgroundPositionX: '100%' }, 0);
    tl.to(
      $rabbit,
      { duration: 0.5, yPercent: -90, xPercent: 20, rotation: 20, ease: 'power3.out' },
      0
    );
    setTimeout(() => {
      modalShow();
    }, 1000);
  }

  // modal show
  function modalShow() {
    let tl = gsap.timeline({ delay: 0.5 });
    tl.to($resultModal, { duration: 0.5, opacity: 1, onComplete: boxmanIn() });
  }

  // boxman in
  function boxmanIn() {
    let tl = gsap.timeline();
    tl.to($resultLink, { duration: 1, scale: 1, ease: 'elastic.out(1, 0.3)' });
    tl.from(
      $resultLink,
      {
        duration: 0.6,
        y: '-20%',
        ease: 'bounce.out',
        onComplete: function () {
          $resultModal.addClass('show');
        },
      },
      0.6
    );
  }
  // hit control
  $item.on('click', () => hitController());
});

// random number
function R(min, max) {
  return min + Math.random() * (max - min);
}

// 阻止默認的處理方式(阻止下拉滑動的效果)
document.body.addEventListener(
  'touchmove',
  function (e) {
    e.preventDefault();
  },
  { passive: false }
);
