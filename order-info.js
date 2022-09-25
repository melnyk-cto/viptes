// Проверка заявки
// https://viptes-com.webflow.io/order/info?access_key={access_key}

(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const access_key = urlParams.get('access_key');
  const language = 'ru';

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

  // get order info API
  fetch(`https://homelyactor.backendless.app/api/services/viptes/orders/info?access_key=${access_key}`, {
    method: 'GET',
  })
    .then(response => response.json())
    .then(async response => {
      if (response.code === 0) {
        console.error(JSON.parse(response.message).error.message, 'orders/info error')
      } else {
        const responseFrom = response.from[language];
        const responseTo = response.to[language];
        $('.success-form-js').addClass('done');
        $('.order-number').text(`№${response['order_number']}`);
        $('.order-status-type').text(response['order_status'][language]);
        $('.payment-type').text(response.payment_type[language]);
        $('.order-from').text(responseFrom);

        if (responseTo) {
          $('.order-to').text(responseTo);
        } else {
          $('.no-shrink').remove();
          $('.order-to').text('');
        }

        $('.car-type').text(response.car.type);
        $('.order-passengers').text(response.passengers.adult);

        if (response.duration) {
          $('.order-duration').text(response.duration);
          $('.order-duration-section').css('display', 'block');
          $('.order-route-length-section').css('display', 'none');
        } else {
          $('.order-route-length').text(`${response.route_length} км`);
          $('.order-duration-section').css('display', 'none');
          $('.order-route-length-section').css('display', 'block');
        }
        // date
        const myDate = new Date(response.at);
        const date = myDate.getFullYear() + '-' + ('0' + (myDate.getMonth() + 1)).slice(-2) + '-' + ('0' + myDate.getDate()).slice(-2);
        const time = `${('0' + myDate.getHours()).slice(-2)}:${('0' + myDate.getMinutes()).slice(-2)}`
        $('.order-date').text(date);
        $('.order-time').text(time);


        // luggage
        const luggage = response.luggage;
        const newLuggage = (luggage.bicycle ? `Велосипед - ${luggage.bicycle}, ` : '') +
          (luggage.child_seat ? `Детское кресло - ${luggage.child_seat}, ` : '') +
          (luggage.golf_bag ? `Сумка для гольфа - ${luggage.golf_bag}, ` : '') +
          (luggage.hand_luggage ? `Ручная кладь - ${luggage.hand_luggage}, ` : '') +
          (luggage.snowboard ? `Сноуборд - ${luggage.snowboard}, ` : '') +
          (luggage.suitcase ? `Чемодан/сумка - ${luggage.suitcase}, ` : '') +
          (luggage.wheelchair ? `Инвалидное кресло - ${luggage.wheelchair}, ` : '') +
          (luggage.skis ? `Лыжи - ${luggage.skis}` : '')
        $('.order-luggage').text(newLuggage);

        // set url for link
        const orderInfo = $('.order-edit');


        let serialize;
        if (response.to) {
          let fromTo;
          let to;
          await getCoordinates(responseFrom).then(response => fromTo = response).catch(() => fromTo = null);
          await getCoordinates(responseTo).then(response => to = response).catch(() => to = null);
          serialize = `
          ${access_key && `access_key=${access_key}`}
          ${(fromTo && fromTo.lat) ? `&from_latitude=${fromTo.lat}` : ''}
          ${(fromTo && fromTo.lng) ? `&from_longitude=${fromTo.lng}` : ''}
          ${(to && to.lat) ? `&to_latitude=${to.lat}` : ''}
          ${(to && to.lng) ? `&to_longitude=${to.lng}` : ''}`;
        } else if (response.from) {
          let fromDuration;
          await getCoordinates(responseFrom).then(response => fromDuration = response).catch(() => fromDuration = null);
          serialize = `
          ${access_key && `access_key=${access_key}`}
          ${fromDuration && fromDuration.lat && `&from_latitude=${fromDuration.lat}`}
          ${fromDuration && fromDuration.lng && `&from_longitude=${fromDuration.lng}`}
          ${response.duration && `&duration=${response.duration}`}`;
        }
        serialize += `
        ${response.at ? `&at=${Date.parse(response.at)}` : ''}
        ${response.luggage.bicycle ? `&bicycle=${response.luggage.bicycle}` : ''}
        ${response.luggage.child_seat ? `&child_seat=${response.luggage.child_seat}` : ''}
        ${response.luggage.golf_bag ? `&golf_bag=${response.luggage.golf_bag}` : ''}
        ${response.luggage.hand_luggage ? `&hand_luggage=${response.luggage.hand_luggage}` : ''}
        ${response.luggage.skis ? `&skis=${response.luggage.skis}` : ''}
        ${response.luggage.snowboard ? `&snowboard=${response.luggage.snowboard}` : ''}
        ${response.luggage.suitcase ? `&suitcase=${response.luggage.suitcase}` : ''}
        ${response.luggage.wheelchair ? `&wheelchair=${response.luggage.wheelchair}` : ''}
        ${response.passengers.adult ? `&adult=${response.passengers.adult}` : ''}
        ${response.passengers.animal_0_8 ? `&animal_0_8=${response.passengers.animal_0_8}` : ''}
        ${response.passengers.animal_8_20 ? `&animal_8_20=${response.passengers.animal_8_20}` : ''}
        ${response.passengers.children ? `&children=${response.passengers.children}` : ''}
        ${response.fname ? `&fname=${response.fname}` : ''}
        ${response.lname ? `&lname=${response.lname}` : ''}
        ${response.email ? `&email=${response.email}` : ''}
        ${response.phone ? `&phone=${response.phone}` : ''}
        ${response.airport_pick_up ? `&airport_pick_up=${response.airport_pick_up}` : ''}
        ${response.airline ? `&airline=${response.airline}` : ''}
        ${response.airline ? `&airline=${response.airline}` : ''}
        ${response.airline ? `&airline=${response.airline}` : ''}
        ${response.order_number ? `&order_number=${response.order_number}` : ''}
        ${response.car.car_name ? `&car_name=${response.car.car_name}` : ''}
        ${response.car.car_name ? `&car_name=${response.car.car_name}` : ''}
        ${response.preferred_connection ? `&preferred_connection=${response.preferred_connection}` : ''}
        ${response.payment_type[language] ? `&payment_type=${response.payment_type[language]}` : ''}
        `

        const serializeIsTrim = serialize.replace(/\s/g, '');
        orderInfo.prop('href', `/order-edit?${serializeIsTrim}`)

        // hide edit/cancel buttons
        if (response['order_status'][language] === 'Отменено') {
          $('.buttons-wrapper').remove();
        }
      }
    })
    .catch(error => console.log(error, '/orders/info'));


  // change link for "Chancel:
  $('.call-to-manager').on('click', function (e) {
    e.preventDefault();
    // get order cancel API
    fetch(`https://homelyactor.backendless.app/api/services/viptes/orders/cancel`, {
      method: 'PUT',
      body: JSON.stringify({"access_key": access_key})
    })
      .then(response => response.json())
      .then(response => {
        if (response.code === 0) {
          console.error(JSON.parse(response.message).error.message, 'orders/cancel error')
        } else {
          window.location.href = `/order-cancellation-success?order-number=${response.order_number}`
        }
      })
  });
})();
