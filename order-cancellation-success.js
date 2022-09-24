// Заявка успешно отменена
//   https://viptes-com.webflow.io/order-cancellation-success?order-number={order-number}
(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const orderNumber = urlParams.get('order-number');
  $('.order-number').text(`№${orderNumber}`);
  $('.success-form-js').addClass('done');
})();