$(function () {
  var apiUrl       = 'http://localhost:3000/extension_api',
      tokenInput   = $('#token'),
      settingsLink = $('.settings_link'),
      settingsForm = $('.settings_form'),
      entryForm    = $('.entry_form'),
      project      = $('.project', entryForm),
      task         = $('.task', entryForm),
      description  = $('.description', entryForm),
      time         = $('.time', entryForm),
      errors       = $('.errors'),
      info         = $('.info'),
      spinner      = $('.spinner'),
      entry        = {}

  var controllerUrl = function (path) {
    var url = apiUrl + path + '?' +'user_token=' + localStorage.token
    return url
  }

  spinner.hide()

  if (localStorage.token)
    tokenInput.val(localStorage.token)

  settingsForm.submit(function (e) {
    e.preventDefault()
    localStorage.token = tokenInput.val()
    settingsForm.toggle()
  })

  settingsLink.click(function (e) {
    e.preventDefault()
    settingsForm.toggle()
  })

  entryForm.submit(function (e) {
    e.preventDefault()

    errors.empty()

    var params = {
      task_id: entry.task_id,
      entry: {
        description: description.val(),
        duration_hours: time.val()
      }
    }

    spinner.show()

    $.post(controllerUrl('/entries'), params, function (data) {
      errors.empty()
      info.html(data)

      setTimeout(function () { info.empty() }, 3000)
    }).error(function (jqXHR) {
      errors.html(jqXHR.responseText)
    }).complete(function () {
      spinner.hide()
    })
  })

  project.autocomplete({
    source: controllerUrl('/projects'),
    minLength: 2,
    delay: 500,
    select: function(event, ui) {
      if (ui.item) {
        entry.project_id = ui.item.id
        entry.task_id = undefined
        task.val('')
      }
    }
  })

  task.autocomplete({
    source: function(request, response) {
      var params = {
        term: request.term,
        project_id: entry.project_id
      }
      $.get(controllerUrl('/tasks'), params, function(data) {
        response(data)
      })
    },
    minLength: 2,
    delay: 500,
    select: function(event, ui) {
      if (ui.item) {
        entry.task_id = ui.item.id
      }
    }
  })
})
