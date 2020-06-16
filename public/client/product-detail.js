$(document).ready(function() {

    $('#add-wish-list').on('click', addToWishList);

});

function addToWishList() {
    console.log("add to wish list");
    var cart = $(this).data('cart');
    var product = $(this).data('product');
    var seasonid = $(this).data('seasonid');
    var listFavorProducts = [];

    if (cart !== null) {
        listFavorProducts = cart;
    };
    listFavorProducts.push(product);
    console.log(listFavorProducts);
}