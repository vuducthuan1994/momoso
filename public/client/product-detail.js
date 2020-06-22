$(document).ready(function() {
    $('.product-price-desc #small-img li').on('click', selectProductColor)
});

function selectProductColor() {
    $('#small-img li').removeClass('active');
    $(this).addClass('active');
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

$('#button-review').on('click', function(event) {
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
        const sessionID = $('#js-cart-data').data('seasonid');
        reviewData.push({ name: 'productID', value: productID });
        reviewData.push({ name: 'sessionID', value: sessionID });
        reviewData.push({ name: 'productName', value: productName });
        $.ajax({
            url: "/api/createReview",
            data: reviewData,
            dataType: "json",
            method: 'POST',
            success: function(data) {
                if (data.success) {
                    toast('Thông báo', 'Cám ơn bạn đã review sản phẩm này !', 'success');
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                toast('Thông báo', 'Bình luận cách nhau 1 phút !', 'info');
            }
        });
    }
});