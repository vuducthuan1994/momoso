$(document).ready(function() {
    initSelectTag();

    $('#submitImportProduct').on('click', importProduct)
    $('#product-price').on('input', getPriceVND);
    $('#total-products').on('input', getPriceVND)
});

function getPriceVND() {
    var pricePerItem = parseInt($('#product-price').val()) ? parseInt($('#product-price').val()) : 0;
    var totalProducts = parseInt($('#total-products').val()) ? parseInt($('#total-products').val()) : 0;
    var totalMoney = totalProducts * pricePerItem;
    pricePerItem = pricePerItem.toLocaleString('it-IT', { style: 'currency', currency: 'VND' });
    totalMoney = totalMoney.toLocaleString('it-IT', { style: 'currency', currency: 'VND' });
    $('#show-price').text(pricePerItem);
    $('#show-total-price').text(totalMoney);
}


function importProduct() {
    var formStatus = $('#formImport').validate({
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
    var formData = $('#formImport').serializeArray();
    var newFormData = new FormData();
    console.log(formData);
    const TYPE = formData[0].value == 'import' ? 'NHẬP' : 'XUẤT';
    let productSelected = $("#product-list").select2('data')[0];
    let storagesSelected = $("#product-storage").select2('data')[0];
    let colorSelected = $("#color-list").select2('data')[0];
    let sizeSelected = $("#size-list").select2('data')[0];

    for (var i in formData) {

        if (formData[i].name == 'product') {
            formData[i].value = JSON.stringify(productSelected);
        }
        if (formData[i].name == 'color') {
            formData[i].value = JSON.stringify(colorSelected);
        }
        if (formData[i].name == 'size') {
            formData[i].value = JSON.stringify(sizeSelected);
        }
        if (formData[i].name == 'storage') {
            formData[i].value = JSON.stringify(storagesSelected);
        }
        newFormData.append(formData[i].name, formData[i].value);
    }
    const idStorage = storagesSelected._id;
    $.ajax({
        url: `/admin/storage/import-product/${idStorage}`,
        data: newFormData,
        cache: false,
        contentType: false,
        processData: false,
        method: 'POST',
        success: function(data) {
            if (data.success) {
                swal({
                    title: 'THÀNH CÔNG',
                    text: `${TYPE} KHO THÀNH CÔNG !`,
                    type: 'success',
                    padding: '2em'
                });
            } else {
                swal({
                    title: 'Thất bại',
                    text: `Lỗi Hệ Thống , Liên Hệ Admin`,
                    type: 'error',
                    padding: '2em'
                });
            }
        }
    });
}

function initSelectTag() {
    var data_storages = $('#product-storage').data('storages');
    var data_products = $('#product-list').data('products');
    // format data for selectTag
    data_storages.forEach((element, index) => {
        element['text'] = element.name;
        element['id'] = index
    });
    data_products.forEach((element, index) => {
        element['text'] = element.name;
        element['id'] = index
    });

    var selectagStorage = $("#product-storage").select2({
        multiple: false,
        data: data_storages
    });
    var selectagProduct = $("#product-list").select2({
        multiple: false,
        data: data_products
    });
    $("#product-list").on("select2:select", function(e) {
        var data_colors = [];
        var data_sizes = [];
        var product = e.params.data;

        if (product.blocksColor !== null && product.blocksColor !== undefined && product.blocksSize !== null && product.blocksSize !== undefined) {
            data_colors = product.blocksColor;
            data_sizes = product.blocksSize;
        }
        data_colors.forEach((element, index) => {
            element['text'] = element.colorName;
            element['id'] = index
        });
        data_sizes.forEach((element, index) => {
            element['text'] = element.sizeName;
            element['id'] = index
        });
        if (data_colors.length == 0) {
            data_colors.push({
                text: 'FREE COLOR',
                colorName: 'FREE COLOR',
                colorCode: 'FREE-COLOR',
                id: 0
            });
        };
        if (data_sizes.length == 0) {
            data_sizes.push({
                text: 'FREE SIZE',
                sizeCode: 'FREE-SIZE',
                sizeName: 'FREE SIZE',
                id: 0
            });
        };
        $("#color-list").empty();
        $("#size-list").empty();
        var selectagColor = $("#color-list").select2({
            multiple: false,
            data: data_colors
        });
        var selectagSize = $("#size-list").select2({
            multiple: false,
            data: data_sizes
        });

    });
}