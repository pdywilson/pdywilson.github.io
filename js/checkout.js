document.addEventListener('DOMContentLoaded', async () => {
    const checkinTime = document.getElementById('checkin-time');
    const checkinButton = document.getElementById('checkin-button');
    const checkoutTime = document.getElementById('checkout-time');
    const checkoutButton = document.getElementById('checkout-button');
    const pauseTime = document.getElementById('pause-time');
    const pauseEndTime = document.getElementById('pause-end-time');
    const pauseLength = document.getElementById('pause-length');
    const extraPauseTime = document.getElementById('extra-pause-time');
    const extraPauseEndTime = document.getElementById('extra-pause-end-time');
    const checkbox = document.getElementById('toggle-pause');
    const pauseContainer = document.getElementById('pause-container');
    const pauseInput = document.getElementById('pause-length');
    // 7h 48 work time + 30 min pause
    const workTime = 7 * 60 + 48;
    const lunchTime = 6 * 60;
    const dinnerTime = 9 * 60;
    const dinnerEndTime = 9 * 60 + 15;

    checkinButton.addEventListener('click', async () => {
        updateCheckin();
    });

    checkinTime.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter')
            updateCheckin();
    });

    function updateCheckin() {
        lunch = getLunch();
        const inTime = checkinTime.value;
        localStorage.setItem('checkin_time', inTime);
        pauseTime.value = updateTime(inTime, lunchTime, 0);
        checkoutTime.value = updateTime(inTime, workTime, lunch);
        pauseEndTime.value = updateTime(inTime, lunchTime, lunch);
        extraPauseTime.value = updateTime(inTime, dinnerTime, lunch);
        extraPauseEndTime.value = updateTime(inTime, dinnerEndTime, lunch);
    };

    checkoutButton.addEventListener('click', async () => {
        const outTime = checkoutTime.value;
        localStorage.setItem('checkout_time', outTime);
        lunch = getLunch();
        checkinTime.value = updateTime(outTime, -workTime, -lunch);
        updateCheckin();
    });

    function getLunch() {
        return (pauseLength.value === "" || pauseLength.value === undefined) ? 30 : parseInt(pauseLength.value);
    };

    function updateTime(time, minutes, lunch) {
        const date = new Date();
        date.setHours(time.substr(0, 2));
        date.setMinutes(time.substr(3, 5));
        return format(new Date(date.getTime() + minutes * 60000 + lunch * 60000));
    };

    function format(date) {
        let h = date.getHours().toString();
        if (h.length == 1) {
            h = '0' + h;
        }
        let m = date.getMinutes().toString();
        if (m.length == 1) {
            m = '0' + m;
        }
        return h + ":" + m;
    }

    Date.prototype.addHours = function (h) {
        this.setTime(this.getTime() + (h * 60 * 60 * 1000));
        return this;
    }

    checkbox.addEventListener('change', function() {
      if (this.checked) {
        pauseContainer.style.display = 'block';
        pauseInput.disabled = false;
      } else {
        pauseContainer.style.display = 'none';
        pauseInput.disabled = true;
        pauseInput.value = "30";
      }
    });


    // Random background img
    const cat_num = Math.floor(Math.random() * 4) + 1;
    document.body.classList.add('random-bg', `bg-${cat_num}`);

    let month = new Date().getMonth() + 1;
    try {
        month = Temporal.Now.plainDateISO().month;
    } catch (e) {}
    // Frühling - Kirschblüte
    const spring_on = [3, 4, 5].includes(month);
    // Herbst
    const fall_on = [9, 10, 11].includes(month);
    // Winter - Dezember bis Februar
    const snow_on = [12, 1, 2].includes(month);

    // Leaf particle shape.
    //
    // particles.js 2.0.0 picks the loader purely from the last three characters
    // of the src: "svg" routes through XMLHttpRequest (blocked by the browser on
    // file://, which is what made this effect silently fail), anything else uses
    // a plain Image(). An SVG source always ends with "</svg>", so an encoded
    // data URI always ends with "%3E" - never "svg" - so this always takes the
    // Image() path. No XHR, no Blob, no file:// block, and it also skips the
    // count_svg >= number.value wait that could deadlock the draw loop and leave
    // the canvas stuck on its black fill. See debug.txt.
    const leaf_svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <path d="M16 2 C 9 6, 5 13, 7 20 C 8.6 25.5, 13 29.5, 16 29.5 C 19 29.5, 23.4 25.5, 25 20 C 27 13, 23 6, 16 2 Z"
        fill="#e07b2a" stroke="#a9531a" stroke-width="0.8" stroke-linejoin="round" />
  <g stroke="#a9531a" stroke-width="0.7" stroke-linecap="round" fill="none">
    <path d="M16 5 L16 29" />
    <path d="M16 8 L10.5 12" />
    <path d="M16 8 L21.5 12" />
    <path d="M16 13 L9.5 18" />
    <path d="M16 13 L22.5 18" />
    <path d="M16 18 L11.5 23" />
    <path d="M16 18 L20.5 23" />
  </g>
  <path d="M16 29.5 L16 31" stroke="#8a5a2b" stroke-width="1" stroke-linecap="round" />
