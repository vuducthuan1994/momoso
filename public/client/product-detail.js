$(document).ready(function() {
    $('.container-list-color a').on('click', selectProductColor)
});

function selectProductColor() {
    $('#small-img li').removeClass('active');
    $(this).parent().addClass('active');
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
        reviewData.push({ name: 'productID', value: productID });
        reviewData.push({ name: 'productName', value: productName });
        reviewData.push({ name: 'URL', value: window.location.href })
        $.ajax({
            url: "/api/createReview",
            data: reviewData,
            dataType: "json",
            method: 'POST',
            success: function(data) {
                if (data.success) {
                    toast('Thông báo', 'Cám ơn bạn đã review sản phẩm này !', 'success');
                    $('.main-thumb-desc li').removeClass('active');
                    $('.main-thumb-desc a[href="#detail"]').tab('show');
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                toast('Thông báo', 'Bình luận cách nhau 1 phút !', 'info');
            }
        });
    }
});