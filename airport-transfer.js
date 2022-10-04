// Трансфер из аэропорта
// https://viptes-com.webflow.io/airport-transfer
(async function () {
  $(document).ready(function () {

    $('.airport-card').on('click', function () {
      const country = $(this).find('.airport-info h3').text();
      const title = $(this).find('.airport-info p').text();
      $('[name="from-to"]').val(`${title}, ${country}`)
    })

  });
})();