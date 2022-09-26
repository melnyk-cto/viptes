//  Заявка отправлена
// https://viptes-com.webflow.io/order-success?access_key={access_key}
(function () {
  const loading = () => `<div class="loading-overlay">
    <svg xmlns="http://www.w3.org/2000/svg" width="57" height="57" viewBox="0 0 57 57" stroke="#fff">
      <g fill="none" fill-rule="evenodd">
          <g transform="translate(1 1)" stroke-width="2">
              <circle cx="5" cy="50" r="5">
                  <animate attributeName="cy" begin="0s" dur="2.2s" values="50;5;50;50" calcMode="linear" repeatCount="indefinite"/>
                  <animate attributeName="cx" begin="0s" dur="2.2s" values="5;27;49;5" calcMode="linear" repeatCount="indefinite"/>
              </circle>
              <circle cx="27" cy="5" r="5">
                  <animate attributeName="cy" begin="0s" dur="2.2s" from="5" to="5" values="5;50;50;5" calcMode="linear" repeatCount="indefinite"/>
                  <animate attributeName="cx" begin="0s" dur="2.2s" from="27" to="27" values="27;49;5;27" calcMode="linear" repeatCount="indefinite"/>
              </circle>
              <circle cx="49" cy="50" r="5">
                  <animate attributeName="cy" begin="0s" dur="2.2s" values="50;50;5;50" calcMode="linear" repeatCount="indefinite"/>
                  <animate attributeName="cx" from="49" to="49" begin="0s" dur="2.2s" values="49;5;27;49" calcMode="linear" repeatCount="indefinite"/>
              </circle>
          </g>
      </g>
  </svg>
  </div>`
  $('body').append(loading());

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
      $('.loading-overlay').remove();

      if (response.code === 0) {
        console.error(JSON.parse(response.message).error.message, 'orders/info error')
      } else {
        $('.order-number').text(`№${response.order_number}`);
        $('.success-form-js').addClass('done');
      }
    })
})();