</svg>`;
    const leaf_image = 'data:image/svg+xml,' + encodeURIComponent(leaf_svg);

    // Cherry blossom particle shape. Same data URI trick as the leaf - see the
    // comment above, an encoded SVG always ends with "%3E" so particles.js takes
    // the plain Image() path and never goes through XMLHttpRequest.
    // Five notched petals plus stamens.
    const cherry_svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <g fill="#ffc0cb" stroke="#ef7fa5" stroke-width="0.45">
    <path d="M16 17 C 9.5 14, 7 8.5, 12.5 4.5 L 16 6.5 L 19.5 4.5 C 25 8.5, 22.5 14, 16 17 Z" />
    <path d="M16 17 C 9.5 14, 7 8.5, 12.5 4.5 L 16 6.5 L 19.5 4.5 C 25 8.5, 22.5 14, 16 17 Z" transform="rotate(72 16 16)" />
    <path d="M16 17 C 9.5 14, 7 8.5, 12.5 4.5 L 16 6.5 L 19.5 4.5 C 25 8.5, 22.5 14, 16 17 Z" transform="rotate(144 16 16)" />
    <path d="M16 17 C 9.5 14, 7 8.5, 12.5 4.5 L 16 6.5 L 19.5 4.5 C 25 8.5, 22.5 14, 16 17 Z" transform="rotate(216 16 16)" />
    <path d="M16 17 C 9.5 14, 7 8.5, 12.5 4.5 L 16 6.5 L 19.5 4.5 C 25 8.5, 22.5 14, 16 17 Z" transform="rotate(288 16 16)" />
  </g>
  <g stroke="#d94f7a" stroke-width="0.6" stroke-linecap="round">
    <path d="M16 16 L16 11" />
    <path d="M16 16 L19.5 12" />
    <path d="M16 16 L12.5 12" />
  </g>
  <circle cx="16" cy="16" r="1.5" fill="#ffe066" />
</svg>`;
    const cherry_image = 'data:image/svg+xml,' + encodeURIComponent(cherry_svg);

    // particles.js sources, tried in order. The vendored copy is the primary one
    // so a CDN outage, an offline visit or a privacy extension blocking
    // third-party domains cannot take the effect down; the CDN stays as a
    // fallback. The vendored copy deliberately lives in js/vendor/ rather than
    // vendor/, because the gulp clean() task deletes ./vendor/ wholesale.
    //
    // The fallback carries an SRI hash so a tampered copy is refused instead of
    // executed. Regenerate with:
    //   openssl dgst -sha384 -binary js/vendor/particles.min.js | openssl base64 -A
    const PARTICLES_SOURCES = [
        'js/vendor/particles.min.js',
        {
            src: 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js',
            integrity: 'sha384-d+UOwmNNIC7V4izkTAKSXzWhjC2GxiS9PTykO1XdOPC3nc2z65UOS7SP6QdKPA70',
            crossorigin: 'anonymous'
        }
    ];

    function loadParticles(remaining) {
        const source = remaining.shift();
        if (!source) {
            console.warn('[checkout] particles.js could not be loaded, skipping the seasonal effect.');
            return;
        }
        const script = document.createElement('script');
        const url = typeof source === 'string' ? source : source.src;
        script.src = url;
        if (typeof source !== 'string') {
            script.integrity = source.integrity;
            script.crossOrigin = source.crossorigin;
        }
        script.onload = startEffects;
        script.onerror = () => {
            script.remove();
            loadParticles(remaining);
        };
        document.head.append(script);
    }

    // Turn each particle into a pendulum.
    //
    // particles.js 2.0.0 has no rotation support at all - no "tilt", no
    // ctx.rotate, no transform anywhere in the source - so the swing has to be
    // added by wrapping Particle.prototype.draw. maxDegrees is the peak swing,
    // so leaves get a firm 40 and the lighter petals a gentler 25.
    //
    // That reaches into undocumented internals, so verify all of them up front
    // and give up cleanly if any is missing. Degrading to particles that fall
    // without swinging is a far better failure mode than throwing inside the
    // requestAnimationFrame loop, which would kill the draw loop and leave the
    // canvas stuck on canvasPaint's default black fillRect.
    function addSwing(maxDegrees) {
        // particlesJS() returns nothing; the instance only lands in the global
        // pJSDom registry, so this always targets the most recent instance.
        const instance = window.pJSDom && window.pJSDom[window.pJSDom.length - 1];
        const pjs = instance && instance.pJS;
        const proto = pjs && pjs.fn && pjs.fn.particle && pjs.fn.particle.prototype;

        if (!proto || typeof proto.draw !== 'function') {
            console.warn('[checkout] particles.js internals changed; the particles will fall without swinging.');
            return;
        }

        const drawLeaf = proto.draw;
        const SWING_MAX = maxDegrees * Math.PI / 180;
        const started = performance.now();

        proto.draw = function () {
            const leaf = this;
            // canvas.ctx only exists once init() has run, which happens
            // asynchronously after the leaf image has loaded.
            const ctx = pjs.canvas.ctx;

            // Cheap sanity check: if the coordinate fields ever move or the
            // context is missing, fall through to an unrotated draw instead of
            // throwing and taking the whole animation down.
            if (!ctx || typeof leaf.x !== 'number' || typeof leaf.y !== 'number') {
                return drawLeaf.call(leaf);
            }

            // Particles are created lazily and re-pushed whenever the density is
            // recalculated, so seed each leaf the first time it is drawn rather
            // than up front.
            if (leaf.swing_phase === undefined) {
                leaf.swing_phase = Math.random() * Math.PI * 2;
                leaf.swing_speed = 0.5 + Math.random() * 0.7;
                leaf.swing_arc = SWING_MAX * (0.8 + Math.random() * 0.2);
            }

            // A pure sine gives smooth pendulum motion rather than a mechanical
            // tick. Rotating about the leaf's own centre tilts the leaf left and
            // right instead of making it orbit that centre.
            const angle = Math.sin((performance.now() - started) / 1000
                * leaf.swing_speed + leaf.swing_phase) * leaf.swing_arc;

            ctx.save();
            ctx.translate(leaf.x, leaf.y);
            ctx.rotate(angle);
            ctx.translate(-leaf.x, -leaf.y);
            drawLeaf.call(leaf);
            ctx.restore();
        };
    }

    function startEffects() {
        if (snow_on) {
            particlesJS("snow", {
                "particles": {
                    "number": {
                        "value": 200,
                        "density": {
                            "enable": true,
                            "value_area": 800
                        }
                    },
                    "color": {
                        // spring
                        // "value": "#FFC0CB"
                        // winter
                        "value": "#ffffff"
                    },
                    "opacity": {
                        "value": 0.7,
                        "random": false,
                        "anim": {
                            "enable": false
                        }
                    },
                    "size": {
                        "value": 3,
                        "random": true,
                        "anim": {
                            "enable": false
                        }
                    },
                    "line_linked": {
                        "enable": false
                    },
                    "move": {
                        "enable": true,
                        "speed": 3,
                        "direction": "bottom",
                        "random": true,
                        "straight": false,
                        "out_mode": "out",
                        "bounce": false,
                        "attract": {
                            "enable": true,
                            "rotateX": 300,
                            "rotateY": 1200
                        }
                    }
                },
                "interactivity": {
                    "events": {
                        "onhover": {
                            "enable": false
                        },
                        "onclick": {
                            "enable": false
                        },
                        "resize": false
                    }
                },
                "retina_detect": true
            });
        }

        if (fall_on) {
            particlesJS("fall", {
                "particles": {
                    "number": {
                        "value": 50,
                        "density": {
                            "enable": true,
                            "value_area": 900
                        }
                    },
                    "color": {
                        "value": "#e07b2a"
                    },
                    "opacity": {
                        "value": 0.9,
                        "random": true,
                        "anim": {
                            "enable": false
                        }
                    },
                    // particles.js 2.x flattens the shape options onto "shape"
                    // (no "options" wrapper like in 1.x)
                    "shape": {
                        "type": "image",
                        "image": {
                            "src": leaf_image,
                            "width": 32,
                            "height": 32
                        }
                    },
                    "size": {
                        "value": 14,
                        "random": true,
                        "anim": {
                            "enable": true,
                            "speed": 2,
                            "minimum_value": 8,
                            "sync": false
                        }
                    },
                    "line_linked": {
                        "enable": false
                    },
                    "move": {
                        "enable": true,
                        "speed": 2,
                        "direction": "bottom",
                        "random": true,
                        "straight": false,
                        "out_mode": "out",
                        "bounce": false,
                        "attract": {
                            "enable": true,
                            "rotateX": 400,
                            "rotateY": 1200
                        }
                    }
                },
                "interactivity": {
                    "events": {
                        "onhover": {
                            "enable": false
                        },
                        "onclick": {
                            "enable": false
                        },
                        "resize": false
                    }
                },
                "retina_detect": true
            });

            addSwing(40);
        }

        if (spring_on) {
            particlesJS("spring", {
                "particles": {
                    "number": {
                        "value": 40,
                        "density": {
                            "enable": true,
                            "value_area": 1000
                        }
                    },
                    "color": {
                        "value": "#FFC0CB"
                    },
                    "opacity": {
                        "value": 0.9,
                        "random": true,
                        "anim": {
                            "enable": false
                        }
                    },
                    "shape": {
                        "type": "image",
                        "image": {
                            "src": cherry_image,
                            "width": 32,
                            "height": 32
                        }
                    },
                    "size": {
                        "value": 12,
                        "random": true,
                        "anim": {
                            "enable": true,
                            "speed": 1.5,
                            "minimum_value": 7,
                            "sync": false
                        }
                    },
                    "line_linked": {
                        "enable": false
                    },
                    "move": {
                        "enable": true,
                        // petals drift, they do not drop like snow or leaves
                        "speed": 1.4,
                        "direction": "bottom",
                        "random": true,
                        "straight": false,
                        "out_mode": "out",
                        "bounce": false,
                        "attract": {
                            "enable": true,
                            "rotateX": 500,
                            "rotateY": 1400
                        }
                    }
                },
                "interactivity": {
                    "events": {
                        "onhover": {
                            "enable": false
                        },
                        "onclick": {
                            "enable": false
                        },
                        "resize": false
                    }
                },
                "retina_detect": true
            });

            // A softer sway than the leaves - petals are lighter.
            addSwing(25);
        }
    }

    if (snow_on || fall_on || spring_on) {
        // Tried in order: vendored copy first, CDN as a fallback.
        loadParticles(PARTICLES_SOURCES.slice());
    }
});