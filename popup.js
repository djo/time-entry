$(function () {
  var app = {
    apiUrl:  'http://localhost:3000/extension_api',
    errors:  $('.errors'),
    info:    $('.info'),
    spinner: $('.spinner')
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

  settingsForm.token.val(localStorage.token)

  entryForm.project.val(localStorage.entryProjectName)
  entryForm.task.val(localStorage.entryTaskName)
  entryForm.description.val(localStorage.entryDescription)

  app.spinner.hide()

  settingsForm.self.submit(function (e) {
    e.preventDefault()
    localStorage.token = settingsForm.token.val()
    settingsForm.self.toggle()
  })

  settingsForm.toggleLink.click(function (e) {
    e.preventDefault()
    settingsForm.self.toggle()
  })

  entryForm.description[0].addEventListener('input', function () {
    localStorage.entryDescription = this.value
  }, false)

  entryForm.self.submit(function (e) {
    e.preventDefault()

    var params = {
      task_id: localStorage.entryTaskId,
      entry: {
        description: localStorage.entryDescription,
        duration_hours: entryForm.time.val()
      }
    }

    app.errors.empty()
    app.spinner.show()

    $.post(controllerUrl('/entries'), params, function (data) {
      localStorage.entryDescription = ''
      localStorage.entryProjectName = ''
      localStorage.entryProjectId = ''
      localStorage.entryTaskName = ''
      localStorage.entryTaskId = ''

      $('input:visible', entryForm.self).val('')

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
        localStorage.entryProjectId = ui.item.id
        localStorage.entryProjectName = entryForm.project.val()
        localStorage.entryTaskId = ''
        localStorage.entryTaskName = ''
        entryForm.task.val('')
      }
    }
  })

  entryForm.task.autocomplete({
    source: function(request, response) {
      var params = {
        term: request.term,
        project_id: localStorage.entryProjectId
      }
      $.get(controllerUrl('/tasks'), params, function(data) {
        response(data)
      })
    },
    minLength: 2,
    delay: 500,
    select: function(event, ui) {
      if (ui.item) {
        localStorage.entryTaskId = ui.item.id
        localStorage.entryTaskName = entryForm.task.val()
      }
    }
  })
})
