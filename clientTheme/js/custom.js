$(document).ready(function() {
    $('#submitSubscribe').on('click', submitSubscribeHandler);
});

function showToastSubscribe() {
    // https://github.com/kamranahmedse/jquery-toast-plugin
    $.toast({
        text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Hic, consequuntur doloremque eveniet eius eaque dicta repudiandae illo ullam. Minima itaque sint magnam dolorum asperiores repudiandae dignissimos expedita, voluptatum vitae velit.",
        hideAfter: false
    });
}

function validateEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
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

function submitSubscribeHandler() {
    const email = ($('#subscribe_email').val());
    if (!email || !(validateEmail(email))) {
        toast('Thông báo', 'Vui lòng nhập đúng địa chỉ email !', 'warning');
    } else {
        let data = {
            email: email
        }
        $.ajax({
            url: '/api/subscribe',
            dataType: "json",
            data: data,
            method: 'POST',
            success: function(data) {
                if (data.success) {
                    toast('Thông báo', 'Cám ơn bạn đã subscibe !', 'success');
                } else {
                    toast('Thông báo', 'Email này đã được subscibe', 'info');
                }
            }
        });
    }

}