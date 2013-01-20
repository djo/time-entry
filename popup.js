$(function () {
  var app = {
    apiUrl:   'http://localhost:3000/extension_api',
    errors:   $('.errors'),
    info:     $('.info'),
    spinner:  $('.spinner'),
    newEntry: {}
  }

  var entryForm = {
    self:        $('.entry_form'),
    project:     $('input.project'),
    task:        $('input.task'),
    description: $('input.description'),
    time:        $('input.time')
  }

  var settingsForm = {
    self:       $('.settings_form'),
    toggleLink: $('a.settings_link'),
    token:      $('input.token')
  }

  var controllerUrl = function (path) {
    var url = app.apiUrl + path + '?' +'user_token=' + localStorage.token
    return url
  }

  app.spinner.hide()

  if (localStorage.token)
    settingsForm.token.val(localStorage.token)

  settingsForm.self.submit(function (e) {
    e.preventDefault()
    localStorage.token = settingsForm.token.val()
    settingsForm.self.toggle()
  })

  settingsForm.toggleLink.click(function (e) {
    e.preventDefault()
    settingsForm.self.toggle()
  })

  entryForm.self.submit(function (e) {
    e.preventDefault()

    app.errors.empty()

    var params = {
      task_id: app.newEntry.task_id,
      entry: {
        description: entryForm.description.val(),
        duration_hours: entryForm.time.val()
      }
    }

    app.spinner.show()

    $.post(controllerUrl('/entries'), params, function (data) {
      app.errors.empty()
      app.info.html(data)

      setTimeout(function () { app.info.empty() }, 3000)
    }).error(function (jqXHR) {
      app.errors.html(jqXHR.responseText)
    }).complete(function () {
      app.spinner.hide()
    })
  })

  entryForm.project.autocomplete({
    source: controllerUrl('/projects'),
    minLength: 2,
    delay: 500,
    select: function(event, ui) {
      if (ui.item) {
        app.newEntry.project_id = ui.item.id
        app.newEntry.task_id = undefined
        entryForm.task.val('')
      }
    }
  })

  entryForm.task.autocomplete({
    source: function(request, response) {
      var params = {
        term: request.term,
        project_id: app.newEntry.project_id
      }
      $.get(controllerUrl('/tasks'), params, function(data) {
        response(data)
      })
    },
    minLength: 2,
    delay: 500,
    select: function(event, ui) {
      if (ui.item) {
        app.newEntry.task_id = ui.item.id
      }
    }
  })
})
