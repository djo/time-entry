$(function () {
  var $app = {
    apiUrl:  'http://localhost:3000/extension_api',
    errors:  $('.errors'),
    info:    $('.info'),
    spinner: $('.spinner'),
    timer:   undefined
  };

  var $buttons = {
    stop: $('a.stop'),
    play: $('a.play'),
    pause: $('a.pause'),
    resume: $('a.resume')
  };

  var $entryForm = {
    self:        $('.entry_form'),
    project:     $('input.project'),
    task:        $('input.task'),
    description: $('input.description'),
    time:        $('input.time')
  };

  var $settingsForm = {
    self:       $('.settings_form'),
    toggleLink: $('a.settings_link'),
    token:      $('input.token')
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

  function controllerUrl(path) {
    var url = $app.apiUrl + path + '?' +'user_token=' + localStorage.token;
    return url;
  };

  function saveToken(e) {
    e.preventDefault();
    localStorage.token = $settingsForm.token.val();
    $settingsForm.self.toggle();
  };

  function toggleSettingsForm(e) {
    e.preventDefault();
    $settingsForm.self.toggle();
  };

  $entryForm.description[0].addEventListener('input', function () {
    localStorage.entryDescription = this.value;
  }, false);

  function saveEntry(e) {
    e.preventDefault();

    if ($.inArray(localStorage.state, ['stopped', 'paused']) === -1) {
      $app.errors.html('First pause the timer');
      setTimeout(function () { $app.errors.empty() }, 3000);
      return;
    };

    var durationWithoutSecs = ($entryForm.time.val().match(/(\d+):(\d+)/) || [])[0];
    var params = {
      task_id: localStorage.entryTaskId,
      entry: {
        description: localStorage.entryDescription,
        duration_hours: durationWithoutSecs
      }
    };

    $app.errors.empty();
    $app.spinner.show();

    $.post(controllerUrl('/entries'), params, function (data) {
      localStorage.entryDescription = '';
      localStorage.entryProjectName = '';
      localStorage.entryProjectId = '';
      localStorage.entryTaskName = '';
      localStorage.entryTaskId = '';
      localStorage.state = 'stopped';

      $('input:visible', $entryForm.self).val('');
      chrome.browserAction.setIcon({ path: 'images/stopwatch.png' });
      $buttons.resume.hide();
      $buttons.play.show();

      $app.errors.empty();
      $app.info.html(data);

      setTimeout(function () { $app.info.empty() }, 3000);
    }).error(function (jqXHR) {
      $app.errors.html(jqXHR.responseText || 'Something went wrong, please check out your token');
    }).complete(function () {
      $app.spinner.hide();
    });
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

  $entryForm.project.autocomplete({
    source: controllerUrl('/projects'),
    minLength: 2,
    delay: 500,
    select: function(event, ui) {
      if (!ui.item) return;
      localStorage.entryProjectId = ui.item.id;
      localStorage.entryProjectName = $entryForm.project.val();
      localStorage.entryTaskId = '';
      localStorage.entryTaskName = '';
      $entryForm.task.val('');
    }
  });

  $entryForm.task.autocomplete({
    source: function(request, response) {
      var params = {
        term: request.term,
        project_id: localStorage.entryProjectId
      };
      $.get(controllerUrl('/tasks'), params, function(data) {
        response(data)
      });
    },
    minLength: 2,
    delay: 500,
    select: function(event, ui) {
      if (!ui.item) return;
      localStorage.entryTaskId = ui.item.id;
      localStorage.entryTaskName = $entryForm.task.val();
    }
  });

  // Bind events
  $settingsForm.self.submit(saveToken);
  $settingsForm.toggleLink.click(toggleSettingsForm);
  $entryForm.self.submit(saveEntry);
  $buttons.stop.click(stop);
  $buttons.play.click(play);
  $buttons.pause.click(pause);
  $buttons.resume.click(resume);

  // Set default states
  if (!localStorage.state) localStorage.state = 'stopped';
  $app.spinner.hide();

  // Prefill forms
  $settingsForm.token.val(localStorage.token);
  $entryForm.project.val(localStorage.entryProjectName);
  $entryForm.task.val(localStorage.entryTaskName);
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
