$(document).ready(function() {
    console.log("contact");
    $('#subMitFormContact').on('click', createMessageListener);
});


function toast(title, msg, type = 'info') {
    $.toast({
        heading: title,
        text: msg,
        showHideTransition: 'plain',
        icon: type,
        position: 'bottom-right',
    });
}

function createMessageListener() {
    var formStatus = $('#contact-form').validate({
        errorClass: "text-danger"
            // messages: {
            //     name: {
            //         required: "Hãy điền tên của bạn nhé !"
            //     },
            //     comment: {
            //         required: "Hãy điền nội dung bạn muốn bình luận nhé !"
            //     }
            // }
    }).form();
    if (formStatus) {
        var reviewData = $('#formReview').serializeArray();
        const sessionID = $('#js-cart-data').data('seasonid');
        reviewData.push({ name: 'productID', value: productID });
        reviewData.push({ name: 'sessionID', value: sessionID });
        reviewData.push({ name: 'productName', value: productName });
        reviewData.push({ name: 'URL', value: window.location.href })
        $.ajax({
            url: "/api/createReview",
            data: reviewData,
            dataType: "json",
            method: 'POST',
            success: function(data) {
                if (data.success) {
                    toast('Thông báo', 'Cám ơn bạn đã liên hệ với chúng tôi !', 'success');
                    $('.main-thumb-desc li').removeClass('active');
                    $('.main-thumb-desc a[href="#detail"]').tab('show');
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                toast('Thông báo', 'Bình luận cách nhau 1 phút !', 'info');
            }
        });
    }
}