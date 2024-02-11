// untill the window and DOM is ready
$(function () {
  const amenities = {};

  /* let's go through all the checkbox to see if they are already checked and add them to the list */
  $('.popover li input').each(function () {
    if (this.checked) {
      amenities[$(this).attr('data-id')] = $(this).attr('data-name');
    }
  });
  if (amenities) {
    $('.filters .amenities h4').text(Object.values(amenities).join(', '));
  }

  /* listen to changes of the checkbox */
  $('.popover li input').change(function () {
    if (this.checked) {
      amenities[$(this).attr('data-id')] = $(this).attr('data-name');
    } else {
      delete amenities[$(this).attr('data-id')];
    }

    $('.filters .amenities h4').text(Object.values(amenities).join(', '));
  });

  $.get('http://localhost:5001/api/v1/status/', function (response) {
    console.log(response.status);
    if (response.status === 'OK') {
      $('#api_status').addClass('available');
    } else {
      $('#api_status').removeClass('available');
    }
  });
});
