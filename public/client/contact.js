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
        var contactData = $('#contact-form').serializeArray();
        const sessionID = $('#js-cart-data').data('seasonid');
        contactData.push({ name: 'sessionID', value: sessionID });
        $.ajax({
            url: "/api/createMessage",
            data: contactData,
            dataType: "json",
            method: 'POST',
            success: function(data) {
                if (data.success) {
                    toast('Thông báo', 'Cám ơn bạn đã liên hệ với chúng tôi !', 'success');
                }
                setTimeout(function() { window.location.href = "/"; }, 2000);
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                toast('Thông báo', 'Vui lòng thử lại sau 1 phút nữa', 'info');
            }
        });
    }
}