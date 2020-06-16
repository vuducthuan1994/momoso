$(document).ready(function() {
    initSelectTag();
    getPriceVND();

    function addImageProduct() {
        const imageProduct = $('#base-image-product').clone(true);
        $('#container-images-product').prepend(imageProduct.children().clone(true));
    }

    function addColorBlock() {
        const colorBlock = $('#base-block-color').clone(true);
        $('#container-color-blocks').prepend(colorBlock.children().clone(true));
    }

    function addImageToBlock() {
        const colorItem = $('#base-image-color').clone(true);
        $(this).next().prepend(colorItem.children().clone(true));
        // $('#container-images-color').prepend(colorItem.children().clone(true));
    }

    function deleteImageOfColor() {
        $(this).parent().parent().remove();
    }

    function deleteBlockColor() {
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

    $('#add-product-image').on('click', addImageProduct);
    $('.delete-image-product').on('click', deleteImageProduct);

    $('#add-block-color').on('click', addColorBlock);
    $('.add-color-to-block').on('click', addImageToBlock)
    $('.delete-image-color').on('click', deleteImageOfColor)
    $('.delete-block-color ').on('click', deleteBlockColor)


    $('#product-price').on('input', function() {
        getPriceVND();
    });
});
const ENV = 'PRODUCT';

function getListCurrentImages() {
    let results = [];
    $(".currentImage").each(function() {
        results.push($(this).val());
    });
    return JSON.stringify(results);
};

function initTagSelected(categoryList, storageList) {
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

    let optionsStorageSelected = [];
    const storageSlected = $('#product-storage').data('selected');
    if (storageSlected) {
        storageSlected.forEach((selected) => {
            storageList.forEach((storage) => {
                if (storage._id == selected._id) {
                    optionsStorageSelected.push(storage.id);
                }
            });
        });
        $('#product-storage').val(optionsStorageSelected).trigger('change.select2');

    }
}

function initSelectTag() {
    var data_categorys = $('#product-category').data('categorys');
    var data_storages = $('#product-storage').data('storages');

    // format data for selectTag
    data_categorys.forEach((element, index) => {
        element['text'] = element.name;
        element['id'] = index
    });
    data_storages.forEach((element, index) => {
        element['text'] = element.name;
        element['id'] = index
    });

    var selectagCategory = $("#product-category").select2({
        multiple: true,
        data: data_categorys
    });
    var selectagStorage = $("#product-storage").select2({
        multiple: true,
        data: data_storages
    });
    initTagSelected(data_categorys, data_storages);
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
    if (ENV == 'DEV') {
        getFormColor(newFormData);

    }
    // lấy tất cả file từ form 
    $.each($("#container-images-product input[type='file']"), function(index, file) {
        newFormData.append('files[]', $('input[type=file]')[index].files[0]);
    });
    // lấy tất cả file từ form 


    let categorysSelected = $("#product-category").select2('data');
    let storagesSelected = $("#product-storage").select2('data');
    for (var i in formData) {
        if (formData[i].name == 'detail') {
            formData[i].value = CKEDITOR.instances['product-detail'].getData();
        }
        if (formData[i].name == 'storage') {
            formData[i].value = JSON.stringify(storagesSelected);
        }
        if (formData[i].name == 'category') {
            formData[i].value = JSON.stringify(categorysSelected);
        }
        newFormData.append(formData[i].name, formData[i].value);
    }

    if (idProduct) {
        const currentImages = getListCurrentImages();
        newFormData.append('currentImages', currentImages);
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
            console.log(data);
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

function getListColorBlock() {
    let results = [];
    $('.color-code').each(function() {
        results.push($(this).val());
    });
    results.pop();
    return JSON.stringify(results);
}

function getFormColor(formData) {
    $('#container-color-blocks .container-images-color').each(function(idx) {
        $(this).find("input[type='file']").each(function(index, file) {
            formData.append(`color_image_block_${idx}`, $('input[type=file]')[index].files[0]);
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
                required: "bạn chưa chọn giá sản phẩm"
            },
            urlSeo: {
                required: "URL Sản phẩm không được để trống"
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