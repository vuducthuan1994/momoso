$(document).ready(function() {

    preLoadController();
    // $(window).resize(function () {
    //     if ($(window).width() <= 768) {
    //         cssHeader();
    //     }
    // });
    var tlmenu = new TimelineMax({ paused: true });
    tlmenu.to('.navMobie', 0.3, { autoAlpha: 1 }).staggerFromTo('.navMobie li', 0.5, { y: 100, opacity: 0 }, { y: 0, opacity: 1 }, 0.1);
    $('#hamburger').click(function() {
        $(this).toggleClass('active');
        if ($('html').hasClass('is-main-menu-open')) {
            $('html').removeClass('is-main-menu-open');
            tlmenu.reverse(0);
        } else {
            tlmenu.play(0);
            $('html').addClass('is-main-menu-open');
        }
    });
    $('.closeButton').click(function() {
        tlmenu.reverse(0);
        $('html').removeClass('is-main-menu-open');
    });
    $(".navMobie ul li").click(function() {
        $('html').removeClass('is-main-menu-open');
        $('#hamburger').toggleClass('active');
        tlmenu.reverse(0);
    });



    const isTablet = isTabletScreen();
    const isMobile = isMobileScreen();

    // SLider tin tức
    $('#owl-carousel-1').owlCarousel({
        lazyLoad: false,
        autoplay: false,
        loop: true,
        nav: false,
        center: false,
        navSpeed: 500,
        items: isMobile ? 1 : (isTablet ? 2 : 3),
        dots: isTablet ? true : false,
        margin: isMobile ? 32 : (isTablet ? 50 : 40),
        slideSpeed: 300,
        paginationSpeed: 400
    });
    // SLider text static
    $('#owl-carousel-2').owlCarousel({
        lazyLoad: false,
        autoplay: isTablet ? false : false,
        loop: true,
        nav: false,
        navSpeed: 500,
        items: 1,
        dots: false,
        margin: 40,
        slideSpeed: 300,
        paginationSpeed: 400,
    });

    $('#scroll_to_top').click(function(event) {
        event.preventDefault();
        $('html, body').animate({ scrollTop: 0 }, 700);
        return false;
    });
    // scrollEventListener();
    newsSliderController();
    textSliderController();
    // addAnimationWhenScroll();
    modalController();
    // cssHeader();
    ScrollListener();
    popupImage();
});
activeRoute();


function popupImage() {
    $('.inner-project-feed a').magnificPopup({
        type: 'image',
        closeOnContentClick: true,
        mainClass: 'mfp-no-margins mfp-with-zoom',
        image: {
            verticalFit: true
        },
        zoom: {
            enabled: true,

            duration: 400, // duration of the effect, in milliseconds
            easing: 'ease-in-out', // CSS transition easing function

            opener: function(openerElement) {

                return openerElement.is('img') ? openerElement : openerElement.find('img');
            }
        }

    });
}

function activeRoute() {
    $(document).ready(function() {
        $("header .nav li a").click(function(event) {
            $("header .nav li a").removeClass('active');
            $(this).addClass('active');
        });
    });
}

// function scrollEventListener() {
//     $(window).scroll(function(event) {
//         var scroll = $(window).scrollTop();
//         if (scroll == 0) {
//             $(".header-background-image a.company-logo").removeClass("outTop");
//             $(".fb-logo").removeClass("outRight");
//         } else if (scroll > 0) {
//             $(".header-background-image a.company-logo").addClass("outTop");
//             $(".fb-logo").addClass("outRight");
//         }
//     });
// }

function preLoadController() {
    var count = $('.count');
    $({ Counter: 0 }).animate({ Counter: count.text() }, {
        duration: 6500,
        step: function() {
            if (this.Counter >= 50) {
                setAnimationForSloganWhenFirstScroll();
                initAnimationForAllSection();
                $('html').removeClass('is-main-menu-open');

            }
            count.text(Math.ceil(this.Counter) + "%");
        },
        start: function() {
            $('html').addClass('is-main-menu-open');
        },
        complete: function() {
            $('#loader').css("display", "none");
        }
    });

}

