$(document).ready(function() {
    $('#add-wish-list').on('click', addToWishList);
    $('.add-product-to-cart').on('click', addToCart)
    $('.remove-wish-list').on('click', removeFromWishList)
    initCart();
});

var listFavorProducts = [];
var listCartProducts = [];

function toast(title, msg, type = 'info') {
    $.toast({
        heading: title,
        text: msg,
        showHideTransition: 'plain',
        icon: type,
        position: 'bottom-right',
    });
}

function initCart() {
    var cart = $('#js-cart-data').data('cart');
    if (cart !== null && cart !== undefined) {
        $('#cart-length').text(cart.listCartProducts.length);
        $('#wish-list-length').text(cart.listFavorProducts.length);
    }

}

function removeFromWishList() {
    var cart = $('#js-cart-data').data('cart');
    var sessionID = $('#js-cart-data').data('seasonid');
    var product = $(this).data('product');
    if (cart !== null && cart !== undefined && cart.listFavorProducts.length > 0) {
        cart.listFavorProducts.splice(cart.listFavorProducts.findIndex(function(i) {
            return i._id === product._id;
        }), 1);
        let data = {
            sessionID: sessionID,
            listFavorProducts: cart.listFavorProducts
        }
        $.ajax({
            url: `/api/updateFavor`,
            dataType: "json",
            data: data,
            method: 'POST',
            success: function(data) {
                if (data.success) {
                    toast('Thông báo', 'Xóa thành công khỏi danh sách', 'success');
                    $('#wish-list-length').text(cart.listFavorProducts.length);
                    $('#js-cart-data').data('cart', cart);
                    $(`#${product._id}`).remove();
                } else {
                    toast('Thông báo', 'Lỗi hệ thống!', 'error');
                }
            }
        });
    }

}

function addToCart() {
    var cart = $('#js-cart-data').data('cart');
    var sessionID = $('#js-cart-data').data('seasonid');
    var product = $(this).data('product');
    if (cart !== null) {
        listCartProducts = cart.listCartProducts;
    };
    const added = checkProductInList(product, listCartProducts);
    if (!added) {
        listCartProducts.push(product);
        let data = {
            sessionID: sessionID,
            listCartProducts: listCartProducts
        }
        $.ajax({
            url: `/api/updateCart`,
            dataType: "json",
            data: data,
            method: 'POST',
            success: function(data) {
                if (data.success) {
                    toast('Thông báo', 'Thêm thành công vào giỏ hàng!', 'success');
                    $('#cart-length').text(listCartProducts.length);
                } else {
                    toast('Thông báo', 'Lỗi hệ thống ! , vui lòng liên hệ admin', 'error');
                }
            }
        });

    } else {
        toast('Thông báo', 'Sản phẩm đã tồn tại trong giỏ hàng ', 'info');
    }
}

function addToWishList() {
    var cart = $('#js-cart-data').data('cart');
    var sessionID = $('#js-cart-data').data('seasonid');
    var product = $(this).data('product');

    if (cart !== null) {
        listFavorProducts = cart.listFavorProducts;
    };
    const added = checkProductInList(product, listFavorProducts);
    if (!added) {
        listFavorProducts.push(product);
        let data = {
            sessionID: sessionID,
            listFavorProducts: listFavorProducts
        }
        $.ajax({
            url: `/api/updateFavor`,
            dataType: "json",
            data: data,
            method: 'POST',
            success: function(data) {
                if (data.success) {
                    toast('Thông báo', 'Thêm thành công !', 'success');
                    $('#wish-list-length').text(listFavorProducts.length);
                } else {
                    toast('Thông báo', 'Lỗi hệ thống!', 'error');
                }
            }
        });

    } else {
        toast('Thông báo', 'Sản phẩm đã tồn tại trong danh sách ưa thích của bạn ', 'info');
    }
}



function checkProductInList(product, list) {
    let result = false;
    list.forEach(item => {
        if (item._id == product._id) {
            result = true;
        }
    });
    return result;
}