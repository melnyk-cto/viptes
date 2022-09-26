// Отменить заявку
//  https://viptes-com.webflow.io/order/cancel/call-to-manager?order-number={access_key}
(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const orderNumber = urlParams.get('order-number');
  $('.order-number').text(`№${orderNumber}`);
})();
