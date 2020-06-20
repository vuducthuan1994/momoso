$(document).ready(function() {
    $('.product-price-desc #small-img li').on('click', selectProductColor)
});

function selectProductColor() {
    $('#small-img li').removeClass('active');
    $(this).addClass('active');

}