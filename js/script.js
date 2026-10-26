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
   
    // HOME: clic en un logo de la grid abre su proyecto
    $('.project-logo').click(function(){
        var project = $(this).closest('.project').data('project');
        clearHomeHover();
        showProject(project);
    });

    
    // Evento scroll para ajustar la visibilidad del HomekeepScroll (solo móvil)
    $("#gallery").on('scroll', function() {
        console.log("scroleo");
        
        if ($(this).scrollTop() > 30) {
            $('#HomekeepScroll').addClass('hidden');
        } else {
            $('#HomekeepScroll').removeClass('hidden');
        }

    });
    

    // Efecto hover imágenes stuff
    $(".bt").on("mouseover", function () {
        $(".bt").addClass("big-hover");
    });

    $(".bt").on("mouseleave", function () {
        $(".bt").removeClass("big-hover");
    });

    // hover bt principales
    $(".stuff img").on("mouseover", function () {
        $(".stuff img").not(this).addClass("blurred");
        $(".text-thing").addClass("blurred");
    });

    $(".stuff img").on("mouseleave", function () {
        $(".stuff img").removeClass("blurred");
        $(".text-thing").removeClass("blurred");
    });


    // ---------- PROYECTOS ----------
    // Orden de navegación: el mismo que la grid de la home, en bucle
    var projects = $('.project').map(function() {
        return $(this).data('project');
    }).get();
    var currentIndex = 0;

    // Pone en una flecha (#prevProject o #nextProject) el logo del proyecto al que lleva.
    // El color (gris claro) y el tamaño vienen de styles.css
    function setNavLogo($nav, project) {
        var $logo = $('.project[data-project="' + project + '"] .project-logo');
        $nav.data('project', project);
        $nav.find('img').attr('src', $logo.attr('src'));
    }

    function showProject(project) {
        var $target = $('.showProject').filter(function() {
            return $(this).data('project') === project;
        });
        if (!$target.length) return;

        // Página en modo proyecto: fondo oscuro, botones en blanco y la caja del cursor pasa a claro
        $('body').addClass('in-project');
        $('.bt').addClass('w');
        $('#gallery').hide();
        $('#HomekeepScroll').css('opacity', 0);

        // Solo se ve el proyecto elegido (el fondo oscuro viene de .showProject en styles.css)
        $('.showProject').hide();
        $target.css('display', 'flex');

        // Logos de navegación: anterior a la izquierda, siguiente a la derecha
        currentIndex = projects.indexOf(project);
        var n = projects.length;
        setNavLogo($('#prevProject'), projects[(currentIndex - 1 + n) % n]);
        setNavLogo($('#nextProject'), projects[(currentIndex + 1) % n]);
        $('#prevProject, #nextProject').css('display', 'flex');
        $('#keepScroll').show();

        // Al saltar arriba, los logos de navegación se ocultan al instante (sin fundido),
        // para que no se vean desaparecer al entrar en el proyecto nuevo
        var $nav = $('#prevProject, #nextProject').addClass('instant');
        window.scrollTo(0, 0);
        updateProjectScroll();
        $nav[0].offsetHeight; // aplica el cambio ya, antes de recuperar la transición
        requestAnimationFrame(function() {
            $nav.removeClass('instant');
        });
    }

    // Al hacer scroll dentro de un proyecto: los logos de navegación aparecen pasados 90px
    // y el "(scroll down)" se oculta pasados 30px. Se define una sola vez.
    function updateProjectScroll() {
        if (!$('body').hasClass('in-project')) return;
        var top = $(window).scrollTop();
        $('#prevProject, #nextProject').toggleClass('project-arrow', top > 90);
        $('#keepScroll').toggleClass('hidden', top > 30);
    }
    $(window).on('scroll', updateProjectScroll);

    $('#prevProject, #nextProject').click(function() {
        showProject($(this).data('project'));
    });

    // Mide la proporción (alto / ancho) de todos los logos y guarda la mayor en --navRatio,
    // para que las cajas de navegación tengan la altura del logo más alto
    (function measureNavRatio() {
        var srcs = $('.project-logo').map(function() { return $(this).attr('src'); }).get();
        if (!srcs.length) return;
        var maxRatio = 0, pending = srcs.length;
        var $tmp = $('<div>').css({ position: 'absolute', left: '-9999px', top: 0, visibility: 'hidden' }).appendTo('body');
        srcs.forEach(function(src) {
            var img = new Image();
            img.style.width = '100px';
            img.style.height = 'auto';
            img.onload = img.onerror = function() {
                var h = img.getBoundingClientRect().height;
                if (h > 0) maxRatio = Math.max(maxRatio, h / 100);
                if (--pending === 0) {
                    if (maxRatio > 0) document.documentElement.style.setProperty('--navRatio', maxRatio);
                    $tmp.remove();
                }
            };
            $tmp.append(img);
            img.src = src;
        });
    })();


    // HOME: hover sobre los logos (solo escritorio)
    // Al entrar en un logo desaparecen todos y se ven la portada, el logo en color en el centro
    // y los textos de ese proyecto
    function clearHomeHover() {
        $('.bt').show();
        $('#gallery').removeClass('hovering');
        $('.project').removeClass('active');
        $('#hoverLogo').removeClass('visible');
        $('#cursor').removeClass('show-text');
    }

    if ($(window).width() > 768) {
        $('.project-logo').on('mouseenter', function() {
            $('.bt').hide();
            $('#gallery').addClass('hovering');
            $(this).closest('.project').addClass('active');
            $('#hoverLogo').attr('src', $(this).attr('src')).addClass('visible');
            $('#cursor').addClass('show-text');
        });

        $('.project-logo').on('mouseleave', function() {
            clearHomeHover();
        });
    }

    // ---------- CURSOR PROPIO (todas las páginas que tengan #cursor) ----------
    // Sustituye al del sistema. Solo en escritorio y con ratón (no en móvil ni pantallas táctiles).
    var cursor = document.getElementById('cursor');
    var hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (cursor && hasMouse && $(window).width() > 768) {
        $('body').addClass('custom-cursor');

        $(document).on('mousemove', function(e) {
            cursor.style.transform = 'translate(' + e.clientX + 'px, ' + e.clientY + 'px)';
            cursor.classList.add('active');
        });

        // Sobre lo que se puede clicar, la caja se rellena.
        // Para que otro elemento lo active, añádelo a esta lista (o ponle la clase .clickable)
        var CLICKABLE = 'a, .bt, #prevProject, #nextProject, .carousel-arrow, .clickable';
        // Sobre las cajas de navegación (rellenas de claro) el cursor pasa a oscuro
        var LIGHT = '#prevProject, #nextProject';
        $(document).on('mouseover', function(e) {
            cursor.classList.toggle('on-clickable', !!e.target.closest(CLICKABLE));
            cursor.classList.toggle('on-light', !!e.target.closest(LIGHT));
        });

        // Al salir de la ventana se desvanece, y vuelve al entrar
        $(document).on('mouseleave', function() {
            cursor.classList.remove('active');
        });

        // STUFF: sobre una foto, la caja se encoge y aparece el texto ("click"), igual que el "see more" de la home
        $('.stuff .full-img').on('mouseenter', function() {
            cursor.classList.add('show-text');
        }).on('mouseleave', function() {
            cursor.classList.remove('show-text');
        });
    }
    
    $(".full-img").click(function () {
        var imagenSrc = $(this).attr("src");
        var relatedMedia = $(this).data("related").split(',');
    
        var carouselIndex = 0;
    
        function getMediaHtml(src) {
            var isVideo = src.endsWith('.mp4');
            if (isVideo) {
                return `<video class='carousel-media' controls autoplay>
                            <source src='${src}' type='video/mp4'>
                            Tu navegador no soporta videos.
                        </video>`;
            } else {
                return `<img class='carousel-media' src='${src}' />`;
            }
        }
    
        function getKeyword(src) {
            return src.split('/')[2]; // Extraer palabra clave del src
        }    
        var carouselHtml = `
            <div id='carousel'>
                ${getMediaHtml(imagenSrc)}
                <div class='carousel-arrow carousel-arrow-left'>(←)</div>
                <div class='carousel-arrow carousel-arrow-right'>(→)</div>
                <div class='carousel-title'>${getKeyword(imagenSrc)}</div>
            </div>
        `;
    
        // Visor abierto: fondo oscuro, así que la caja del cursor pasa a clara
        $('body').addClass('viewer-open');
        $('#cursor').removeClass('show-text');

        $("body").append(`
            <div id='imagenGrandeDiv' style='position:fixed;top:0;left:0;height:100%;width:100%;background:rgba(25,25,30,0.99);display:flex;justify-content:center;align-items:center;cursor:pointer;z-index:10'>
                ${carouselHtml}
            </div>
        `);
    
        $('.carousel-arrow-right, .carousel-arrow-left').click(function (event) {
            event.stopPropagation();
            carouselIndex = (event.target.classList.contains('carousel-arrow-right') ?
                (carouselIndex + 1) : (carouselIndex + relatedMedia.length - 1)) % relatedMedia.length;
    
            var newSrc = relatedMedia[carouselIndex];
            $('.carousel-media').replaceWith(getMediaHtml(newSrc));
            $('.carousel-title').text(getKeyword(newSrc));
        });
    
        // Teclado del visor. Va con nombre propio (.visor) para poder quitarlo:
        // .off() elimina el de la imagen anterior, si quedara alguno, y .on() añade el nuevo.
        // Así nunca hay más de uno activo.
        $(document).off('keydown.visor').on('keydown.visor', function (event) {
            if ($('#imagenGrandeDiv').length) {
                switch (event.which) {
                    case 37: // Left Arrow Key
                        carouselIndex = (carouselIndex + relatedMedia.length - 1) % relatedMedia.length;
                        break;
                    case 39: // Right Arrow Key
                        carouselIndex = (carouselIndex + 1) % relatedMedia.length;
                        break;
                    default:
                        return; // Cualquier otra tecla no hace nada
                }
                var newSrc = relatedMedia[carouselIndex];
                $('.carousel-media').replaceWith(getMediaHtml(newSrc));
                $('.carousel-title').text(getKeyword(newSrc));
            }
        });

        $("#imagenGrandeDiv").click(function (event) {
            if (!$(event.target).closest("video").length) {
                $('#imagenGrandeDiv').remove();
                $(document).off('keydown.visor'); // Al cerrar el visor se quita el teclado
                $('body').removeClass('viewer-open');
            }
        });
    
        $(".carousel-arrow").click(function (event) {
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