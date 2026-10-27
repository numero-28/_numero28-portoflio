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
   
    // HOME: clic (o toque en móvil) en la caja de un proyecto lo abre.
    // No se abre si el toque viene de los cuadraditos o si la home se está desplazando
    var ignoreProjectTapUntil = 0;
    $('.project').click(function(){
        if (Date.now() < ignoreProjectTapUntil) return;
        if ($('body').hasClass('in-project')) return;
        openProject($(this).data('project'));
    });

    // ---------- HOME EN MÓVIL: cuadraditos de navegación ----------
    // Un cuadradito por proyecto (se generan solos). Un toque lleva a ese proyecto con desplazamiento suave;
    // manteniendo pulsado y arrastrando sobre ellos se pasa de caja en caja al momento
    (function projectDots() {
        var gallery = document.getElementById('gallery');
        var dotsBox = document.getElementById('projectDots');
        if (!gallery || !dotsBox) return;
        var boxes = Array.prototype.slice.call(gallery.querySelectorAll('.project'));
        boxes.forEach(function() {
            var d = document.createElement('div');
            d.className = 'dot';
            dotsBox.appendChild(d);
        });
        var dots = Array.prototype.slice.call(dotsBox.children);

        function goTo(i, smooth) {
            boxes[i].scrollIntoView({ block: 'center', behavior: smooth ? 'smooth' : 'auto' });
            setActive(i);
        }
        function setActive(i) {
            dots.forEach(function(d, k) { d.classList.toggle('active', k === i); });
        }
        // Caja más cercana al centro de la pantalla
        function currentIndex() {
            var mid = gallery.getBoundingClientRect().top + gallery.clientHeight / 2, best = 0, bestDist = Infinity;
            boxes.forEach(function(b, k) {
                var r = b.getBoundingClientRect(), dist = Math.abs(r.top + r.height / 2 - mid);
                if (dist < bestDist) { bestDist = dist; best = k; }
            });
            return best;
        }
        // Cuadradito más cercano al dedo (en vertical)
        function dotAt(y) {
            var best = 0, bestDist = Infinity;
            dots.forEach(function(d, k) {
                var r = d.getBoundingClientRect(), dist = Math.abs(r.top + r.height / 2 - y);
                if (dist < bestDist) { bestDist = dist; best = k; }
            });
            return best;
        }

        var ticking = false, dragging = false;
        // Bloquea los toques en las cajas durante un instante tras tocar los cuadraditos
        // y mientras la home se desplaza (incluido el desplazamiento suave hasta el proyecto elegido)
        function blockProjectTaps(ms) {
            ignoreProjectTapUntil = Math.max(ignoreProjectTapUntil, Date.now() + ms);
        }
        gallery.addEventListener('scroll', function() { blockProjectTaps(150); }, { passive: true });
        // Los toques sobre los cuadraditos no llegan nunca a la caja de debajo
        dotsBox.addEventListener('click', function(e) { e.stopPropagation(); e.preventDefault(); });
        gallery.addEventListener('scroll', function() {
            if (dragging || ticking) return;
            ticking = true;
            requestAnimationFrame(function() { setActive(currentIndex()); ticking = false; });
        });
        setActive(0);

        var startY = 0, moved = false, lastIdx = -1;
        dotsBox.addEventListener('pointerdown', function(e) {
            blockProjectTaps(700);
            dotsBox.setPointerCapture(e.pointerId);
            dragging = true; moved = false; startY = e.clientY; lastIdx = -1;
        });
        dotsBox.addEventListener('pointermove', function(e) {
            if (!dragging) return;
            if (!moved && Math.abs(e.clientY - startY) < 4) return;
            moved = true;
            var i = dotAt(e.clientY);
            if (i !== lastIdx) { lastIdx = i; goTo(i, false); }   // arrastrando: salta al momento
        });
        function endDrag(e) {
            blockProjectTaps(700);
            if (!dragging) return;
            dragging = false;
            if (!moved) goTo(dotAt(e.clientY), true);          // toque: desplazamiento suave
        }
        dotsBox.addEventListener('pointerup', endDrag);
        dotsBox.addEventListener('pointercancel', function() { dragging = false; });
    })();

    
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

    var $overlay = $('#projectOverlay');
    var FADE_MS = 400;   // tiempo para que se desvanezca la portada y se vea un instante el index (0.3s de fundido + pausa)
    var SLIDE_MS = 600;  // lo que tarda la tarjeta en subir (igual que la transición de #projectOverlay en styles.css)
    var SWITCH_MS = 400; // fundido al cambiar de proyecto (igual que la transición de #projectCard .showProject en styles.css)
    var CLOSE_MS = 400;  // lo que tarda la tarjeta en disolverse al pulsar GO BACK (igual que #projectOverlay.closing)
    var switching = false;

    // Cambio de proyecto desde los logos de navegación, con fundido:
    // se desvanece el contenido actual y los logos, la tarjeta vuelve arriba sin que se vea
    // el salto, se cambia el contenido y aparece el nuevo
    function switchProject(project) {
        if (switching) return;
        switching = true;
        var $card = $('#projectCard');
        $card.addClass('fading');
        $('#prevProject, #nextProject').removeClass('project-arrow');  // se ocultan con su propio fundido
        $('#keepScroll').addClass('hidden');

        setTimeout(function() {
            showProject(project);              // con el contenido invisible: vuelve arriba y cambia el proyecto
            $card[0].offsetHeight;             // aplica el cambio antes de empezar a aparecer
            $card.removeClass('fading');
            setTimeout(function() { switching = false; }, SWITCH_MS);
        }, SWITCH_MS);
    }

    // Abre la tarjeta desde la home: se desvanece la portada, se ve un instante el index
    // y la tarjeta sube desde el borde inferior
    function openProject(project) {
        var isDesktop = $(window).width() > 768;
        $('body').addClass('in-project');
        $('#HomekeepScroll').css('opacity', 0);
        clearHomeHover();

        showProject(project);                     // prepara el contenido mientras la tarjeta está fuera de la pantalla
        $('#keepScroll').addClass('hidden');      // el "(scroll down)" aparece cuando la tarjeta ha llegado

        setTimeout(function() {
            $overlay.addClass('open');
            $('body').addClass('index-hidden');      // el index se desvanece mientras sube la tarjeta
            setTimeout(function() {
                updateProjectScroll();
                refreshCursorTone();
                $('#goBack').addClass('visible');   // aparece cuando la tarjeta ha llegado
            }, SLIDE_MS);
        }, isDesktop ? FADE_MS : 0);
    }

    // GO BACK: la tarjeta se disuelve y vuelve el index tal cual estaba
    function closeProject() {
        if (!$('body').hasClass('in-project') || $overlay.hasClass('closing')) return;
        $('#goBack').removeClass('visible');
        $('#prevProject, #nextProject').removeClass('project-arrow');
        $('#keepScroll').addClass('hidden');
        $overlay.addClass('closing');
        $('body').removeClass('index-hidden');       // el index vuelve mientras la tarjeta se disuelve

        setTimeout(function() {
            // Devuelve la tarjeta abajo, sin transición (ya es invisible), lista para la próxima vez
            $overlay.addClass('reset').removeClass('open closing');
            $overlay[0].offsetHeight;
            $overlay.removeClass('reset').scrollTop(0);

            $('body').removeClass('in-project');
            $('.bt').removeClass('w');
            $('.showProject').hide();
            $('#prevProject, #nextProject, #keepScroll').hide();
            $('#HomekeepScroll').css('opacity', '');
            $('#goBack').removeClass('pressed');
            refreshCursorTone();
        }, CLOSE_MS);
    }

    // GO BACK: en escritorio cierra al momento; en móvil primero se ve el relleno claro de la pulsación
    var PRESS_MS = 200;  // lo que se ve el relleno antes de que la tarjeta empiece a disolverse
    function isMobile() { return $(window).width() <= 768; }
    $('#goBack')
        .on('pointerdown', function() { if (isMobile()) $(this).addClass('pressed'); })
        .on('pointercancel', function() {           // p. ej. si el dedo se convierte en scroll
            if ($('#projectOverlay').hasClass('closing')) return;
            $(this).removeClass('pressed');
        })
        .on('click', function() {
            if (!isMobile()) { closeProject(); return; }
            $(this).addClass('pressed');
            setTimeout(closeProject, PRESS_MS);
        });

    // Cambia el contenido de la tarjeta (también desde los logos de navegación) sin cerrarla
    function showProject(project) {
        var $target = $('.showProject').filter(function() {
            return $(this).data('project') === project;
        });
        if (!$target.length) return;

        // Solo se ve el proyecto elegido
        $('.showProject').hide();
        $target.css('display', 'flex');

        // Logos de navegación: anterior a la izquierda, siguiente a la derecha
        currentIndex = projects.indexOf(project);
        var n = projects.length;
        setNavLogo($('#prevProject'), projects[(currentIndex - 1 + n) % n]);
        setNavLogo($('#nextProject'), projects[(currentIndex + 1) % n]);
        $('#prevProject, #nextProject').css('display', 'flex');
        $('#keepScroll').show();

        // Al volver arriba, los logos de navegación se ocultan al instante (sin fundido),
        // para que no se vean desaparecer al entrar en el proyecto nuevo
        var $nav = $('#prevProject, #nextProject').addClass('instant');
        $overlay.scrollTop(0);
        updateProjectScroll();
        $nav[0].offsetHeight; // aplica el cambio ya, antes de recuperar la transición
        requestAnimationFrame(function() {
            $nav.removeClass('instant');
        });
    }

    // Al hacer scroll dentro de la tarjeta: los logos de navegación aparecen pasados 90px
    // y el "(scroll down)" se oculta pasados 30px. Se define una sola vez.
    function updateProjectScroll() {
        if (!$('body').hasClass('in-project')) return;
        var top = $overlay.scrollTop();
        $('#prevProject, #nextProject').toggleClass('project-arrow', top > 90);
        $('#keepScroll').toggleClass('hidden', top > 30);
    }
    $overlay.on('scroll', updateProjectScroll);

    $('#prevProject, #nextProject').click(function() {
        switchProject($(this).data('project'));
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


    // HOME: hover sobre las cajas (solo escritorio)
    // Al entrar en una caja desaparecen todos los logos y los contornos de las demás cajas,
    // y se ven la portada, el logo en color en el centro y los textos de ese proyecto
    function clearHomeHover() {
        $('.bt').show();
        $('#gallery').removeClass('hovering');
        $('.project').removeClass('active');
        $('#hoverLogo').removeClass('visible');
        $('#cursor').removeClass('show-text');
    }

    if ($(window).width() > 768) {
        $('.project').on('mouseenter', function() {
            if ($('body').hasClass('in-project')) return;   // con la tarjeta abierta no hay hover en la home
            $('.bt').hide();
            $('#gallery').addClass('hovering');
            $(this).addClass('active');
            $('#hoverLogo').attr('src', $(this).find('.project-logo').attr('src')).addClass('visible');
            $('#cursor').addClass('show-text');
        });

        $('.project').on('mouseleave', function() {
            clearHomeHover();
        });
    }

    // ---------- CURSOR PROPIO (todas las páginas que tengan #cursor) ----------
    // Sustituye al del sistema. Solo en escritorio y con ratón (no en móvil ni pantallas táctiles).
    var cursor = document.getElementById('cursor');
    var hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var lastX = -1, lastY = -1;

    // Sobre la tarjeta de proyecto (fondo oscuro) la caja pasa a clara; fuera de ella, oscura
    function setCursorTone(target) {
        if (!cursor || !target) return;
        cursor.classList.toggle('on-dark', !!target.closest('#projectCard, #goBack'));
    }
    // Recalcula el tono sin mover el ratón (p. ej. cuando la tarjeta sube por debajo del cursor)
    function refreshCursorTone() {
        if (lastX < 0) return;
        setCursorTone(document.elementFromPoint(lastX, lastY));
    }

    if (cursor && hasMouse && $(window).width() > 768) {
        $('body').addClass('custom-cursor');

        $(document).on('mousemove', function(e) {
            lastX = e.clientX; lastY = e.clientY;
            cursor.style.transform = 'translate(' + e.clientX + 'px, ' + e.clientY + 'px)';
            cursor.classList.add('active');
            setCursorTone(e.target);
        });

        // Sobre lo que se puede clicar, la caja se rellena.
        // Para que otro elemento lo active, añádelo a esta lista (o ponle la clase .clickable)
        var CLICKABLE = 'a, .bt, #prevProject, #nextProject, #goBack, .carousel-arrow, .clickable';
        // Sobre las cajas de navegación (rellenas de claro) el cursor pasa a oscuro
        var LIGHT = '#prevProject, #nextProject';
        $(document).on('mouseover', function(e) {
            cursor.classList.toggle('on-clickable', !!e.target.closest(CLICKABLE));
            cursor.classList.toggle('on-light', !!e.target.closest(LIGHT));
        });

        // Al hacer clic en cualquier sitio, la caja se rellena del color que tenga en ese momento.
        // Aunque el clic sea rápido, el relleno se completa (0.3s, como la transición) antes de vaciarse
        var FILL_MS = 200, pressStart = 0, pressTimer = null;
        $(document).on('mousedown', function() {
            clearTimeout(pressTimer);
            pressStart = Date.now();
            cursor.classList.add('pressed');
        });
        $(document).on('mouseup', function() {
            var wait = Math.max(0, FILL_MS - (Date.now() - pressStart));
            pressTimer = setTimeout(function() {
                cursor.classList.remove('pressed');
            }, wait);
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