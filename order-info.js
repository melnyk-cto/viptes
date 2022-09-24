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
        $('.success-form-js').addClass('done');
        $('.order-number').text(`№${response['order_number']}`);
        $('.order-status-type').text(response['order_status'][language]);
        $('.payment-type').text(response.payment_type[language]);
        $('.order-from').text(response.from[language]);
        $('.order-to').text(response.to[language]);
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
        const newLuggage = (luggage.bicycle && `Велосипед - ${luggage.bicycle}, `) +
          (luggage.child_seat && `Детское кресло - ${luggage.child_seat}, `) +
          (luggage.golf_bag && `Сумка для гольфа - ${luggage.golf_bag}, `) +
          (luggage.hand_luggage && `Ручная кладь - ${luggage.hand_luggage}, `) +
          (luggage.snowboard && `Сноуборд - ${luggage.snowboard}, `) +
          (luggage.suitcase && `Чемодан/сумка - ${luggage.suitcase}, `) +
          (luggage.wheechair && `Инвалидное кресло - ${luggage.wheechair}, `) +
          (luggage.skis && `Лыжи - ${luggage.skis}`)
        $('.order-luggage').text(newLuggage);

        // set url for link
        const orderInfo = $('.order-edit');


        let serialize;
        console.log(response, 'response')
        if (response.to) {
          let fromTo;
          let to;
          await getCoordinates(response.from).then(response => fromTo = response).catch(() => fromTo = null);
          await getCoordinates(response.to).then(response => to = response).catch(() => to = null);
          serialize = `
        ${access_key && `access_key=${access_key}`}
        ${fromTo.lat && `&from_latitude=${fromTo.lat}`}
        ${fromTo.lng && `&from_longitude=${fromTo.lng}`}
        ${to.lat && `&to_latitude=${to.lat}`}
        ${to.lng && `&to_longitude=${to.lng}`}
        ${response.at && `&at=${response.at}`}
        ${response.luggage.bicycle && `&bicycle=${response.luggage.bicycle}`}
        ${response.luggage.child_seat && `&child_seat=${response.luggage.child_seat}`}
        ${response.luggage.golf_bag && `&golf_bag=${response.luggage.golf_bag}`}
        ${response.luggage.hand_luggage && `&hand_luggage=${response.luggage.hand_luggage}`}
        ${response.luggage.skis && `&skis=${response.luggage.skis}`}
        ${response.luggage.snowboard && `&snowboard=${response.luggage.snowboard}`}
        ${response.luggage.suitcase && `&suitcase=${response.luggage.suitcase}`}
        ${response.luggage.wheechair && `&wheelchair=${response.luggage.wheechair}`}
        ${response.passengers.adult && `&adult=${response.passengers.adult}`}
        ${response.passengers.animal_0_8 && `&animal_0_8=${response.passengers.animal_0_8}`}
        ${response.passengers.animal_8_20 && `&animal_8_20=${response.passengers.animal_8_20}`}
        ${response.passengers.children && `&children=${response.passengers.children}`}`;
        } else if (response.from) {
          let fromDuration;
          await getCoordinates(response.from).then(response => fromDuration = response).catch(() => fromDuration = null);
          serialize = `
        ${access_key && `access_key=${access_key}`}
        ${fromDuration.lat && `&from_latitude=${fromDuration.lat}`}
        ${fromDuration.lng && `&from_longitude=${fromDuration.lng}`}
        ${response.duration && `&duration=${response.duration}`}
        ${response.at && `&at=${response.at}`}
        ${response.luggage.bicycle && `&bicycle=${response.luggage.bicycle}`}
        ${response.luggage.child_seat && `&child_seat=${response.luggage.child_seat}`}
        ${response.luggage.golf_bag && `&golf_bag=${response.luggage.golf_bag}`}
        ${response.luggage.hand_luggage && `&hand_luggage=${response.luggage.hand_luggage}`}
        ${response.luggage.skis && `&skis=${response.luggage.skis}`}
        ${response.luggage.snowboard && `&snowboard=${response.luggage.snowboard}`}
        ${response.luggage.suitcase && `&suitcase=${response.luggage.suitcase}`}
        ${response.luggage.wheechair && `&wheelchair=${response.luggage.wheechair}`}
        ${response.passengers.adult && `&adult=${response.passengers.adult}`}
        ${response.passengers.animal_0_8 && `&animal_0_8=${response.passengers.animal_0_8}`}
        ${response.passengers.animal_8_20 && `&animal_8_20=${response.passengers.animal_8_20}`}
        ${response.passengers.children && `&children=${response.passengers.children}`}`;
        }
        const serializeIsTrim = serialize.replace(/\s/g, '');
        orderInfo.prop('href', `/order-edit?${serializeIsTrim}`)
      }
    })
    .catch(error => console.log(error, '/orders/info'));


  // change link for "Chancel:
  $('.call-to-manager').on('click', function (e) {
    e.preventDefault();
    // get order cancel API
    // TODO: need change "access_key" to dynamic
    fetch(`https://homelyactor.backendless.app/api/services/viptes/orders/cancel?access_key=recUHhidiKv1U83FO`, {
      method: 'PUT',
      body: JSON.stringify({"access_key": access_key})
    })
      .then(response => response.json())
      .then(response => {
        if (response.code === 0) {
          console.error(JSON.parse(response.message).error.message, 'orders/cancel error')
        } else {
          window.location.href = `/order-cancellation-sucess?access_key=${response.order_number}`
        }
      })
  });
})();
