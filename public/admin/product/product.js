let size_example_code = ['M','L','S','XL','XXL'];
let color_example_code = ['G','X','I','B','D','O','E','Y','W','P','R']

$(document).ready(function() {
    initSelectTag();
    getPriceVND();




    $('#add-product-image').on('click', addImageProduct);
    $('.delete-image-product').on('click', deleteImageProduct);

    $('#add-block-color').on('click', addColorBlock);
    $('#add-block-size').on('click', addSizeBlock);


    $('.delete-block-color ').on('click', deleteBlockColor)
    $('.delete-block-size ').on('click', deleteBlockSize)

    $('#product-price').on('input', function() {
        getPriceVND();
    });

    $('.form-group input').change(function() {
        readURL(this);
    });
});
const ENV = 'PRODUCT';

function addImageProduct() {
    const imageProduct = $('#base-image-product').clone(true);
    $('#container-images-product').append(imageProduct.children().clone(true));
}

function addColorBlock() {
        var index = $('#container-color-blocks .color-block').length + 1;
        const colorCode = color_example_code[index] || 'FREE_COLOR';
        $('#base-block-color').find('.color-code').val(colorCode);
        const colorBlock = $('#base-block-color').clone(true);
        $('#container-color-blocks').append(colorBlock.children().clone(true));
}

function addSizeBlock() {
        var index = $('#container-size-blocks .size-block ').length;
        const sizeCode = size_example_code[index] || 'FREE-SIZE' ;
        $('#base-block-size').find('.size-code').val(sizeCode);
        const sizeBlock = $('#base-block-size').clone(true);
        $('#container-size-blocks').append(sizeBlock.children().clone(true)); 
}


function deleteBlockColor() {
    $(this).parent().parent().remove();
}


function deleteBlockSize() {
    $(this).parent().parent().remove();
}

function deleteImageProduct() {
    $(this).parent().parent().remove();
    const path = $(this).data('path');
    if (path) {
        let formData = new FormData();
        formData.append('url', path)
        $.ajax({
            url: `/admin/product/deleteImage`,
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            method: 'POST',
            type: 'POST', // For jQuery < 1.9
            success: function(data) {
                if (data.success) {
                    swal({
                        title: 'Thành công',
                        text: `Ảnh đã xóa khỏi hệ thống, vui lòng update !`,
                        type: 'success',
                        padding: '2em'
                    });
                } else {
                    swal({
                        title: 'Thất bại',
                        text: `Không xóa được ảnh khỏi hệ thống`,
                        type: 'error',
                        padding: '2em'
                    });
                }
            }
        });
    }


}

function toast(title, msg, type = 'info') {
    $.toast({
        heading: title,
        text: msg,
        showHideTransition: 'plain',
        icon: type,
        position: 'top-right',
    });
}

function getListCurrentImages() {
    let results = [];
    $(".common-image").each(function() {
        results.push($(this).val());
    });
    return JSON.stringify(results);
};

function getColorBlocks() {
    let results = [];
    $('.color-block').each(function(idx) {
        const colorName = $(this).find('input.color-name').val().trim();
        const colorCode = $(this).find('input.color-code').val().trim();
        const colorImage = $(this).find('img.color-image').data('image') ? [$(this).find('img.color-image').data('image')] : [];
        if (colorName && colorCode) {
            results[idx] = {
                colorName: colorName,
                colorCode: colorCode,
                listImages: colorImage
            }
        }

    });
    return JSON.stringify(results);
}

function getListSize() {
    let results = [];
    let validate = true;
    $('#container-size-blocks .size-block').each(function(idx) {
        const sizeCode = $(this).find('input.size-code').val();
        const sizeName = $(this).find('input.size-name').val();
        results[idx] = {
            sizeCode: sizeCode,
            sizeName: sizeName
        }
        if(!sizeCode || !sizeName) {
            validate = false;
   
        }
    });
    if(validate) {
        return JSON.stringify(results);
    } else{
        return null;
    }
}

