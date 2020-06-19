$(document).ready(function() {
    $('.container-list-color ul li').on('click', selectProductColor)


});

function selectProductColor() {

    $('.zoomContainer').remove();
    console.log('thun')
    $('.container-list-color ul li').removeClass('active');
    $(this).addClass('active');
    let listImages = $(this).data('owl');
    listImages = listImages.split(',');
    console.log(listImages);

    let htmlOWL = '';
    listImages.forEach((value, index) => {
        let owl_item = `<div  ${index == 0 ? 'class="active"' : ''}> <a  data-image="${value}" data-zoom-image="${value}" " > 
        <img src="${value}" alt="product-thumbnail"></a> </div>`
        htmlOWL += owl_item;
    });
    $('.thumb-menu').trigger('replace.owl.carousel', htmlOWL).trigger('refresh.owl.carousel');

    $('.main-product-thumbnail #big-img').attr('src', listImages[0]);
    $('.main-product-thumbnail #big-img').attr('data-zoom-image', listImages[0]);
    $("#big-img").elevateZoom({
        constrainType: "width",
        containLensZoom: true,
        gallery: 'small-img',
        cursor: 'pointer',
        galleryActiveClass: "active"
    });
}