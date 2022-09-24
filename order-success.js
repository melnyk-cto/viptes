//  Заявка отправлена
// https://viptes-com.webflow.io/order-success?access_key={access_key}
(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const access_key = urlParams.get('access_key');

  // set url for link
  const orderInfo = $('.order-info');
  orderInfo.prop('href', `/order/info?access_key=${access_key}`)

  // get order info API
  fetch(`https://homelyactor.backendless.app/api/services/viptes/orders/info?access_key=${access_key}`, {
    method: 'GET',
  })
    .then(response => response.json())
    .then(response => {
      if (response.code === 0) {
        console.error(JSON.parse(response.message).error.message, 'orders/info error')
      } else {
        $('.order-number').text(`№${response.order_number}`);
        $('.success-form-js').addClass('done');
      }
    })
})();