function modalController() {
    $('.more-info-title').click(function() {
        $('html').addClass('is-main-menu-open');
        var postId = $(this).data("id");
        getDataArticle(postId);
    });
    $('.modal-wrapper .overlay').click(function() {
        $('.modal-wrapper ').toggleClass('open');
        $('.modal-wrapper .overlay').toggleClass('open');
        $('.modal-wrapper .modal').toggleClass('open');
        $('html').removeClass('is-main-menu-open');
    });
    $('.btn-close-modal').click(function() {
        $('.modal-wrapper ').toggleClass('open');
        $('.modal-wrapper .overlay').toggleClass('open');
        $('.modal-wrapper .modal').toggleClass('open');
        $('html').removeClass('is-main-menu-open');
    })
    $('.intro-post .inner-image-post-container').click(function() {
        $('html').addClass('is-main-menu-open');
        var postId = $(this).data("id");
        getDataArticle(postId);
    });

    return false;
}

function getDataArticle(id) {
    $.ajax({
        type: "GET",
        url: "/api/posts/" + id,
        dataType: "json",
        success: function(data) {
            const post = data.post;
            const created_date = data.created_date;
            $("#article-image").attr('src', post.banner_image);
            $("#article-public-date").text(created_date)
            $("#article-title").text(post.title)
            $("#article-content").html(post.body)
            $('.modal-wrapper ').toggleClass('open');
            $('.modal-wrapper .overlay').toggleClass('open');
            $('.modal-wrapper .modal').toggleClass('open');
        }
    });
}

function cssHeader() {
    if (window.matchMedia('screen and (max-width: 768px)').matches) {
        var heightHeader = $("header").height();
        $(".header-background-image").css("margin-top", -heightHeader);
    }
}

function initAnimationForAllSection() {
    AOS.init({
        disable: !window.matchMedia('screen and (min-width: 1200px)').matches,
        once: false,
        mirror: true,
        delay: 50,
        easing: 'ease-out-cubic',
        duration: 750
    });
}

function setAnimationForSloganWhenFirstScroll() {
    $(window).one("scroll", function() {
        $(".test").css("transform", "scaleY(1)");
    });
}

function ScrollListener() {
    $(window).scroll(function() {
        var scrollPosition = $(window).scrollTop();

        if (window.matchMedia('screen and (min-width: 900px)').matches) {
            var headerHeight = $(".header-background-image").height();
            if ((scrollPosition + 300) > headerHeight) {
                $('body header .menu-container').addClass('background-header-fixed-desktop');
                $('.company-logo img').addClass('scroll');
                $('.fb-logo img').addClass('scroll');
            } else {
                $('body header .menu-container').removeClass('background-header-fixed-desktop');
                $("header .nav li a").removeClass('active');


                $('.company-logo img').removeClass('scroll');
                $('.fb-logo img').removeClass('scroll');

            }
            // $('.menu-container .nav li a ').css('color', 'rgb(125, 115, 114)');
            // if (scrollPosition === 0) {
            //     $('.menu-container .nav li a ').css('color', 'rgb(244, 238, 231)');
            // } else {
            //     $('.menu-container .nav li a ').css('color', 'rgb(125, 115, 114)');
            // }
        } else if (window.matchMedia('screen and (max-width: 768px)').matches) {
            var menuHeight = $('body header .menu-container').outerHeight();
            if (scrollPosition > menuHeight) {
                $('body header .menu-container').addClass('background-header-fixed');
            } else if (!$('html').hasClass('is-main-menu-open')) {
                $('body header .menu-container').removeClass('background-header-fixed');
            }
        }
    });
}

// function addAnimationWhenScroll() {
//     var image = document.getElementsByClassName('img-header');
//     new simpleParallax(image, {
//         delay: 3,
//         scale: 1.1
//     });
// }

function newsSliderController() {
    var owl1 = $('#owl-carousel-1');
    // Go to the next item of slider news
    $('.am-next').click(function() {
        owl1.trigger('next.owl.carousel', [300]);
    });

    // Go to the previous news
    $('.am-prev').click(function() {
        // With optional speed parameter
        // Parameters has to be in square bracket '[]'
        owl1.trigger('prev.owl.carousel', [300]);
    });
}

function textSliderController() {
    var owl2 = $('#owl-carousel-2');
    // Go to the next item of slider text
    $('.btn-pre-next-slider').click(function() {
        owl2.trigger('next.owl.carousel', [300]);
    });

    // Go to the previous item of sliderText
    $('.btn-pre-slider').click(function() {
        // With optional speed parameter
        // Parameters has to be in square bracket '[]'
        owl2.trigger('prev.owl.carousel', [300]);
    });
}

function isTabletScreen() {
    if (window.matchMedia('screen and (max-width: 1024px)').matches) {
        return true;
    } else {
        return false;
    }
}

function isMobileScreen() {
    if (window.matchMedia('screen and (max-width: 500px)').matches) {
        return true;
    } else {
        return false;
    }
}