$(document).ready(function () {
    $('#submitFormComment').on('click', commentProcess);
});


function toast(title, msg, type = 'info') {
    $.toast({
        heading: title,
        text: msg,
        showHideTransition: 'plain',
        icon: type,
        position: 'top-right',
    });
}

function commentProcess() {


    var formStatus = $('#comment-form').validate({
        errorClass: "text-danger",
        errorElement: 'span',
        messages: {
            name: {
                required: "Bạn chưa nhập tên người nhận hàng",
                minlength: " Vui lòng nhập lớn hơn hoặc bằng 6 ký tự",
                maxlength: 'Vui lòng nhập nhỏ hơn hoặc bằng 100 ký tự'
            },
            email: {
                required: "Bạn chưa nhập tên người nhận hàng",
                minlength: " Vui lòng nhập lớn hơn hoặc bằng 6 ký tự",
                maxlength: 'Vui lòng nhập nhỏ hơn hoặc bằng 100 ký tự'
            },
            website: {
                required: "Bạn chưa nhập số điện thoại nhận hàng",
                minlength: " Vui lòng nhập lớn hơn hoặc bằng 6 ký tự",
                maxlength: 'Vui lòng nhập nhỏ hơn hoặc bằng 100 ký tự'
            },
            subject: {
                required: "Bạn chưa điền địa chỉ nhận hàng",
                minlength: 'Vui lòng nhập lớn hơn 6 ký tự ',
                maxlength: 'Vui lòng nhập nhỏ hơn hoặc bằng 100 ký tự'
            },
            message: {
                required: "Bạn chưa điền địa chỉ nhận hàng",
                minlength: 'Vui lòng nhập lớn hơn 6 ký tự ',
                maxlength: 'Vui lòng nhập nhỏ hơn hoặc bằng 300 ký tự'
            }
        }
    }).form();

    if (formStatus) {
        var commentData = $('#comment-form').serializeArray();
        const postId =  $('#submitFormComment').attr('data-urlSeo')
        commentData.push({ name: 'urlSeo', value: postId });
        $.ajax({
            url: "/api/createComment",
            data: commentData,
            dataType: "json",
            method: 'POST',
            success: function (data) {
                if (data.success) {
                    toast('Thông báo', 'Đăng bình luận thành công', 'info');
                }
              
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                toast('Thông báo', 'Vui lòng thử lại sau 1 phút nữa', 'info');
            }
        });
    } else {
        toast('Thông báo', 'Vui lòng kiểm tra lại thông tin của bạn trước khi comment !', 'danger');
    }

}