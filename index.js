// Footer Code
(async function () {
  // begin: logic for form
  const carImages = {
    STANDARD: "https://uploads-ssl.webflow.com/6305669d3fbd4aaf2734fe5f/63077f9925588b3ca95519cd_Rectangle%2010-3-min.png",
    BUSINESS: "https://uploads-ssl.webflow.com/6305669d3fbd4aaf2734fe5f/63077f996187bf4336c807e0_Rectangle%2010-2-min.png",
    VIP: "https://uploads-ssl.webflow.com/6305669d3fbd4aaf2734fe5f/63077f996187bf4336c807e0_Rectangle%2010-2-min.png",
    BUS: "https://uploads-ssl.webflow.com/6305669d3fbd4aaf2734fe5f/63077f98e7caf11ad21e5afc_Rectangle%2010-min.png"
  }

  const car = (item, image) => `<label class="order-car-car-wrapper unselectable">
    <h3 class="centered h3">${item.type}</h3>
    <div class="spacing h7"></div>
    <img src='${image}' loading="lazy" width="250" alt="" />
    <div class="spacing h10"></div>
    <div class="car-icons-wrapper">
      <div class="car-icon-wrapper">
        <img src="https://uploads-ssl.webflow.com/6305669d3fbd4aaf2734fe5f/6306a4eb51e2f4559fe9cd53_man%20icon.svg"
             loading="lazy" alt="" />
        <img src="https://uploads-ssl.webflow.com/6305669d3fbd4aaf2734fe5f/6306a67092576cd8b087c770_x.svg"
             loading="lazy" alt="" />
        <p>${item.passengers}</p>
      </div>
      <div class="car-icon-wrapper">
        <img src="https://uploads-ssl.webflow.com/6305669d3fbd4aaf2734fe5f/6306a4eb92cca5b3ed9d8070_baggage-icon.svg"
             loading="lazy" alt="" />
        <img src="https://uploads-ssl.webflow.com/6305669d3fbd4aaf2734fe5f/6306a67092576cd8b087c770_x.svg"
             loading="lazy" alt="">
        <p>${item.luggage}</p>
      </div>
    </div>
    <input class='car-item' name='car-item' type='radio' hidden value='${item.car_name}' data-price='${item.price}'>
    <div style="display:none" class="airport-check-wrapper">
      <img src="https://uploads-ssl.webflow.com/6305669d3fbd4aaf2734fe5f/630a4c4fc605382bb43e62db_green-check.svg"
           loading="lazy" alt="" />
    </div>
  </label>`

  $(document).ready(function () {
    const getReverseGeocodingData = async (lat, lng) => {
      const geocoder = new google.maps.Geocoder();
      const latlng = new google.maps.LatLng(lat, lng);
      // This is making the Geocode request
      let address;
      await geocoder.geocode({'latLng': latlng}, (results) => {
        if (results) {
          address = (results[0].formatted_address);
          const county = results[0].address_components[results[0].address_components.length - 2].long_name;
          const state = results[0].address_components[results[0].address_components.length - 3].long_name;
          const city = results[0].address_components[results[0].address_components.length - 4].long_name;
          const town = results[0].address_components[results[0].address_components.length - 5].long_name;
          address = `${town}, ${city}, ${state}, ${county}`;
        }
      });
      return address;
    }

    const getCoordinates = async (address) => {
      const geocoder = new google.maps.Geocoder();
      let coordinates;
      await geocoder.geocode({"address": address}, function (results) {
        if (results) {
          coordinates = {lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng()};
        }
      });
      return coordinates;
    }

    const getCars = (data) => {
      // get cars API
      fetch('https://homelyactor.backendless.app/api/services/viptes/orders/estimate', {
        method: 'POST',
        body: JSON.stringify(data)
      })
        .then(response => response.json())
        .then(response => {
          if (response.code === 0) {
            console.error(JSON.parse(response.message).error.message, 'orders/estimate error')
          } else {
            $('.error-message-second').css('display', 'none');
            const findCarsTitle = $(".finded-cars h2");
            const orderCars = $(".order-cars-div");
            const errorMessage = $('.error-message');
            const findCars = $('.finded-cars');
            const price = $('.price-js');

            if (response.includes('not_found')) {
              errorMessage.css('display', 'block');
            } else if (response.length > 0) {
              errorMessage.css('display', 'none');
              findCars.css('display', 'block');
              $('.contact-form-wrapper').css('display', 'block');

              // set title
              findCarsTitle.children().remove();
              findCarsTitle.html(`<h2><span class="grey-span">Мы нашли</span> ${response.length} варианта <span class="grey-span">авто для вашей поездки</span></h2>`);

              // set cars
              orderCars.children().remove();
              for (let i = 0; i < response.length; i++) {
                orderCars.append(car(response[i], carImages[response[i].type]));
              }

              // set price as default car
              const carItem = $('[name="car-item"]');
              price.text(carItem[0].getAttribute('data-price'));
              $(`.car-item:radio[value='${carItem[0].value}']`).prop('checked', true);

              //  set price on change car
              carItem.change(function () {
                const price = $('.price-js');
                price.text($(this).attr('data-price'));
              });
            } else {
              errorMessage.css('display', 'block');
              findCars.css('display', 'none');
            }
          }
        })
        .catch(error => console.log(error, 'orders/estimate'))
    }

    const setFields = async () => {
      const adults = $('[name="Passengers-Adults"]');
      adults.val(1);

      const urlParams = new URLSearchParams(window.location.search);

      if (window.location.pathname.includes('order/create') || window.location.pathname.includes('order-edit')) {
        // show from&to or from&duration
        if (urlParams.get('duration')) {
          $('.location-from-to').remove();

          // set address
          if (urlParams.get('from_latitude') && urlParams.get('from_longitude')) {
            await getReverseGeocodingData(urlParams.get('from_latitude'), urlParams.get('from_longitude')).then(response => $('[name="from-duration"]').val(response));
          }

          $('[name="Hours"]').val(urlParams.get('duration'));
        } else {
          $('.location-from').remove();
          $('.location-input.hours').remove();

          // set address
          if (urlParams.get('from_latitude') && urlParams.get('from_longitude') && urlParams.get('to_latitude') && urlParams.get('to_longitude')) {
            await getReverseGeocodingData(urlParams.get('from_latitude'), urlParams.get('from_longitude')).then(response => $('[name="from-to"]').val(response));
            await getReverseGeocodingData(urlParams.get('to_latitude'), urlParams.get('to_longitude')).then(response => $('[name="to"]').val(response));
          }
        }

        // set date
        const at = Number(urlParams.get('at'));

        if (at) {
          const myDate = new Date(at);
          const date = myDate.getFullYear() + '-' + ('0' + (myDate.getMonth() + 1)).slice(-2) + '-' + ('0' + myDate.getDate()).slice(-2);
          const time = `${('0' + myDate.getHours()).slice(-2)}:${('0' + myDate.getMinutes()).slice(-2)}`
          $('[name="date"]').val(date);
          $('[name="appt"]').val(time);
        }

        // set other fields
        if (urlParams.get('adult')) adults.val(urlParams.get('adult'));
        $('[name="Passengers-Kids"]').val(urlParams.get('children'));
        $('[name="Passengers-Pets-8-Kg"]').val(urlParams.get('animal_0_8'));
        $('[name="Passengers-Pets-20-Kg"]').val(urlParams.get('animal_8_20'));
        $('[name="Hand-Luggage-20"]').val(urlParams.get('hand_luggage'));
        $('[name="Skis"]').val(urlParams.get('skis'));
        $('[name="Golf-Bag"]').val(urlParams.get('golf_bag'));
        $('[name="Snowboard"]').val(urlParams.get('snowboard'));
        $('[name="Bike"]').val(urlParams.get('bicycle'));
        $('[name="Wheelchair"]').val(urlParams.get('wheelchair'));
        $('[name="Child-Chair"]').val(urlParams.get('child_seat'));
        $('[name="Luggage-30-Kg"]').val(urlParams.get('suitcase'));
      }

      // set to on pages when we have coordinates
      const coordinatesOnPage = $('.coordinates-js').text()
      const latLong = coordinatesOnPage.replace(/\s/g, '').split(',')
      if (coordinatesOnPage) {
        await getReverseGeocodingData(latLong[0], latLong[1]).then(response => $('[name="to"]').val(response));
      }
    }

    const onLoadPage = async () => {
      await setFields();

      if (window.location.pathname.includes('order/create') || window.location.pathname.includes('order-edit')) {
        // begin check if form is empty
        const inputs = $('._wf-form').serializeArray();
        let formIsFill = true;
        $.each(inputs, function (i, input) {
          if (input.name === 'from-to' && input.value.length === 0) {
            formIsFill = false;
          } else if (input.name === 'to' && input.value.length === 0) {
            formIsFill = false;
          } else if (input.name === 'date' && input.value.length === 0) {
            formIsFill = false;
          } else if (input.name === 'Passengers-Adults' && input.value <= 0) {
            formIsFill = false;
          }
        });
        if (formIsFill) {
          await initForm();
        } else {
          $('.error-message-second').css('display', 'block');
          $('.finded-cars').css('display', 'none');
          $('.contact-form-wrapper').css('display', 'none');
        }
        // end check if form is empty
      }
    }
    onLoadPage();

    const toTimestamp = (year, month, day, hour, minute, second) => {
      const datum = new Date(year, month - 1, day, hour, minute, second);
      return datum.getTime();
    }

    const getAllFields = async () => {
      const dateInput = $('[name="date"]').val().split('-');
      const timeInput = $('[name="appt"]').val().split(':');
      const adultsInput = $('[name="Passengers-Adults"]').val();
      const kidsInput = $('[name="Passengers-Kids"]').val();
      const pets8Input = $('[name="Passengers-Pets-8-Kg"]').val();
      const pets20Input = $('[name="Passengers-Pets-20-Kg"]').val();
      const handLuggageInput = $('[name="Hand-Luggage-20"]').val();
      const skisInput = $('[name="Skis"]').val();
      const golfInput = $('[name="Golf-Bag"]').val();
      const snowboardInput = $('[name="Snowboard"]').val();
      const bikeInput = $('[name="Bike"]').val();
      const wheelchairInput = $('[name="Wheelchair"]').val();
      const childChairInput = $('[name="Child-Chair"]').val();
      const luggage30Input = $('[name="Luggage-30-Kg"]').val();
      let at = toTimestamp(dateInput[0], dateInput[1], dateInput[2], timeInput[0], timeInput[1], 0);

      // detect form&to of from&direction
      const fromToInput = $('[name="from-to"]').val();
      const fromDurationInput = $('[name="from-duration"]').val();
      let serialize;

      const data = {
        "at": at,
        "passengers": {
          "adult": adultsInput,
          "children": kidsInput,
          "animal_0_8": pets8Input,
          "animal_8_20": pets20Input
        },
        "luggage": {
          "skis": skisInput,
          "hand_luggage": handLuggageInput,
          "bicycle": bikeInput,
          "child_seat": childChairInput,
          "golf_bag": golfInput,
          "snowboard": snowboardInput,
          "suitcase": luggage30Input,
          "wheelchair": wheelchairInput
        }
      }

      if (fromToInput) {
        let fromTo;
        let to;
        const toInput = $('[name="to"]').val();
        await getCoordinates(toInput).then(response => to = response).catch(() => to = null);
        await getCoordinates(fromToInput).then(response => fromTo = response).catch(() => fromTo = null);
        data.from = {"longitude": `${fromTo.lng}`, "latitude": `${fromTo.lat}`};
          data.to = {"longitude": `${to.lng}`, "latitude": `${to.lat}`};
        serialize = `
        ${fromTo.lat && `from_latitude=${fromTo.lat}`}
        ${fromTo.lng && `&from_longitude=${fromTo.lng}`}
        ${to.lat && `&to_latitude=${to.lat}`}
        ${to.lng && `&to_longitude=${to.lng}`}
        ${at && `&at=${at}`}
        ${bikeInput && `&bicycle=${bikeInput}`}
        ${childChairInput && `&child_seat=${childChairInput}`}
        ${golfInput && `&golf_bag=${golfInput}`}
        ${handLuggageInput && `&hand_luggage=${handLuggageInput}`}
        ${skisInput && `&skis=${skisInput}`}
        ${snowboardInput && `&snowboard=${snowboardInput}`}
        ${luggage30Input && `&suitcase=${luggage30Input}`}
        ${wheelchairInput && `&wheelchair=${wheelchairInput}`}
        ${adultsInput && `&adult=${adultsInput}`}
        ${pets8Input && `&animal_0_8=${pets8Input}`}
        ${pets20Input && `&animal_8_20=${pets20Input}`}
        ${kidsInput && `&children=${kidsInput}`}`;
      } else if (fromDurationInput) {
        let fromDuration;
        const durationInput = $('[name="Hours"]').val();
        await getCoordinates(fromDurationInput).then(response => fromDuration = response).catch(() => fromDuration = null);
        data.from = {"longitude": fromDuration.lng, "latitude": fromDuration.lat};
        data.duration = durationInput;
        serialize = `
        ${fromDuration.lat && `from_latitude=${fromDuration.lat}`}
        ${fromDuration.lng && `&from_longitude=${fromDuration.lng}`}
        ${durationInput && `&duration=${durationInput}`}
        ${at && `&at=${at}`}
        ${bikeInput && `&bicycle=${bikeInput}`}
        ${childChairInput && `&child_seat=${childChairInput}`}
        ${golfInput && `&golf_bag=${golfInput}`}
        ${handLuggageInput && `&hand_luggage=${handLuggageInput}`}
        ${skisInput && `&skis=${skisInput}`}
        ${snowboardInput && `&snowboard=${snowboardInput}`}
        ${luggage30Input && `&suitcase=${luggage30Input}`}
        ${wheelchairInput && `&wheelchair=${wheelchairInput}`}
        ${adultsInput && `&adult=${adultsInput}`}
        ${pets8Input && `&animal_0_8=${pets8Input}`}
        ${pets20Input && `&animal_8_20=${pets20Input}`}
        ${kidsInput && `&children=${kidsInput}`}`;
      }
      const serializeIsTrim = serialize.replace(/\s/g, '');
      return {data, serializeIsTrim}
    }
    const initForm = async () => {
      const {data, serializeIsTrim} = await getAllFields();
      if (window.location.href.includes('order/create') || window.location.pathname.includes('order-edit')) {
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?${serializeIsTrim}`;
        window.history.pushState({path: newUrl}, '', newUrl);
      } else {
        window.location.href = `/order/create?${serializeIsTrim}`
      }

      getCars(data);
    }

    // on submit form
    $('._wf-form').submit(async function () {
      await initForm();
    });

    // plus/minus buttons
    $('.minus-js').on('click', function () {
      const input = $(this).parent().children('input');
      input.val(+input.val() - 1);
      if ($(this).parent().children('input').attr('name') === 'Passengers-Adults') {
        if (input.val() <= 1) input.val(1)
      } else {
        if (input.val() <= 0) input.val(0)
      }
    });

    // show/hide airport field
    $('[name="airport-meet-me"]').on('change', function () {
      if ($(this).is(':checked')) {
        $('.airport-company-field').css('display', 'flex');
        $('.airport-meet-information').css('display', 'flex');
        $('[name="flight-number"]').prop('required', true);
      } else {
        $('.airport-company-field').css('display', 'none');
        $('.airport-meet-information').css('display', 'none');
        $('[name="flight-number"]').prop('required', false);
      }
    });

    $('.plus-js').on('click', function () {
      const input = $(this).parent().children('input');
      input.val(+input.val() + 1);
      if (input.val() >= 8) input.val(8)
    });

    // change from <=> to
    $('.swap-wrapper').on('click', function () {
      const fromInput = $('[name="from-to"]');
      const toInput = $('[name="to"]');
      const fromValue = fromInput.val();
      const toValue = toInput.val();
      fromInput.val(toValue)
      toInput.val(fromValue)
    });

    // create order submit
    $('.create-order-form').submit(async function () {
      const {data} = await getAllFields();
      const nameInput = $('[name="Name"]').val();
      const surnameInput = $('[name="Surname"]').val();
      const emailInput = $('[name="Email"]').val();
      const phoneInput = $('[name="Phone"]').val();
      const paymentMethodInput = $('[name="payment-method"]').val();
      const airlineInput = $('[name="aviacompany"]').val();
      const flightNumberInput = $('[name="flight-number"]').val();
      const airportMeetMeInput = $('[name="airport-meet-me"]')[0].checked;
      const connection = $('.connection-js input');
      const preferredConnection = [];
      connection[0].checked && preferredConnection.push('EMAIL');
      connection[1].checked && preferredConnection.push('WHATSAPP');
      connection[2].checked && preferredConnection.push('PHONE');
      connection[3].checked && preferredConnection.push('TELEGRAM');
      const language = $('.language-js input');
      const preferredLanguage = [];
      language[0].checked && preferredLanguage.push('en');
      language[1].checked && preferredLanguage.push('ru');
      language[2].checked && preferredLanguage.push('sk');
      const selectedCarName = $('[name="car-item"]').val();

      const createOrder = {
        ...data,
        "selected_car_name": selectedCarName,
        "fname": nameInput,
        "lname": surnameInput,
        "phone": phoneInput,
        "email": emailInput,
        "preferred_connection": preferredConnection,
        "preferred_language": preferredLanguage,
        "airline": airlineInput,
        "flight_number": flightNumberInput,
        "payment_type": paymentMethodInput,
        "airport_pick_up": airportMeetMeInput,
      };

      let url = '';
      let type = '';
      let method = '';
      if (window.location.pathname.includes('order/create')) {
        url = 'https://homelyactor.backendless.app/api/services/viptes/orders/create';
        type = 'orders/create'
        method = 'POST'
      }
      if (window.location.pathname.includes('order-edit')) {
        url = 'https://homelyactor.backendless.app/api/services/viptes/orders/edit'
        type = 'orders/edit'
        method = 'PUT'
      }
      // get cars API
      fetch(url, {
        method: method,
        body: JSON.stringify(createOrder)
      })
        .then(response => response.json())
        .then(response => {
          if (response.code === 0) {
            console.error(JSON.parse(response.message).error.message, 'orders/create error')
          } else {
            window.location.href = `/order-success?access_key=${response.access_key}`
          }
        })
        .catch(error => console.log(error, type));
    });

  });
  // end: logic for form
})();