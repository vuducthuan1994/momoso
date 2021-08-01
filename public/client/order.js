$(document).ready(function () {
    $('#subMitFormOrder').on('click', orderProcess);

    $('#payment-method').on('change',onPaymentMethodChange);
});

function onPaymentMethodChange() {
    console.log($('#payment-method').val())
    const payment_method = $('#payment-method').val();
    if(payment_method == 'bank') {
        $('#huong-dan-chuyen-khoan').show();
    } else {
        $('#huong-dan-chuyen-khoan').hide();
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

function orderProcess() {

    const money = $('#totalMoney').attr('data-price');
    if (money > 0) {
        var formStatus = $('#order-form').validate({
            errorClass: "text-danger",
            errorElement: 'span',
            messages: {
                name: {
                    required: "Bạn chưa nhập tên người nhận hàng",
                    minlength: " Vui lòng nhập lớn hơn hoặc bằng 6 ký tự",
                    maxlength: 'Vui lòng nhập nhỏ hơn hoặc bằng 100 ký tự'
                },
                phone: {
                    required: "Bạn chưa nhập số điện thoại nhận hàng",
                    minlength: " Vui lòng nhập lớn hơn hoặc bằng 6 ký tự",
                    maxlength: 'Vui lòng nhập nhỏ hơn hoặc bằng 15 ký tự'
                },
                address: {
                    required: "Bạn chưa điền địa chỉ nhận hàng",
                    minlength: 'Vui lòng nhập lớn hơn 6 ký tự ',
                    maxlength: 'Vui lòng nhập nhỏ hơn hoặc bằng 100 ký tự'
                }
            }
        }).form();

        if (formStatus) {
            var orderData = $('#order-form').serializeArray();
            $.ajax({
                url: "/api/createOrder",
                data: orderData,
                dataType: "json",
                method: 'POST',
                success: function (data) {
                    if (data.success) {
                        toast('Thông báo', 'Đặt hàng thành công, chúng tôi sẽ liên lạc lại với bạn !', 'info');
                        $('.popup_wrapper_order').css({
                            "opacity": "1",
                            "visibility": "visible"
                        });
                        $('.popup_off').on('click', function () {

                            $('.popup_wrapper_order').css({
                                "opacity": "0",
                                "visibility": "hidden"
                            });
                        });
                    }
                    setTimeout(function() { window.location.href = "/"; }, 5000);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    toast('Thông báo', 'Vui lòng thử lại sau 1 phút nữa', 'info');
                }
            });
        }else {
            toast('Thông báo', 'Vui lòng kiểm tra lại thông tin đặt hàng !', 'danger');
        }
    } else {
        toast('Thông báo', 'Bạn chưa thêm sản phẩm nào vào giỏ hàng !', 'info');
    }
}