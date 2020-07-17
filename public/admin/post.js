$(document).ready(function() {
    initSelectTag();
    console.log("init post add");
    $('.form-group input').change(function() {
        readURL(this);
    });

})
const ENV = 'PRODUCT';


var slugFromTitle = function(str) {
    str = str.toLowerCase();
    str = str.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, 'a');
    str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, 'e');
    str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, 'i');
    str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, 'o');
    str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, 'u');
    str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, 'y');
    str = str.replace(/(đ)/g, 'd');
    str = str.replace(/([^0-9a-z-\s])/g, '');
    str = str.replace(/(\s+)/g, '-');
    str = str.replace(/^-+/g, '');
    str = str.replace(/-+$/g, '');
    return str;
};
$('#post-name').on('input', function() {
    var slugFromName = slugFromTitle($('#post-name').val());
    $('#post-url-seo').val(slugFromName);
});

function initSelectTag() {
    var data_categorys = $('#post-category').data('categorys');
    // format data for selectTag
    data_categorys.forEach((element, index) => {
        element['text'] = element.name;
        element['id'] = index
    });


    var selectagCategory = $("#post-category").select2({
        multiple: true,
        data: data_categorys
    });

    initTagSelected(data_categorys);
}

function initTagSelected(categoryList) {
    let optionsCategorySelected = [];
    const categorysSelected = $('#post-category').data('selected');
    if (categorysSelected) {
        categorysSelected.forEach((selected) => {
            categoryList.forEach((category) => {
                if (category._id == selected._id) {
                    optionsCategorySelected.push(category.id);
                }
            });
        });
        $('#post-category').val(optionsCategorySelected).trigger('change.select2');
    }

}

function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function(e) {
            $(input).parent().find('img').attr('src', e.target.result);
        }

        reader.readAsDataURL(input.files[0]);
    }
}

$('.submitForm').on('click', function(event) {
    var formStatus = $('#formPost').validate({
        errorClass: "text-danger",
        messages: {
            title: {
                required: "Vui lòng điền tên bài viết !"
            }
        }
    }).form();
    if (formStatus || ENV == 'DEV') {
        const idPost = $(this).data('postid');
        handlerForm(idPost);
    } else {
        swal({
            title: 'Validate Error !',
            text: "Vui lòng kiểm tra lại các thông tin bài viết !",
            type: 'error',
            padding: '2em'
        });
    }
});

function getBannerImage() {
    let result = $('.banner-post').data('banner');
    return result;
};


function getThumbImage() {
    let result = $('.banner-post').data('thumb');
    return result;
};


let handlerForm = function(idPost) {
    var formData = $('#formPost').serializeArray();
    var newFormData = new FormData();

    // lấy tất  cả file ảnh
    $.each($("input[type='file']"), function(index, file) {
        newFormData.append('banner_image', $('input[type=file]')[index].files[0]);
    });
    // lấy tất cả file từ form 

    let categorysSelected = $("#post-category").select2('data');
    for (var i in formData) {
        if (formData[i].name == 'body') {
            formData[i].value = CKEDITOR.instances['post-content'].getData();
        }
        if (formData[i].name == 'category') {
            formData[i].value = JSON.stringify(categorysSelected);
        }
        newFormData.append(formData[i].name, formData[i].value);
    }

    if (idPost) {
        const banner_image = getBannerImage();
        const thumb_image = getThumbImage();
        newFormData.append('banner_image', banner_image);
        newFormData.append('thumb_image', thumb_image);
    }

    $('.submitForm div').removeClass('d-none');

    $.ajax({
        url: !idPost ? '/admin/post' : `/admin/posts/edit-post/${idPost}`,
        data: newFormData,
        cache: false,
        contentType: false,
        processData: false,
        method: 'POST',
        type: 'POST', // For jQuery < 1.9
        success: function(data) {

            if (data.success) {
                $('.submitForm div').addClass('d-none');
                swal({
                    title: 'Thành công',
                    text: idPost ? `Bài viết ${data.data.title} đã update thành công !` : `bài viết ${data.data.title} đã được thêm vào hệ thống`,
                    type: 'success',
                    padding: '2em'
                });
            } else {
                $('.submitForm div').addClass('d-none');
                swal({
                    title: 'Thất bại',
                    text: `Không thêm được bài viết , mã lỗi : ${data.msg}`,
                    type: 'error',
                    padding: '2em'
                });
            }
        }
    });
}