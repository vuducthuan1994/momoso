let sku_quick_view = null;

$(document).ready(function () {
    $('.show-quick-modal').on('click', function () {
        const productID = $(this).data('idproduct');
        getProductById(productID);
    });

    $('#quick-view-listColor').on('click', '.button-color', setActiveColor);
    $('#quick-view-listSize').on('click', '.button-size', setActiveSize);

});
function setActiveColor() {
    if (!$(this).hasClass('out_of_stock')) {
        $('#quick-view-listSize li').removeClass('out_of_stock');
        $('#quick-view-listSize li').removeClass('active');
        
        $('#quick-view-listColor li').removeClass('active');
        $(this).addClass('active');
        const idActive = $(this).find('a').attr('href');
        $(idActive).parent().find('div').removeClass('active in');
        $(idActive).addClass('active in');
        checkSizesStock();
    }
}

function checkSizesStock() {

    $('#quick-view-listSize li').each(function(i,obj){
     const sizeCode = $(this).data('code');
     const currentColorCode =$('#quick-view-listColor li.active').data('code');
      let check_product_size = checkSizeColorsOnSkus(sizeCode , currentColorCode);
      if(!check_product_size) { 
         $(this).addClass('out_of_stock');
      } 
 });
 }

 function checkSizeColorsOnSkus(size_code, color_code) {
    const productCode = $('#quick-view-add-to-cart').attr('data-code');
    let product_join_size_color = productCode + color_code + size_code;
    if(!sku_quick_view || sku_quick_view.length ==0){
        return false;
    } else {
        for (let index = 0; index < sku_quick_view.length; index++) {
            const skuItem = sku_quick_view[index];
            if(skuItem.sku.includes(product_join_size_color) && skuItem.count > 0) {
                return true;
            }  
        }
        return false;
    }

}

function setActiveSize() {
    if( !$(this).parent().hasClass('out_of_stock')) { 
        $('#quick-view-listSize li').removeClass('active');
        $(this).parent().addClass('active');
        const productCode = $('#quick-view-add-to-cart').attr('data-code');

        const currentColorCode =$('#quick-view-listColor li.active').data('code');
        const currentSizeCode =$('#quick-view-listSize li.active').data('code');

        const productCodeAfterJoin= `${productCode}${currentColorCode}${currentSizeCode}`;
        if(sku_quick_view && sku_quick_view.length > 0) {
            let newPrice = sku_quick_view.find(o => o.sku === productCodeAfterJoin).price;
            $('#modal-product-price').attr('data-price',newPrice);
            const price = newPrice.toLocaleString('it-IT', { style: 'currency', currency: 'VND' });
            $('#modal-product-price').text(price)
        }
    }
}

function getProductById(id) {

    $.ajax({
        url: `/api/product/${id}`,
        method: 'GET',
        cache: false,
        success: function (data) {

            if (data.success) {
                $('#quick-view-add-to-cart').attr('data-id', data.data._id);
                $('#quick-view-add-to-cart').attr('data-code', data.data.code);
                $('#quick-view-add-to-wishlish').attr('data-id', data.data._id);
                sku_quick_view = data.data.skus;

                ResetDataModalProduct();
                $('#modal-product-name').text(data.data.name);
                $('#modal-product-price').text(data.data.price);
                $('#modal-product-total-review').text(data.data.totalReview);
                $('#modal-product-price').attr('data-price', data.data.price);
                $('#modal-product-code').text(data.data.code);
                // $('#modal-product-point').text(data.data.point);
                $('#modal-product-status').text(data.data.quantity > 0 ? 'Sẵn hàng' : 'Hàng Order');
                let htmlOWL = '';
                data.data.listImages.forEach((imageURL, index) => {
                    imageURL = R_BASE_IMAGE_QUICK_VIEW + imageURL;
                    let imageItem = `<div id="thumb${index + 1}" class="tab-pane ${index == 0 ? 'fade in active' : 'fade'}">
                    <img src="${imageURL}" alt="product-thumbnail" /> </div>`

                    let owl_item = `<div  ${index == 0 ? 'class="active"' : ''}> <a data-toggle="tab" href="#thumb${index + 1}"> <img src="${imageURL}"
                    alt="product-thumbnail"></a> </div>`
                    $('#modal-product-images').append(imageItem);
                    htmlOWL += owl_item;
                });
                let listImageHTML = '';
                data.data.blocksColor.forEach((colorItem, index) => {
                    if (colorItem.listImages && colorItem.listImages.length > 0) {

                        const imageColorUrl = R_BASE_IMAGE_QUICK_VIEW + colorItem.listImages[0];
                        listImageHTML += ` <li data-code = "${colorItem.colorCode}" class = 'button-color'><a  data-toggle="tab" href="#thumb${data.data.listImages.length + index + 1}">  <img alt="product-thumbnail" src ="${imageColorUrl}"> </a></li>`



                        let imageItem = `<div id="thumb${data.data.listImages.length + index + 1}" class="tab-pane fade">
                        <img src="${imageColorUrl}" alt="product-thumbnail" /> </div>`
                        $('#modal-product-images').append(imageItem);
                    }
                });
                let listSizeHTML = '';
                data.data.blocksSize.forEach((sizeItem, index) => {
                    listSizeHTML += `<li class="out_of_stock" data-code = "${sizeItem.sizeCode}" >
                        <button class="btn button-size">${sizeItem.sizeName}</button>
                       </li>`

                });

                $('#quick-view-listColor ul').html(listImageHTML);
                $('#quick-view-listSize ul').html(listSizeHTML);
                $('#thumb-menu-owl').owlCarousel({
                    loop: false,
                    navText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"],
                    margin: 15,
                    smartSpeed: 1000,
                    nav: true,
                    dots: false,
                    responsive: {
                        0: {
                            items: 4
                        },
                        600: {
                            items: 4
                        },
                        1000: {
                            items: 4
                        }
                    }
                })

                $('#thumb-menu-owl').trigger('replace.owl.carousel', htmlOWL).trigger('refresh.owl.carousel');
                $('#myModal').modal('show');
                GetPriceVND();
                CheckColorsStock();

            } else {
                toast('Thông báo', 'Hệ thống đang gặp sự cố, vui lòng thử lại sau', 'info')
            }
        }
    });
}

function GetPriceVND() {
    $('.product-price-vnd').each(function (index, element) {
        var price = parseInt($(this).attr('data-price'));
        price = price.toLocaleString('it-IT', { style: 'currency', currency: 'VND' });
        $(this).text(price);
    });
}


function ResetDataModalProduct() {
    const myNode = document.getElementById("modal-product-images");
    myNode.textContent = '';
}

function CheckColorsStock() {

    $('#quick-view-listColor li').each(function (i, obj) {
        const colorCode = $(this).data('code');
        let check_product_color = CheckColorOnSkus(colorCode);
        if (!check_product_color) {
            $(this).addClass('out_of_stock');
            $(this).find('a').attr('href', '#');
            $(this).find('a').removeAttr('data-toggle');
        }
    });
}

function CheckColorOnSkus(color_code) {
    const productCode = $('#quick-view-add-to-cart').attr('data-code');
    let product_join_color = productCode + color_code;
    if (!sku_quick_view || sku_quick_view.length == 0) {
        return false;
    } else {
        for (let index = 0; index < sku_quick_view.length; index++) {
            const skuItem = sku_quick_view[index];
            if (skuItem.sku.includes(product_join_color) && skuItem.count > 0) {
                return true;
            }
        }
        return false;
    }
}