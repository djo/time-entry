$(function () {
  var $app = {
    timer: undefined
  };

  var $buttons = {
    stop: $('a.stop'),
    play: $('a.play'),
    pause: $('a.pause'),
    resume: $('a.resume')
  };

  var $entryForm = {
    self:        $('.entry-form'),
    description: $('input.description'),
    time:        $('input.time')
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
    $entryForm.time.val(duration);
  };

  function pausedDuration() {
    return Number(localStorage.pausedTime) - Number(localStorage.startedTime);
  };

  function startTimer() {
    $app.timer = setInterval(function () {
      displayDuration((new Date()).getTime() - Number(localStorage.startedTime))
    }, 1000);
  };

  $entryForm.description[0].addEventListener('input', function () {
    localStorage.entryDescription = this.value;
  }, false);

  function saveEntry(e) {
    e.preventDefault();

    if ($.inArray(localStorage.state, ['stopped', 'paused']) === -1) {
      console.log('First pause the timer')
      return;
    };

    var durationWithoutSecs = ($entryForm.time.val().match(/(\d+):(\d+)/) || [])[0];

    console.log(localStorage.entryDescription + ": " + durationWithoutSecs)

    localStorage.entryDescription = '';
    localStorage.state = 'stopped';

    $('input:visible', $entryForm.self).val('');
    chrome.browserAction.setIcon({ path: 'images/stopwatch.png' });
    $buttons.resume.hide();
    $buttons.play.show();
  };

  function stop(e) {
    e.preventDefault();

    clearInterval($app.timer);
    localStorage.state = 'stopped';
    $entryForm.time.val('');
    $buttons.pause.hide();
    $buttons.resume.hide();
    $buttons.play.css('display', 'inline-block');
    chrome.browserAction.setIcon({ path: 'images/stopwatch.png' });
  };

  function play(e) {
    e.preventDefault();

    $buttons.play.hide();
    $buttons.pause.css('display', 'inline-block');
    chrome.browserAction.setIcon({ path: 'images/playwatch.png' });

    localStorage.state = 'playing';
    localStorage.startedTime = new Date().getTime();
    startTimer();
  }

  function pause(e) {
    e.preventDefault();

    $buttons.pause.hide();
    $buttons.resume.css('display', 'inline-block');
    chrome.browserAction.setIcon({ path: 'images/pausewatch.png' });

    localStorage.state = 'paused';
    localStorage.pausedTime = new Date().getTime();
    clearInterval($app.timer);
  }

  function resume(e) {
    e.preventDefault();

    $buttons.resume.hide();
    $buttons.pause.css('display', 'inline-block');
    chrome.browserAction.setIcon({ path: 'images/playwatch.png' });

    localStorage.state = 'playing';
    localStorage.startedTime = (new Date()).getTime() - pausedDuration();
    startTimer();
  }

  // Bind events
  $entryForm.self.submit(saveEntry);
  $buttons.stop.click(stop);
  $buttons.play.click(play);
  $buttons.pause.click(pause);
  $buttons.resume.click(resume);

  // Set default states
  if (!localStorage.state) localStorage.state = 'stopped';

  // Prefill forms
  $entryForm.description.val(localStorage.entryDescription);

  switch(localStorage.state) {
    case 'stopped':
      $buttons.play.css('display', 'inline-block');
      chrome.browserAction.setIcon({ path: 'images/stopwatch.png' });
      break;
    case 'playing':
      $buttons.pause.css('display', 'inline-block');
      chrome.browserAction.setIcon({ path: 'images/playwatch.png' });
      startTimer();
      break;
    case 'paused':
      $buttons.resume.css('display', 'inline-block');
      chrome.browserAction.setIcon({ path: 'images/pausewatch.png' });
      displayDuration(pausedDuration());
      break;
  };
});
