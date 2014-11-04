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
M.bind 'c d', ->
  location.href = "/dashboards/new"
M.bind 'c s', ->
  location.href= "/servers/new"

M.bind 'esc', ->
  $(".widget_column, .mousetrap_list").removeClass('mousetrap_active')

# List movement.
M.bind ['j', 'k', 'l', 'h'], (e, key)->
  if ['j', 'k'].indexOf(key) > -1 && M.locations.indexOf(location.pathname) > -1
    dashboardMovement e, key
  else
    widgetMovement e, key

widgetMovement = (e, key)->
  $list_items = $(".widget_column")
  items_array = Array.prototype.slice.call $list_items, 0
  active_index = items_array.indexOf($list_items.siblings('.mousetrap_active')[0])
  if active_index == -1
    $list_items.removeClass('mousetrap_active')
    $list_items.get(0).classList.add('mousetrap_active')
    return

  if key == "j"
    return if active_index == ($list_items.length - 1)
    if active_index > -1
      $list_items.removeClass('mousetrap_active')
    if numCols < $list_items.length
      active = $list_items.get(active_index + numCols)
    else
      active = $list_items.get($list_items.length - 1)
    if window.innerHeight + scrollY < ($(active).offset().top + 60)
      scrollTo 0, scrollY + $(active).height()
  if key == "k"
    return if active_index <= 0
    if active_index > -1
      $list_items.removeClass('mousetrap_active')
    if numCols < $list_items.length
      active = $list_items.get(active_index - numCols)
    else
      active = $list_items.get(0)
    if scrollY > ($(active).offset().top - 60)
      scrollTo 0, scrollY - $(active).height()
  if key == "l"
    return if active_index % numCols == numCols - 1
    $list_items.removeClass('mousetrap_active')
    active = $list_items.get(active_index + 1)
  if key == "h"
    return if active_index % numCols == 0
    $list_items.removeClass('mousetrap_active')
    active = $list_items.get(active_index - 1)
  # add mousetrap_active to whichever index was calculated as being the new
  # active element.
  active.classList.add('mousetrap_active')

dashboardMovement = (e, key)->
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
  if M.locations.indexOf(location.pathname) > -1
    document.querySelector('.mousetrap_active .mousetrap_open_link').click()
  else
    document.querySelector('.mousetrap_active .icon-add-to-list').click()

M.bind 'd', ->
  return unless M.locations.indexOf(location.pathname) > -1
  document.querySelector('.mousetrap_active .mousetrap_delete_link').click()

# Interacting with dashboard page.
M.bind 'F', ->
  document.querySelector('[ng-click="enableFullscreen()"]')?.click()
M.bind 'c w', ->
  document.querySelector('[ng-click="addGraph()"]')?.click()
M.bind 'c f', ->
  document.querySelector('[ng-click="addFrame()"]')?.click()
M.bind 'c c', ->
  document.querySelector('[ng-click="showCloneMenu()"]')?.click()
