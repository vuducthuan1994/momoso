$(document).ready(function() {
    $('#add-wish-list').on('click', addToWishList);
    $('.add-product-to-cart').on('click', addToCart);
    $('.remove-wish-list').on('click', removeFromWishList);
    // for element render from server
    $('.remove-product-from-cart').on('click', removeFromCart);
    // for element after append
    $('#container-products').on('click', '.remove-product-from-cart', removeFromCart);
    initCart();
});

var listFavorProducts = [];
var listCartProducts = [];
const BASE_URL = 'product';



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
                    $('#js-cart-data').data('cart', data.cart);
                    $(`#${product._id}`).remove();
                } else {
                    toast('Thông báo', 'Lỗi hệ thống!', 'error');
                }
            }
        });
    }

}

function removeFromCart() {
    console.log("hahahaha");
    var sessionID = $('#js-cart-data').data('seasonid');
    let productid = $(this).data('productid');
    let price = $(this).data('price');
    let data = {
        sessionID: sessionID,
        _id: productid
    }
    $.ajax({
        url: `/api/removeFromCart`,
        dataType: "json",
        data: data,
        method: 'POST',
        success: function(data) {
            if (data.success) {
                toast('Thông báo', 'Xóa sản phẩm thành công khỏi giỏ hàng', 'success');
                $('#cart-length').text(data.lengthCart);
                $(`.single-cart-box#${productid}`).remove();

                let totalPrice = $('#totalPrice').data('price') ? $('#totalPrice').data('price') : 0;
                totalPrice = parseInt(totalPrice) - (parseInt(price));
                $('#totalPrice').data('price', totalPrice);
                getPriceVND();
            } else {
                toast('Thông báo', 'Không xóa được', 'info');
            }
        }
    });
}

function addToCart() {

    var sessionID = $('#js-cart-data').data('seasonid');
    var product = $(this).attr('data-product');
    console.log(product);
    product['quantity'] = $('.cart-plus-minus-box').val() == 0 ? 1 : $('.cart-plus-minus-box').val();

    let data = {
        sessionID: sessionID,
        product: product
    }
    $.ajax({
        url: `/api/addToCart`,
        dataType: "json",
        data: data,
        method: 'POST',
        success: function(data) {
            if (data.success) {
                toast('Thông báo', 'Thêm thành công vào giỏ hàng!', 'success');
                $('#cart-length').text(data.lengthCart);
                addProductToListHeader(product);
            } else {
                toast('Thông báo', 'Sản phẩm đã tồn tại trong giỏ hàng !', 'info');
            }
        }
    });
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
    <i data-price="${product.price}" data-productid="${product._id}" class="remove-product-from-cart pe-7s-close"></i>
</div>`;
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

}