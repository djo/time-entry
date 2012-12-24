$(function () {
  var apiUrl = 'http://localhost:3000/extension_api',
      tokenInput = $('#token'),
      settingsLink = $('.settings_link'),
      settingsForm = $('.settings_form'),
      entryForm = $('.entry_form'),
      project = $('.project', entryForm),
      task = $('.task', entryForm),
      description = $('.description', entryForm),
      time = $('.time', entryForm),
      entry = {}

  var controllerUrl = function (path) {
    var url = apiUrl + path + '?' +'user_token=' + localStorage.token
    return url
  }

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
    $.post(controllerUrl('/entries'), {task_id: 1}, function (data) {
    })
  })

  project.autocomplete({
    source: controllerUrl('/projects'),
    minLength: 3,
    delay: 500,
    select: function(event, ui) {
      if (ui.item) {
        entry.project_id = ui.item.id
        entry.project_shortname = ui.item.value
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
    minLength: 3,
    delay: 500,
    select: function(event, ui) {
      if (ui.item) {
        entry.task_id = ui.item.id
      }
    }
  })
})
