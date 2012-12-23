$(function () {
  var hostInput = $('#host'),
      tokenInput = $('#token'),
      settingsLink = $('.settings_link'),
      settingsForm = $('.settings_form'),
      entryForm = $('.entry_form')

  if (localStorage.host)
    hostInput.val(localStorage.host)
  if (localStorage.token)
    tokenInput.val(localStorage.token)

  settingsForm.submit(function (e) {
    e.preventDefault()
    localStorage.host = hostInput.val()
    localStorage.token = tokenInput.val()
    settingsForm.toggle()
  })

  settingsLink.click(function (e) {
    e.preventDefault()
    console.log('Toggle settingsForm')
    settingsForm.toggle()
  })

  entryForm.submit(function (e) {
    e.preventDefault()
  })
})
