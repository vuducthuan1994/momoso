$(document).ready(function() {
    $('.add-wish-list').on('click', addToWishList);
    $('.add-product-to-cart').on('click', addToCart);
    $('.remove-wish-list').on('click', removeFromWishList);
    // for element render from server
  
    $('#container-products').on('click', '.remove-product-from-cart',removeFromCart)

    $('#container-card-detail').on('click', '.remove-product-from-cart',removeFromCart)

    

    $('#updateCartButton').on('click', updateCart);
    $('.product-color select').on('change', changeImageProduct);
    initCart();
});

var listFavorProducts = [];
var listCartProducts = [];
const BASE_URL = 'product';
const R_BASE_IMAGE = 'https://momostudio.vn'


function changeImageProduct() {
    const newColorCode = $(this).val();
    let newColorImage = null;
    var product = $(this).parent().parent().data('product');
    for (var index in product.blocksColor) {
        if (product.blocksColor[index].colorCode == newColorCode) {
            if (product.blocksColor[index].listImages && product.blocksColor[index].listImages.length > 0) {
                newColorImage = product.blocksColor[index].listImages[0];
            }
        }
    }
    if (newColorImage) {
        $('.product-thumbnail img').attr('src', R_BASE_IMAGE + newColorImage);
    }
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

function removeFromWishList() {
    var productid = $(this).data('productid');
    let data = {
        _id: productid
    }
    $.ajax({
        url: `/api/removeFromWishList`,
        dataType: "json",
        data: data,
        method: 'POST',
        success: function(data) {
            if (data.success) {
                toast('Thông báo', 'Xóa thành công khỏi danh sách', 'success');
                $('#wish-list-length').text(data.lengthWishList);
                $(`tr#${productid}`).remove();
                if (data.lengthWishList == 0) {
                    $('tbody').append(
                        '<tr><td colspan="6" class="text-warning"><p class="text-muted">Bạn chưa thêm sản phẩm nào vào danh sách !</p></td></tr>'
                    );
                }
            } else {
                toast('Thông báo', 'Lỗi hệ thống!', 'error');
            }
        }
    });
}



function removeFromCart() {
    console.log("remove from cart !");
    let productid = $(this).data('productid');
    let price = $(this).data('price');
    let count = $(this).data('count');
    let data = {
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
                $(`tr#${productid}`).remove();

                let totalPrice = $('#totalPrice').data('price') ? $('#totalPrice').data('price') : 0;
                totalPrice = parseInt(totalPrice) - (parseInt(price) * parseInt(count));
                $('#totalPrice').data('price', parseInt(totalPrice));
                $('.amount').data('price', parseInt(totalPrice));
                getPriceVND();
            } else {
                toast('Thông báo', 'Không xóa được', 'info');
            }
        }
    });
}

function updateCart() {
    var totalProduct = 0;
    var listCartProducts = [];
    var totalPrice = 0;
    $('.product-item').each(function(index) {
        let product = $(this).data('product');
        totalProduct++;
        product.quantity = parseInt($(this).find('.product-quantity input').val());
        product.color = $(this).find('.product-color select').val();
        product.size = $(this).find('.product-size select').val();
        listCartProducts.push(product);
        totalPrice += product.price * product.quantity;
    });

    if (totalProduct == 0) {
        toast('Thông báo', 'Không có sản phẩm nào để cập nhật, vui lòng thêm sản phẩm vào giỏ hàng !', 'info');
    } else {
        let data = {
            listCartProducts: listCartProducts
        }
        $.ajax({
            url: `/api/updateCart`,
            dataType: "json",
            data: data,
            method: 'POST',
            success: function(data) {
                if (data.success) {
                    toast('Thông báo', 'Cập nhật giỏ hàng thành công !', 'success');
                    $('#totalPrice').data('price', parseInt(totalPrice));
                    $('.amount').data('price', parseInt(totalPrice));
                    getPriceVND();
                    $('#container-products .cart-content').each(function(index) {
                        $(this).find('span').first().text(listCartProducts[index].quantity + ' ×');
                    })
                } else {
                    toast('Thông báo', 'Hệ thống đang lỗi!', 'error');
                }
            }
        });
    }
}

function addToCart() {
    var product = $(this).data('product');
    const type_add = $(this).data('type');
    console.log(type_add)
    if(type_add) {
        if(type_add == 'detail' ) {
            product['count'] = $('#count_detail').val() == 0 ? 1 : $('#count_detail').val();
            product['color'] = $('#small-img li.active').data('code'); 
            product['size'] = $('#list-size li.active').data('code');
        }
        if(type_add== 'quick_view') {
            product['count'] = $('#count_quickview').val() == 0 ? 1 : $('#count_quickview').val();
            product['color'] = $('#quick-view-listColor li.active').data('code'); 
            product['size'] = $('#quick-view-listSize li.active').data('code');
        }

        if(!product['color'] || !product['count']) {
            toast('Thông báo', 'Vui lòng chọn màu sắc và kích cỡ !', 'info');
            return;
        }

        let data = {
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
}

function addProductToListHeader(product) {
    let html = `  <div id="${product._id}" class="single-cart-box">
    <div class="cart-img">
        <a href="${BASE_URL+'/'+product.urlSeo}"><img src="${product.thumb_cart ? R_BASE_IMAGE +product.thumb_cart : "/img/menu/1.jpg" }" alt="cart-image"></a>
    </div>
    <div class="cart-content">
        <h6><a href="${BASE_URL+'/'+product.urlSeo}">${product.name}</a></h6>
       <span>${product.count} ×</span> <span class="product-price-vnd" data-price="${product.price} ">${product.price}</span>
    </div>
    <i data-count="${product.count}" data-price="${product.price}" data-productid="${product._id}" class="remove-product-from-cart pe-7s-close"></i>
</div>`;
    $('#container-products').append(html);
    let totalPrice = $('#totalPrice').data('price') ? $('#totalPrice').data('price') : 0;
    totalPrice = parseInt(totalPrice) + (parseInt(product.count) * parseInt(product.price));
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
    // var sessionID = $('#js-cart-data').data('seasonid');
    var product = $(this).data('product');
    let data = {
        product: product
    }
    $.ajax({
        url: `/api/addToWishList`,
        dataType: "json",
        data: data,
        method: 'POST',
        success: function(data) {
            if (data.success) {
                toast('Thông báo', 'Thêm vào danh sách ưa thích thành công !', 'success');
                $('#wish-list-length').text(data.lengthWishList);
            } else {
                toast('Thông báo', 'Sản phẩm đã tồn tại trong danh sách ưa thích', 'info');
            }
        }
    });
}