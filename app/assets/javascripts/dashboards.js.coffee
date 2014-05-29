# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/

M = Mousetrap
M.locations = ["/", "/directories", "/servers"]

# Goto.
M.bind 'g d', ->
  location.href = "/"

M.bind 'g s', ->
  location.href = "/servers"

M.bind 'g b', ->
  history.back()

# Creation.
M.bind 'c', ->
  switch location.pathname
    when "/"
      location.href = "/dashboards/new"
    when "/servers"
      location.href= "/servers/new"

# List movement.
M.bind ['j', 'k'], (e, key)->
  return unless M.locations.indexOf(location.pathname) > -1
  $list_items = $(".mousetrap_list")
  items_array = Array.prototype.slice.call $list_items, 0
  active_index = items_array.indexOf($list_items.siblings('.mousetrap_active')[0])
  if key == "j"
    return if active_index == ($list_items.length - 1)
    if active_index > -1
      $list_items.removeClass('mousetrap_active')

    active = $list_items.get(active_index + 1)
    active.classList.add('mousetrap_active')
    if window.innerHeight + scrollY < ($(active).offset().top + 60)
      scrollTo 0, scrollY + $(active).height()

  if key == "k"
    return if active_index <= 0
    if active_index > -1
      $list_items.removeClass('mousetrap_active')

    active = $list_items.get(active_index - 1)
    active.classList.add('mousetrap_active')

    if scrollY > ($(active).offset().top - 60)
      scrollTo 0, scrollY - $(active).height()

# Interacting with list items.
M.bind ['o', 'return'], ->
  return unless M.locations.indexOf(location.pathname) > -1
  document.querySelector('.mousetrap_active .mousetrap_open_link').click()

M.bind 'd', ->
  return unless M.locations.indexOf(location.pathname) > -1
  document.querySelector('.mousetrap_active .mousetrap_delete_link').click()

# Interacting with dashboard page.
M.bind 'F', ->
  document.querySelector('[ng-click="enableFullscreen()"]')?.click()
