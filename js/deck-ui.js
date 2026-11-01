(() => {
	const THEME_STORAGE_KEY = 'perception-deck-theme';
	const RETURN_THEME_STORAGE_KEY = 'perception-deck-return-theme';
	const VALID_THEMES = ['dark', 'light', 'print'];

	const pageParams = new URLSearchParams(window.location.search);
	const requestedTheme =
		pageParams.get('theme') || (pageParams.has('print-pdf') ? 'print' : null);
	const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
	const initialTheme =
		requestedTheme || (['dark', 'light'].includes(savedTheme) ? savedTheme : 'dark');

	document.documentElement.dataset.deckTheme = VALID_THEMES.includes(initialTheme)
		? initialTheme
		: 'dark';

	const initializeDeckUi = () => {
		const particleCanvas = document.getElementById('title-particles');
		const particleContext = particleCanvas.getContext('2d');
		const particlePointer = {
			x: window.innerWidth / 2,
			y: window.innerHeight / 2,
			targetX: window.innerWidth / 2,
			targetY: window.innerHeight / 2,
			active: false,
		};
		let particleWidth = window.innerWidth;
		let particleHeight = window.innerHeight;
		let particles = [];
		let particleFrame = null;
		let particlesEnabled = false;

		const resizeParticles = () => {
			const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
			particleWidth = window.innerWidth;
			particleHeight = window.innerHeight;
			particleCanvas.width = Math.round(particleWidth * pixelRatio);
			particleCanvas.height = Math.round(particleHeight * pixelRatio);
			particleContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

			const count = Math.min(
				100,
				Math.max(55, Math.round((particleWidth * particleHeight) / 17000)),
			);
			particles = Array.from({ length: count }, (_, index) => {
				const velocityX = (Math.random() - 0.5) * 0.32;
				const velocityY = (Math.random() - 0.5) * 0.32;
				return {
					x: Math.random() * particleWidth,
					y: Math.random() * particleHeight,
					velocityX,
					velocityY,
					baseVelocityX: velocityX,
					baseVelocityY: velocityY,
					radius: 1.2 + Math.random() * 1.8,
					depth: 0.2 + Math.random() * 0.8,
					colorIndex: index % 3,
				};
			});
		};

		const drawParticles = () => {
			if (!particlesEnabled) {
				particleContext.clearRect(0, 0, particleWidth, particleHeight);
				particleFrame = null;
				return;
			}

			particlePointer.x +=
				(particlePointer.targetX - particlePointer.x) * 0.08;
			particlePointer.y +=
				(particlePointer.targetY - particlePointer.y) * 0.08;
			particleContext.clearRect(0, 0, particleWidth, particleHeight);

			const isLight = document.documentElement.dataset.deckTheme === 'light';
			const lineColor = isLight ? '#2563eb' : '#80cfff';
			const particleColors = isLight
				? ['#075f9b', '#6b21a8', '#0f766e']
				: ['#8bd5ff', '#c69cff', '#75ead8'];

			particles.forEach((particle) => {
				if (particlePointer.active) {
					const deltaX = particle.x - particlePointer.x;
					const deltaY = particle.y - particlePointer.y;
					const distance = Math.hypot(deltaX, deltaY);
					if (distance > 0 && distance < 170) {
						const force = (1 - distance / 170) * 0.022;
						particle.velocityX += (deltaX / distance) * force;
						particle.velocityY += (deltaY / distance) * force;
					}
				}

				particle.velocityX +=
					(particle.baseVelocityX - particle.velocityX) * 0.012;
				particle.velocityY +=
					(particle.baseVelocityY - particle.velocityY) * 0.012;
				particle.x += particle.velocityX;
				particle.y += particle.velocityY;

				if (particle.x < -20) particle.x = particleWidth + 20;
				if (particle.x > particleWidth + 20) particle.x = -20;
				if (particle.y < -20) particle.y = particleHeight + 20;
				if (particle.y > particleHeight + 20) particle.y = -20;

				particle.renderX =
					particle.x +
					(particlePointer.x - particleWidth / 2) * particle.depth * 0.025;
				particle.renderY =
					particle.y +
					(particlePointer.y - particleHeight / 2) * particle.depth * 0.025;
			});

			particleContext.strokeStyle = lineColor;
			particleContext.lineWidth = 0.7;
			for (let first = 0; first < particles.length; first += 1) {
				for (let second = first + 1; second < particles.length; second += 1) {
					const deltaX =
						particles[first].renderX - particles[second].renderX;
					const deltaY =
						particles[first].renderY - particles[second].renderY;
					const distance = Math.hypot(deltaX, deltaY);
					if (distance < 115) {
						particleContext.globalAlpha =
							(1 - distance / 115) * (isLight ? 0.2 : 0.28);
						particleContext.beginPath();
						particleContext.moveTo(
							particles[first].renderX,
							particles[first].renderY,
						);
						particleContext.lineTo(
							particles[second].renderX,
							particles[second].renderY,
						);
						particleContext.stroke();
					}
				}
			}

			particles.forEach((particle) => {
				particleContext.globalAlpha = isLight ? 0.55 : 0.78;
				particleContext.fillStyle = particleColors[particle.colorIndex];
				particleContext.beginPath();
				particleContext.arc(
					particle.renderX,
					particle.renderY,
					particle.radius,
					0,
					Math.PI * 2,
				);
				particleContext.fill();
			});
			particleContext.globalAlpha = 1;
			particleFrame = window.requestAnimationFrame(drawParticles);
		};

		const refreshTitleParticles = () => {
			const currentSlide = window.Reveal?.isReady()
				? Reveal.getCurrentSlide()
				: null;
			const printMode =
				document.documentElement.dataset.deckTheme === 'print' ||
				document.documentElement.classList.contains('print-pdf');
			particlesEnabled = Boolean(
				currentSlide?.classList.contains('opening-slide') && !printMode,
			);
			document.body.classList.toggle('particles-active', particlesEnabled);
			document.body.classList.toggle(
				'refresher-active',
				Boolean(
					currentSlide?.classList.contains('optional-slide') && !printMode,
				),
			);
			if (particlesEnabled && particleFrame === null) {
				particleFrame = window.requestAnimationFrame(drawParticles);
			}
		};

		window.addEventListener('resize', resizeParticles);
		window.addEventListener('pointermove', (event) => {
			particlePointer.targetX = event.clientX;
			particlePointer.targetY = event.clientY;
			particlePointer.active = true;
		});
		window.addEventListener('blur', () => {
			particlePointer.targetX = particleWidth / 2;
			particlePointer.targetY = particleHeight / 2;
			particlePointer.active = false;
		});
		resizeParticles();

		// Markdown slides can opt out with class="hidden-slide". Reveal only
		// removes sections that already carry data-visibility="hidden" when
		// it starts, so this must run after RevealMarkdown and before that.
		// The end cards stay in the live deck and drop out of the PDF.
		const HideSlides = {
			id: 'hide-slides',
			init: () => {
				const printing = new URLSearchParams(window.location.search).has(
					'print-pdf',
				);
				document
					.querySelectorAll('.reveal .slides section.hidden-slide')
					.forEach((slide) => {
						slide.dataset.visibility = 'hidden';
					});
				if (printing) {
					document
						.querySelectorAll(
							'.reveal .slides section.folks-slide, .reveal .slides section.break-slide, .reveal .slides section.closing-slide',
						)
						.forEach((slide) => {
							slide.dataset.visibility = 'hidden';
						});
				}
			},
		};

		// Must run after RevealMarkdown and before Reveal sorts fragments,
		// so bullets and fragment callouts share DOM order.
		const AutoFragments = {
			id: 'auto-fragments',
			init: () => {
				document
					.querySelectorAll('.reveal .slides li:not(.fragment)')
					.forEach((item) => {
						if (!item.closest('.no-fragments')) {
							item.classList.add('fragment');
						}
					});
			},
		};

		Reveal.initialize({
			hash: true,
			progress: false,
			slideNumber: 'c',
			center: true,
			transition: 'slide',
			backgroundTransition: 'fade',
			pdfSeparateFragments: false,
			plugins: [RevealMarkdown, HideSlides, AutoFragments, RevealHighlight, RevealNotes],
		}).then(() => {
			refreshThemeImages(document.documentElement.dataset.deckTheme);
			Reveal.on('slidechanged', refreshTitleParticles);
			refreshTitleParticles();
			setupBreakTimers();

			const params = new URLSearchParams(window.location.search);
			document.querySelectorAll('a.print-deck').forEach((link) => {
				link.addEventListener('click', (event) => {
					event.preventDefault();
					const currentTheme = document.documentElement.dataset.deckTheme;
					const returnTheme = ['dark', 'light'].includes(currentTheme)
						? currentTheme
						: 'dark';
					sessionStorage.setItem(RETURN_THEME_STORAGE_KEY, returnTheme);
					const printUrl = new URL(window.location.href);
					const color = link.dataset.print === 'color';
					printUrl.searchParams.set('theme', color ? returnTheme : 'print');
					printUrl.searchParams.set('print-pdf', '1');
					printUrl.searchParams.set('autoprint', '1');
					printUrl.hash = '';
					window.location.assign(printUrl);
				});
			});

			if (params.has('print-pdf') && params.get('autoprint') === '1') {
				const openPrintDialog = () =>
					window.setTimeout(() => window.print(), 400);
				if (document.readyState === 'complete') {
					openPrintDialog();
				} else {
					window.addEventListener('load', openPrintDialog, { once: true });
				}
			}
		});

		const themeButtons = document.querySelectorAll(
			'.theme-switcher [data-theme]',
		);
		const refreshThemeImages = (theme) => {
			const useLightAssets = theme === 'light' || theme === 'print';
			const themeImages = document.querySelectorAll('img[data-light-src]');
			themeImages.forEach((image) => {
				if (!image.dataset.darkSrc) {
					image.dataset.darkSrc = image.getAttribute('src');
				}
				image.setAttribute(
					'src',
					useLightAssets ? image.dataset.lightSrc : image.dataset.darkSrc,
				);
			});
		};

		const applyTheme = (theme) => {
			document.documentElement.dataset.deckTheme = theme;
			if (theme !== 'print') {
				localStorage.setItem(THEME_STORAGE_KEY, theme);
			}
			refreshThemeImages(theme);
			themeButtons.forEach((button) => {
				button.setAttribute(
					'aria-pressed',
					String(button.dataset.theme === theme),
				);
			});
			if (window.Reveal?.isReady()) {
				Reveal.layout();
			}
			refreshTitleParticles();
		};

		themeButtons.forEach((button) => {
			button.addEventListener('click', () => {
				const theme = button.dataset.theme;
				if (theme === 'print') {
					const currentTheme = document.documentElement.dataset.deckTheme;
					const returnTheme = ['dark', 'light'].includes(currentTheme)
						? currentTheme
						: 'dark';
					sessionStorage.setItem(RETURN_THEME_STORAGE_KEY, returnTheme);
					const printUrl = new URL(window.location.href);
					printUrl.searchParams.set('theme', 'print');
					printUrl.searchParams.set('print-pdf', '1');
					printUrl.searchParams.set('autoprint', '1');
					window.location.assign(printUrl);
				} else {
					applyTheme(theme);
				}
			});
		});
		applyTheme(document.documentElement.dataset.deckTheme);

		const themeSwitcher = document.querySelector('.theme-switcher');
		let themeSwitcherTimer;
		const scheduleThemeSwitcherHide = () => {
			window.clearTimeout(themeSwitcherTimer);
			themeSwitcherTimer = window.setTimeout(() => {
				themeSwitcher.classList.add('is-hidden');
			}, 3000);
		};
		const showThemeSwitcher = () => {
			window.clearTimeout(themeSwitcherTimer);
			themeSwitcher.classList.remove('is-hidden');
		};

		themeSwitcher.addEventListener('mouseenter', showThemeSwitcher);
		themeSwitcher.addEventListener('mouseleave', scheduleThemeSwitcherHide);
		themeSwitcher.addEventListener('focusin', showThemeSwitcher);
		themeSwitcher.addEventListener('focusout', scheduleThemeSwitcherHide);
		scheduleThemeSwitcherHide();

		window.addEventListener('afterprint', () => {
			const params = new URLSearchParams(window.location.search);
			if (params.get('autoprint') === '1') {
				const returnTheme =
					sessionStorage.getItem(RETURN_THEME_STORAGE_KEY) || 'dark';
				const returnUrl = new URL(window.location.href);
				returnUrl.searchParams.delete('print-pdf');
				returnUrl.searchParams.delete('autoprint');
				returnUrl.searchParams.set('theme', returnTheme);
				localStorage.setItem(THEME_STORAGE_KEY, returnTheme);
				window.location.replace(returnUrl);
			}
		});
	};

	const setupBreakTimers = () => {
		const format = (totalSeconds) => {
			const minutes = Math.floor(totalSeconds / 60);
			const seconds = totalSeconds % 60;
			return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
		};

		document.querySelectorAll('.break-timer').forEach((timer) => {
			const minutes = Number(timer.dataset.minutes) || 10;
			const initial = Math.max(60, Math.round(minutes * 60));
			const display = timer.querySelector('.break-timer-display');
			if (!display) return;

			let armed = initial;
			let remaining = initial;
			let deadline = 0;
			let handle = 0;
			let running = false;

			const render = () => {
				display.textContent = format(remaining);
				timer.classList.toggle('is-running', running);
				timer.classList.toggle('is-done', remaining === 0);
			};

			const stop = () => {
				running = false;
				window.clearInterval(handle);
				handle = 0;
			};

			const tick = () => {
				remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
				if (remaining === 0) stop();
				render();
			};

			const shown = () =>
				running
					? Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
					: remaining;

			display.addEventListener('click', (event) => {
				event.preventDefault();
				event.stopPropagation();
				if (running) {
					remaining = shown();
					stop();
				} else {
					if (remaining === 0) remaining = armed;
					deadline = Date.now() + remaining * 1000;
					running = true;
					handle = window.setInterval(tick, 250);
				}
				render();
				display.blur();
			});

			timer.querySelectorAll('.break-timer-step').forEach((step) => {
				step.addEventListener('click', (event) => {
					event.preventDefault();
					event.stopPropagation();
					remaining = Math.max(0, shown() + Number(step.dataset.step));
					if (remaining > 0) armed = remaining;
					if (running) {
						if (remaining === 0) stop();
						else deadline = Date.now() + remaining * 1000;
					}
					render();
					step.blur();
				});
			});

			render();
		});
	};

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initializeDeckUi, {
			once: true,
		});
	} else {
		initializeDeckUi();
	}
})();
