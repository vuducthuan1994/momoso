$(document).ready(function() {
    $('#add-wish-list').on('click', addToWishList);
    $('.add-product-to-cart').on('click', addToCart);
    $('.remove-wish-list').on('click', removeFromWishList);
    $('.remove-product-from-cart').on('click', removeFromCart)
    $('.pe-7s-close').on('click', removeProduct)
    initCart();
});

var listFavorProducts = [];
var listCartProducts = [];
const BASE_URL = 'product';

function removeProduct() {
    console.log('hahahaha');
}

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
    if (cart && cart !== null && cart !== undefined) {
        $('#cart-length').text(cart.listCartProducts.length);
        $('#wish-list-length').text(cart.listFavorProducts.length);
    }

}

function removeFromCart() {
    var cart = $('#js-cart-data').data('cart');
    var sessionID = $('#js-cart-data').data('seasonid');
    var productid = $(this).data('productid');
    if (cart !== null && cart !== undefined && cart.listCartProducts.length > 0) {
        cart.listCartProducts.splice(cart.listCartProducts.findIndex(function(i) {
            return i._id === productid;
        }), 1);
        let data = {
            sessionID: sessionID,
            listCartProducts: cart.listCartProducts
        }
        $.ajax({
            url: `/api/updateCart`,
            dataType: "json",
            data: data,
            method: 'POST',
            success: function(data) {
                if (data.success) {
                    toast('Thông báo', 'Xóa thành công khỏi giỏ hàng', 'success');
                    $('#cart-length').text(cart.listCartProducts.length);
                    $('#js-cart-data').data('cart', cart);
                    $(`#${productid}.single-cart-box`).remove();
                } else {
                    toast('Thông báo', 'Lỗi hệ thống!', 'error');
                }
            }
        });
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
    product['quantity'] = $('.cart-plus-minus-box').val() == 0 ? 1 : $('.cart-plus-minus-box').val();
    if (cart && cart !== null && cart !== undefined) {
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
                    addProductToListHeader(product);
                } else {
                    toast('Thông báo', 'Lỗi hệ thống ! , vui lòng liên hệ admin', 'error');
                }
            }
        });

    } else {
        toast('Thông báo', 'Sản phẩm đã tồn tại trong giỏ hàng ', 'info');
    }
}

function addProductToListHeader(product) {
    let html = `  <div id="${product._id}" class="single-cart-box">
    <div class="cart-img">
        <a href="${BASE_URL+'/'+product.urlSeo}"><img src="/img/menu/1.jpg" alt="cart-image"></a>
    </div>
    <div class="cart-content">
        <h6><a href="${BASE_URL+'/'+product.urlSeo}">${product.name}</a></h6>
       <span>${product.quantity} ×</span> <span class="product-price-vnd" data-price="${product.price} ">${product.price}</span>
    </div>
    <i data-productid="${product._id}" class="remove-product-from-cart pe-7s-close"></i>
</div>`
    $('#container-products').append(html);
    let totalPrice = $('#totalPrice').data('price') ? $('#totalPrice').data('price') : 0;
    totalPrice = parseInt(totalPrice) + (parseInt(product.quantity) * parseInt(product.price));
    $('#totalPrice').data('price', totalPrice);
    getPriceVND();
}

function getPriceVND() {
    $('.product-price-vnd').each(function(index, element) {
        var price = parseInt($(this).data('price'));
        price = price.toLocaleString('it-IT', { style: 'currency', currency: 'VND' });
        $(this).text(price);
    });
}

function addToWishList() {
    var cart = $('#js-cart-data').data('cart');
    var sessionID = $('#js-cart-data').data('seasonid');
    var product = $(this).data('product');

    if (cart && cart !== null && cart !== undefined) {
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