function initTagSelected(categoryList) {
    let optionsCategorySelected = [];
    const categorysSelected = $('#product-category').data('selected');
    if (categorysSelected) {
        categorysSelected.forEach((selected) => {
            categoryList.forEach((category) => {
                if (category._id == selected._id) {
                    optionsCategorySelected.push(category.id);
                }
            });
        });
        $('#product-category').val(optionsCategorySelected).trigger('change.select2');
    }

}

function initSelectTag() {
    var data_categorys = $('#product-category').data('categorys');

    // format data for selectTag
    data_categorys.forEach((element, index) => {
        element['text'] = element.name;
        element['id'] = index
    });


    var selectagCategory = $("#product-category").select2({
        multiple: true,
        data: data_categorys
    });

    initTagSelected(data_categorys);
}

function getPriceVND() {
    var price = parseInt($('#product-price').val());
    price = price.toLocaleString('it-IT', { style: 'currency', currency: 'VND' });
    $('#show-price').text(price);
}

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

$('#product-name').on('input', function() {
    var slugFromName = slugFromTitle($('#product-name').val());
    $('#product-url-seo').val(slugFromName);
});


let handlerForm = function(idProduct) {
    var formData = $('#formProduct').serializeArray();
    var newFormData = new FormData();

    getFileColorProduct(newFormData);


    // lấy tất cả file từ form  commom image
    $.each($("#container-images-product input[type='file']"), function(index, file) {
        newFormData.append('commonImageFile', $('input[type=file]')[index].files[0]);
    });
    // lấy tất cả file từ form 


    let categorysSelected = $("#product-category").select2('data');
    let sizes = getListSize();
 
    if(!sizes) {
        swal({
            title: 'Validate Error',
            text: `Vui lòng kiểm tra lại các sizes đã chọn`,
            type: 'error',
            padding: '2em'
        });
        return false;
    }

 

    for (var i in formData) {
        if (formData[i].name == 'detail') {
            formData[i].value = CKEDITOR.instances['product-detail'].getData();
        }
        if (formData[i].name == 'category') {
            formData[i].value = JSON.stringify(categorysSelected);
        }
        newFormData.append(formData[i].name, formData[i].value);
    }
    newFormData.append('blocksSize', sizes);

    const colorBlocks = getColorBlocks();
    newFormData.append('colorBlocks', colorBlocks);

    if (idProduct) {
        const commonImages = getListCurrentImages();
        newFormData.append('commonImages', commonImages);
    }

    $('.submitForm div').removeClass('d-none');
    $.ajax({
        url: !idProduct ? '/admin/product' : `/admin/product/edit-product/${idProduct}`,
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
                    text: idProduct ? `Sản phẩm ${data.data.name} đã update thành công !` : `Sản phẩm ${data.data.name} đã được thêm vào hệ thống`,
                    type: 'success',
                    padding: '2em'
                });
            } else {
                $('.submitForm div').addClass('d-none');
                swal({
                    title: 'Thất bại',
                    text: `Không thêm được sản phẩm , mã lỗi : ${data.msg}`,
                    type: 'error',
                    padding: '2em'
                });
            }
        }
    });
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



function getFileColorProduct(formData) {
    $('.color-block').each(function(idx) {
        console.log(idx);
        $(this).find("input[type='file']").each(function(index, file) {
            formData.append(`color_image_block_${idx}`, $(this)[0].files[0]);
        });
    });
}
$('.submitForm').on('click', function(event) {
    var formStatus = $('#formProduct').validate({
        errorClass: "text-danger",
        messages: {
            name: {
                required: "Vui lòng điền tên sản phẩm !"
            },
            price: {
                required: "Bạn chưa chọn giá sản phẩm"
            },
            urlSeo: {
                required: "URL Sản phẩm không được để trống"
            },
            list_price : {
                required: "Bạn chưa chọn danh sách giá sản phẩm tương ứng với size"
            }
        }
    }).form();
    if (formStatus || ENV == 'DEV') {
        const idProduct = $(this).data('productid');
        handlerForm(idProduct);
    } else {
        swal({
            title: 'Validate Error !',
            text: "Vui lòng kiểm tra lại các thông tin sản phẩm !",
            type: 'error',
            padding: '2em'
        });
    }
});