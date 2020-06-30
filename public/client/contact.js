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
        errorClass: "text-danger",
        messages: {
            name: {
                required: "Bạn chưa nhập tên"
            },
            email: {
                required: "Bạn chưa nhập email"
            },
            message: {
                required: "Bạn chưa nhập nội dung"
            },
            subject: {
                required: "Bạn chưa nhập tiêu đề"
            }
        }
    }).form();

    if (formStatus) {
        var reviewData = $('#contact-form').serializeArray();
        const sessionID = $('#js-cart-data').data('seasonid');
        reviewData.push({ name: 'sessionID', value: sessionID });
        $.ajax({
            url: "/api/createMessage",
            data: reviewData,
            dataType: "json",
            method: 'POST',
            success: function(data) {
                if (data.success) {
                    toast('Thông báo', 'Cám ơn bạn đã liên hệ với chúng tôi !', 'success');
                }
                // window.location.href = "/";
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                toast('Thông báo', 'Vui lòng thử lại sau 1 phút nữa', 'info');
            }
        });
    }
}