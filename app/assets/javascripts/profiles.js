var dc = '.directory_container';
$(document).ready(function() {
  $(dc).hide();
  var name = $('.js-template-select option:selected').text();
  if (!name) {
    return;
  }
  revealTemplate(dc + '.' + name);
});

$(document).on('change', '.js-template-select', function(el) {
  $(dc).hide();

  var name = $('option:selected', el.currentTarget).text();
  revealTemplate(dc + '.' + name);
});

function revealTemplate(selector) {
  $(selector).show();
}
