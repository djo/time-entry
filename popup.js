$(function () {
  var intervalID;

  var $buttons = {
    stop:   $('a.stop'),
    play:   $('a.play'),
    pause:  $('a.pause'),
    resume: $('a.resume')
  };

  var $form = {
    self:    $('.entry-form'),
    task:    $('input.task'),
    time:    $('input.time'),
    history: $('textarea.history')
  };

  // restore the previous session
  if (!localStorage.state) localStorage.state = 'stopped';
  $form.task.val(localStorage.task);
  $form.history.val(localStorage.history);

  // bind events
  $buttons.play.click(play);
  $buttons.pause.click(pause);
  $buttons.stop.click(stop);
  $buttons.resume.click(resume);
  $form.self.submit(track);
  $form.task.change(storeTask);
  $form.history.change(storeHistory);

  // init the timer
  if (localStorage.state === 'stopped') {
    $buttons.play.css('display', 'inline-block');
    setBrowserIcon('stopwatch.png');
  } else if (localStorage.state === 'playing') {
    $buttons.pause.css('display', 'inline-block');
    setBrowserIcon('playwatch.png');
    startTimer();
  } else if (localStorage.state === 'paused') {
    $buttons.resume.css('display', 'inline-block');
    setBrowserIcon('pausewatch.png');
    displayDuration(pausedDuration());
  };

  function play(e) {
    e.preventDefault();

    $buttons.play.hide();
    $buttons.pause.css('display', 'inline-block');
    setBrowserIcon('playwatch.png');

    localStorage.state = 'playing';
    localStorage.startedTime = new Date().getTime();
    startTimer();
  };

  function pause(e) {
    e.preventDefault();

    $buttons.pause.hide();
    $buttons.resume.css('display', 'inline-block');
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

    $form.time.val('');
    $buttons.pause.hide();
    $buttons.resume.hide();
    $buttons.play.css('display', 'inline-block');
    setBrowserIcon('stopwatch.png');
  };

  function resume(e) {
    e.preventDefault();

    $buttons.resume.hide();
    $buttons.pause.css('display', 'inline-block');
    setBrowserIcon('playwatch.png');

    localStorage.state = 'playing';
    localStorage.startedTime = (new Date()).getTime() - pausedDuration();
    localStorage.pausedTime = null;
    startTimer();
  };

  function track(e) {
    e.preventDefault();

    var value = $form.time.val();
    if (!value) return;

    // parse duration string into 1h15m format
    var time = value.split(':');
    if (time.length === 2) time.unshift('0');
    var hours = Number(time[0]),
        mins  = Number(time[1]),
        secs  = Number(time[2]);
    if (secs > 0) mins += 1;
    var formatted = mins + 'm';
    if (hours > 0) formatted = hours + 'h' + formatted;

    // put it into the history
    var entry = formatted + " ~ " + $form.task.val();
    $form.history.val(entry + '\n' + $form.history.val());
    $form.history.trigger('change');
  };

  function displayDuration(ms) {
    var secNumber = ms * 0.001,
        hours = Math.floor(secNumber/ 3600),
        minutes = Math.floor((secNumber - (hours * 3600)) / 60),
        seconds = Math.floor(secNumber - (hours * 3600) - (minutes * 60));

    if (hours < 10)   hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;

    var duration = hours + ':' + minutes + ':' + seconds;
    $form.time.val(duration);
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
    localStorage.task = this.value;
  };

  function storeHistory() {
    localStorage.history = this.value;
  };

  function setBrowserIcon(icon) {
    var path = 'images/' + icon;
    chrome.browserAction.setIcon({ path: path });
  };
});
