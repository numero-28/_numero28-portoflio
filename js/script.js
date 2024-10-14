$(document).ready(function() {

    $('#bt1').click(function() {
        window.location.href = 'index.html';
    });
    $('#bt2').click(function() {
        window.location.href = 'yo.html';
    });
    $('#bt3').click(function() {
        window.location.href = 'dm.html';
    });
    $('#bt4').click(function() {
        window.location.href = 'stuff.html';
    });
   
    $('.logo img[data-project]').click(function(){
        var project = $(this).data('project');
        showProject(project);
    });

    
    // Evento scroll para ajustar la visibilidad del HomekeepScroll
    $("#gallery").on('scroll', function() {
        console.log("scroleo");
        
        if ($(this).scrollTop() > 30) {
            $('#HomekeepScroll').addClass('hidden');
        } else {
            $('#HomekeepScroll').removeClass('hidden');
        }

    });
    

    function showProject(project) {
        // Ocultamos el div "gallery"
        $('#gallery, #hovImg').hide();
        $('#HomekeepScroll').css('opacity', 0); // Garantiza que inicie visible


        // Variable para verificar si se encontró el proyecto
        var found = false;

        // Mostramos el .showProject correspondiente
        $('.showProject').each(function() {
            if ($(this).data('project') === project) {
                found = true;
                $('.bt').addClass('w');
                $(this).css('display', 'flex');
                $(this).css('background-color', 'black');
                $(this).show();
            } else {
                $(this).hide();
            }
        });

        // Mostrar u ocultar los botones de navegación
        if (found) {
            $('#prevProject, #nextProject').show();
            $('#keepScroll').show(); 
            window.scrollTo(0, 0);
            // $(window).on('scroll', function() {
            //     if ($(this).scrollTop() > 90) { // Ajusta el valor según lo necesario
            //         $('#prevProject, #nextProject').addClass('project-arrow');
            //     } else {
            //         $('#prevProject, #nextProject').removeClass('project-arrow');
            //     }
            // });
            
            $(window).on('scroll', function() {
    
                if ($(this).scrollTop() > 90) {
                    $('#prevProject, #nextProject').addClass('project-arrow');
                } else {
                    $('#prevProject, #nextProject').removeClass('project-arrow');
                }
        
                if ($(this).scrollTop() > 30) { 
                    $('#keepScroll').addClass('hidden');
                } else {
                    $('#keepScroll').removeClass('hidden');
                }
            });

        } else {
            $('#prevProject, #nextProject, #keepScroll').hide();
        }

    }

    var projects = $('.showProject').map(function() {
        return $(this).data('project');
    }).get();
    var currentIndex = 0;

    $('#prevProject').click(function() {
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : projects.length - 1;
        showProject(projects[currentIndex]);
    });

    $('#nextProject').click(function() {
        currentIndex = (currentIndex < projects.length - 1) ? currentIndex + 1 : 0;
        showProject(projects[currentIndex]);
    });

    $('#prevProject, #nextProject').hide();


    if ($(window).width() > 768) {
        $('.logo img').mouseover(function() {
            var index = $(this).closest('.project').index('.project');
            
            $('.bt').hide();

            $('.hovLogo').css('opacity', 0).css('transition', 'opacity 0.3s ease');
            $(this).closest('.project').find('.hovLogo').css('opacity', 1);

            $('#hovImg').css('opacity', 1).css('transition', 'opacity 0.3s ease');
            $('#hovImg img').eq(index).css('opacity', '1').css('transition', 'opacity 0.3s ease');
        });

        $('.logo img').mouseout(function() {
    
            $('.bt').show();
    
            $('.hovLogo').css('opacity', 0).css('transition', 'opacity 0.3s ease');
            $('#hovImg').css('opacity', 0).css('transition', 'opacity 0.3s ease');
            $('#hovImg img').css('opacity', 0).css('transition', 'opacity 0.3s ease');
        });
    }
    
    
    $(".indv-img").click(function(){
        var imagenSrc = $(this).attr("src");
        $("body").append("<div id='imagenGrandeDiv' style='position:fixed;top:0;left:0;height:100%;width:100%;background:rgba(10,10,10,0.9);display:flex;justify-content:center;align-items:center;cursor:pointer'><img src='"+imagenSrc+"' style='max-height:90%;max-width:90%;'/></div>");
        $("#imagenGrandeDiv").click(function(){
            $(this).remove();
        });
    });

    $(".full-img").click(function(){
        var imagenSrc = $(this).attr("src");
        var relatedImages = $(this).data("related").split(',');
        var carouselHtml = "<div id='carousel'><img class='carousel-image' src='" + imagenSrc + "' /><div class='carousel-arrow carousel-arrow-left'>(←)</div><div class='carousel-arrow carousel-arrow-right'>(→)</div></div>";
        
        $("body").append("<div id='imagenGrandeDiv' style='position:fixed;top:0;left:0;height:100%;width:100%;background:rgba(10,10,10,0.9);display:flex;justify-content:center;align-items:center;cursor:pointer;z-index:10'>" + carouselHtml + "</div>");
        
        var carouselIndex = 0;
        $('.carousel-arrow-right, .carousel-arrow-left').click(function(event) {
            event.stopPropagation();
            carouselIndex = (event.target.classList.contains('carousel-arrow-right') ? (carouselIndex + 1) : (carouselIndex + relatedImages.length - 1)) % relatedImages.length;
            $('.carousel-image').attr('src', relatedImages[carouselIndex]);
        });
    
        $(document).keydown(function(event) {
            if ($('#imagenGrandeDiv').length) {
                switch (event.which) {
                    case 37: // Left Arrow Key
                        carouselIndex = (carouselIndex + relatedImages.length - 1) % relatedImages.length;
                        break;
                    case 39: // Right Arrow Key
                        carouselIndex = (carouselIndex + 1) % relatedImages.length;
                        break;
                }
                $('.carousel-image').attr('src', relatedImages[carouselIndex]);
            }
        });
        
        $("#carousel").click(function(){
            $('#imagenGrandeDiv').remove();
        });
    
        $(".carousel-arrow").click(function(event){
            event.stopPropagation();
        });
    });

    function checkIfStuffPage() {
        return window.location.href.indexOf('stuff.html') !== -1;
    }

    function toggleClassForStuffPage() {
        if ($(window).width() < 768) { 
            if (checkIfStuffPage()) {
                $('.bt').addClass('w');
            } else {
                $('.bt').removeClass('w');
            }
        }
    }

    toggleClassForStuffPage();

    $(window).on('popstate', function() {
        toggleClassForStuffPage();
    });

    $(window).resize(function() {
        toggleClassForStuffPage();
    });
});
