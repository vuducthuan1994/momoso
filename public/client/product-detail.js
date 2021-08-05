let skus = null;
$(document).ready(function () {
    skus = $('.add-product-to-cart').data('product') ? $('.add-product-to-cart').data('product').skus : null;
    console.log(skus)
    checkColorsStock();
    $('.container-list-color a').on('click', selectProductColor);
    $('#list-size button').on('click', selectProductSize);
});

function selectProductColor() {
    if (!$(this).parent().hasClass('out_of_stock')) {
        $('.container-list-size').css('display','block');
        $('#list-size li').removeClass('out_of_stock');
        $('#list-size li').removeClass('active');
        $('#small-img li').removeClass('active');
        $(this).parent().addClass('active');
        CheckSizeStock();
    }
}

function selectProductSize() {
    if (!$(this).parent().hasClass('out_of_stock')) {
        $('.container-list-size li').removeClass('active');
        $(this).parent().addClass('active');
        const productCode = $('.add-product-to-cart').data('product').code;
        const currentColorCode = $('#small-img li.active').data('code');
        const currentSizeCode = $('.container-list-size li.active').data('code');

        const productCodeAfterJoin = `${productCode}${currentColorCode}${currentSizeCode}`;
        if (skus && skus.length > 0) {
            let newPrice = skus.find(o => o.sku === productCodeAfterJoin).price;
            console.log(newPrice);
            $('#current_price_product').attr('data-price', newPrice);
            const price = newPrice.toLocaleString('it-IT', { style: 'currency', currency: 'VND' });
            $('#current_price_product').text(price);

        }
    }
}

function checkColorsStock() {
    $('#small-img li').each(function (i, obj) {
        const colorCode = $(this).data('code');
        let check_product_color = checkColorOnSkus(colorCode);
        console.log(check_product_color);
        if (!check_product_color) {
            $(this).addClass('out_of_stock');
            $(this).find('a').attr('data-zoom-image', '');
            $(this).find('a').attr('data-image', '');
            initElevatezoom();
        }
    });
}

function CheckSizeStock() {
    $('.container-list-size li').each(function (i, obj) {
        const sizeCode = $(this).data('code');
        const currentColorCode = $('#small-img li.active').data('code');
        let check_product_size = CheckSizeColorsOnSkus(sizeCode, currentColorCode);
        if (!check_product_size) {
            $(this).addClass('out_of_stock');
        }
    });
}

function checkColorOnSkus(color_code) {
    const productCode = $('.add-product-to-cart').data('product').code;
    let product_join_color = productCode + color_code;
    if (!skus || skus.length == 0) {
        return false;
    } else {
        for (let index = 0; index < skus.length; index++) {
            const skuItem = skus[index];
            if (skuItem.sku.includes(product_join_color) && skuItem.count > 0) {
                return true;
            }
        }
        return false;
    }
}

function CheckSizeColorsOnSkus(size_code, color_code) {
    const productCode = $('.add-product-to-cart').data('product').code;
    let product_join_size_color = productCode + color_code + size_code;
    console.log(product_join_size_color)
    if (!skus || skus.length == 0) {
        return false;
    } else {
        for (let index = 0; index < skus.length; index++) {
            const skuItem = skus[index];
            if (skuItem.sku.includes(product_join_size_color) && skuItem.count > 0) {
                return true;
            }
        }
        return false;
    }

}

function initElevatezoom() {
    $("#big-img").elevateZoom({
        constrainType: "width",
        containLensZoom: true,
        gallery: 'small-img',
        cursor: 'pointer',
        galleryActiveClass: "active"
    });
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

$('#button-review').on('click', function (event) {
    var formStatus = $('#formReview').validate({
        errorClass: "text-danger",
        messages: {
            name: {
                required: "Hãy điền tên của bạn nhé !"
            },
            comment: {
                required: "Hãy điền nội dung bạn muốn bình luận nhé !"
            }
        }
    }).form();
    if (formStatus) {
        var reviewData = $('#formReview').serializeArray();
        const productID = $('.add-product-to-cart').data('product')._id;
        const productName = $('.add-product-to-cart').data('product').name;
        reviewData.push({ name: 'productID', value: productID });
        reviewData.push({ name: 'productName', value: productName });
        reviewData.push({ name: 'URL', value: window.location.href })
        $.ajax({
            url: "/api/createReview",
            data: reviewData,
            dataType: "json",
            method: 'POST',
            success: function (data) {
                if (data.success) {
                    toast('Thông báo', 'Cám ơn bạn đã review sản phẩm này !', 'success');
                    $('.main-thumb-desc li').removeClass('active');
                    $('.main-thumb-desc a[href="#detail"]').tab('show');
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                toast('Thông báo', 'Bình luận cách nhau 1 phút !', 'info');
            }
        });
    }
});