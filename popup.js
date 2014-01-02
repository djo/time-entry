(function () {
  var intervalID;

  var buttons = {
    stop:   document.querySelector('a.stop'),
    play:   document.querySelector('a.play'),
    pause:  document.querySelector('a.pause'),
    resume: document.querySelector('a.resume')
  };

  var form = {
    self:    document.querySelector('form'),
    task:    document.querySelector('input.task'),
    time:    document.querySelector('input.time'),
    history: document.querySelector('textarea.history')
  };

  // restore the previous session
  if (!localStorage.state) localStorage.state = 'stopped';
  form.task.value = localStorage.task;
  form.history.value = localStorage.history;

  // bind events
  buttons.play.addEventListener('click', play);
  buttons.pause.addEventListener('click', pause);
  buttons.stop.addEventListener('click', stop);
  buttons.resume.addEventListener('click', resume);
  form.self.addEventListener('submit', track);
  form.task.addEventListener('change', storeTask);
  form.history.addEventListener('change', storeHistory);

  // init the timer
  if (localStorage.state === 'stopped') {
    display(buttons.play);
    setBrowserIcon('stopwatch.png');
  } else if (localStorage.state === 'playing') {
    display(buttons.pause);
    setBrowserIcon('playwatch.png');
    startTimer();
  } else if (localStorage.state === 'paused') {
    display(buttons.resume);
    setBrowserIcon('pausewatch.png');
    displayDuration(pausedDuration());
  };

  function play(e) {
    e.preventDefault();

    hide(buttons.play);
    display(buttons.pause);
    setBrowserIcon('playwatch.png');

    localStorage.state = 'playing';
    localStorage.startedTime = new Date().getTime();
    startTimer();
  };

  function pause(e) {
    e.preventDefault();

    hide(buttons.pause);
    display(buttons.resume);
    setBrowserIcon('pausewatch.png');

    localStorage.state = 'paused';
    localStorage.pausedTime = new Date().getTime();
    clearInterval(intervalID);
  };

  function stop(e) {
    e.preventDefault();

    clearInterval(intervalID);
    localStorage.state = 'stopped';
    localStorage.pausedTime = null;
    localStorage.startedTime = null;

    form.time.value = '';
    hide(buttons.pause);
    hide(buttons.resume);
    display(buttons.play);
    setBrowserIcon('stopwatch.png');
  };

  function resume(e) {
    e.preventDefault();

    hide(buttons.resume);
    display(buttons.pause);
    setBrowserIcon('playwatch.png');

    localStorage.state = 'playing';
    localStorage.startedTime = (new Date()).getTime() - pausedDuration();
    localStorage.pausedTime = null;
    startTimer();
  };

  function track(e) {
    e.preventDefault();
    if (!form.time.value) return;

    // parse duration string into 1h15m format
    var time = form.time.value.split(':');
    if (time.length === 2) time.push('0');
    var hours = Number(time[0]),
        mins  = Number(time[1]),
        secs  = Number(time[2]);
    if (secs > 0) {
      mins += 1;
    }
    if (mins > 59) {
      mins = 0;
      hours += 1;
    }
    var formatted = '';
    if (mins > 0) formatted = mins + 'm';
    if (hours > 0) formatted = hours + 'h' + formatted;

    // put it into the history
    var entry = form.task.value + " ~ " + formatted;
    form.history.value = entry + '\n' + form.history.value;
    storeHistory();
  };

  function displayDuration(ms) {
    var secNumber = ms * 0.001,
        hours = Math.floor(secNumber/ 3600),
        minutes = Math.floor((secNumber - (hours * 3600)) / 60),
        seconds = Math.floor(secNumber - (hours * 3600) - (minutes * 60));

    if (hours < 10)   hours   = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;

    form.time.value = hours + ':' + minutes + ':' + seconds;
  };

  function startTimer() {
    intervalID = setInterval(function () {
      var duration = (new Date()).getTime() - Number(localStorage.startedTime);
      displayDuration(duration);
    }, 1000);
  };

  function pausedDuration() {
    return Number(localStorage.pausedTime) - Number(localStorage.startedTime);
  };

  function storeTask() {
    localStorage.task = form.task.value;
  };

  function storeHistory() {
    localStorage.history = form.history.value;
  };

  function setBrowserIcon(icon) {
    var path = 'images/' + icon;
    chrome.browserAction.setIcon({ path: path });
  };

  function display(el) {
    el.style.display = 'inline-block';
  }

  function hide(el) {
    el.style.display = 'none';
  }
})();
