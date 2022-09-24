// Footer Code

// begin: google maps
function initialize() {
  const fromInput = $('[name="from-to"]');
  const durationInput = $('[name="from-duration"]');
  const toInput = $('[name="to"]');

  if (fromInput[0]) new google.maps.places.Autocomplete(fromInput[0]);
  if (toInput[0]) new google.maps.places.Autocomplete(toInput[0]);
  if (durationInput[0]) new google.maps.places.Autocomplete(durationInput[0]);
}

google.maps.event.addDomListener(window, 'load', initialize);
// end: google maps