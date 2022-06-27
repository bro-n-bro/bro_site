// Load font
addStylesheetURL('https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap')


const mobMenuBtn = document.querySelector('header .mob_menu_btn'),
	body = document.querySelector('body'),
	mobMenu = document.querySelector('.mob_menu'),
	header = document.querySelector('header'),
	headerWrap = document.querySelector('.header_wrap')


document.addEventListener("DOMContentLoaded", function () {
	// Window width
	WW = window.innerWidth


	// Is there support for touch events or is it an apple device
	if (!is_touch_device() || !/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform)) document.documentElement.classList.add('custom_scroll')


	// Set the width of the scrollbar
	document.documentElement.style.setProperty('--scroll_width', widthScroll() + 'px')


	// Mob. version
	firstResize = false

	if (window.innerWidth < 375) {
		document.getElementsByTagName('meta')['viewport'].content = 'width=375, user-scalable=no'

		firstResize = true
	}


	// Fetch API
	(async () => {
		await fetch('https://rpc.bronbro.io/bro_data/')
			.then(response => response.json())
			.then(data => {
				// Networks validated
				const networksValidatedEl = document.querySelector('.stats .networks_validated')

				if (networksValidatedEl) {
					networksValidatedEl.querySelector('.countUp').textContent = data.networks_validated
					networksValidatedEl.querySelector('.hide').textContent = data.networks_validated
				}


				// Delegators
				const delegatorsEl = document.querySelector('.stats .delegators')

				if (delegatorsEl) {
					delegatorsEl.querySelector('.countUp').textContent = data.delegators
					delegatorsEl.querySelector('.hide').textContent = data.delegators
				}


				// Networks
				const networksEl = document.querySelector('.networks')

				if (networksEl) {
					data.infos.forEach(element => {
						let el = networksEl.querySelector('.item.' + element.network + ' .apr span i')

						if (el) { el.textContent = (element.apr * 100).toFixed(2) }
					})
				}


				// Trusted tokens
				const trustedTokensEl = document.querySelector('.trusted_tokens')

				if (trustedTokensEl) {
					trustedTokensEl.querySelector('.atom').textContent = Math.ceil(data.tokens_in_atom).toLocaleString()
					trustedTokensEl.querySelector('.btc').textContent = Math.ceil(data.tokens_in_btc).toLocaleString()
					trustedTokensEl.querySelector('.eth').textContent = Math.ceil(data.tokens_in_eth).toLocaleString()
					trustedTokensEl.querySelector('.usd').textContent = Math.ceil(data.tokens_in_usd).toLocaleString()

					new Swiper('.trusted_tokens.swiper', {
						loop: true,
						speed: 300,
						spaceBetween: 0,
						slidesPerView: 1,
						direction: 'vertical',
						simulateTouch: false,
						allowTouchMove: true,
						noSwiping: true,
						autoplay: {
							delay: 2000
						},
						watchSlidesProgress: true,
						slideActiveClass: 'active',
						slideVisibleClass: 'visible'
					})
				}


				// Observer API
				const boxes = document.querySelectorAll('.lazyload, .countUp')

				function scrollTracking(entries) {
					for (const entry of entries) {
						if (entry.intersectionRatio >= 0.2 && entry.target.getAttribute('data-src') && !entry.target.classList.contains('loaded')) {
							entry.target.src = entry.target.getAttribute('data-src')
							entry.target.classList.add('loaded')
						}

						if (entry.intersectionRatio >= 0.2 && entry.target.localName === 'picture' && !entry.target.classList.contains('loaded')) {
							let sources = entry.target.querySelectorAll('source'),
								img = entry.target.querySelector('img')

							sources.forEach(source => source.srcset = source.getAttribute('data-srcset'))
							img.src = img.getAttribute('data-src')

							entry.target.classList.add('loaded')
						}

						if (entry.intersectionRatio >= 0.2 && entry.target.classList.contains('countUp') && !entry.target.classList.contains('animated')) {
							animateCountUp(entry.target)
							entry.target.classList.add('animated')
						}
					}
				}

				const observer = new IntersectionObserver(scrollTracking, {
					threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
				})

				boxes.forEach(element => observer.observe(element))
			})
	})()


	// Smooth scroll to anchor
	const scrollBtns = document.querySelectorAll('.scroll_btn')

	if (scrollBtns) {
		scrollBtns.forEach(element => {
			element.addEventListener('click', e => {
				e.preventDefault()

				mobMenuBtn.classList.remove('active')
				body.classList.remove('menu_open')
				mobMenu.classList.remove('show')

				let anchor = element.getAttribute('data-anchor')

				document.getElementById(anchor).scrollIntoView({
					behavior: 'smooth',
					block: 'start'
				})
			})
		})
	}


	// Mnemonic
	const words = document.querySelector('.first_section .words')

	if (words) {
		setTimeout(() => animateWords(words), 3000)
	}


	// Mob. menu
	if (mobMenuBtn && mobMenu) {
		mobMenuBtn.addEventListener('click', e => {
			e.preventDefault()

			mobMenuBtn.classList.toggle('active')
			body.classList.toggle('menu_open')
			mobMenu.classList.toggle('show')
		})
	}


	if (is_touch_device()) {
		// Closing the mob. swipe menu right to left
		let ts

		body.addEventListener('touchstart', e => { ts = e.touches[0].clientX })

		body.addEventListener('touchend', e => {
			let te = e.changedTouches[0].clientX

			if (body.classList.contains('menu_open') && ts > te + 50) {
				// Swipe from right to left
				mobMenuBtn.classList.remove('active')
				body.classList.remove('menu_open')
				mobMenu.classList.remove('show')
			}
		})
	}
})



window.addEventListener('load', () => {
	// Fix. header
	headerInit = true

	if (headerWrap) {
		headerWrap.style.height = header.clientHeight + 'px'
	}

	headerInit && window.scrollY > 0
		? header.classList.add('fixed')
		: header.classList.remove('fixed')
})



window.addEventListener('resize', () => {
	if (typeof WW !== 'undefined' && WW != window.innerWidth) {
		// Mob. version
		if (!firstResize) {
			document.getElementsByTagName('meta')['viewport'].content = 'width=device-width, initial-scale=1, maximum-scale=1'

			if (window.innerWidth < 375) document.getElementsByTagName('meta')['viewport'].content = 'width=375, user-scalable=no'

			firstResize = true
		} else {
			firstResize = false
		}


		// Fix. header
		headerInit = false

		setTimeout(() => {
			headerInit = true

			if (headerWrap) {
				headerWrap.style.height = 'auto'
				headerWrap.style.height = header.clientHeight
			}

			headerInit && window.scrollTop > 0
				? header.classList.add('fixed')
				: header.classList.remove('fixed')
		}, 100)


		// Overwrite window width
		WW = window.innerWidth
	}
})



window.addEventListener('scroll', () => {
	// Fix. header
	typeof headerInit !== 'undefined' && headerInit && window.scrollY > 0
		? header.classList.add('fixed')
		: header.classList.remove('fixed')
})



// Secondary functions
function addStylesheetURL(url) {
	var link = document.createElement('link')
	link.rel = 'stylesheet'
	link.href = url
	document.getElementsByTagName('head')[0].appendChild(link)
}


const is_touch_device = () => !!('ontouchstart' in window)


const widthScroll = () => {
	let div = document.createElement('div')

	div.style.overflowY = 'scroll'
	div.style.width = '50px'
	div.style.height = '50px'
	div.style.visibility = 'hidden'

	document.body.appendChild(div)

	let scrollWidth = div.offsetWidth - div.clientWidth
	document.body.removeChild(div)

	return scrollWidth
}


// Animate numbers
const animationDuration = 3000,
	frameDuration = 1000 / 60,
	totalFrames = Math.round(animationDuration / frameDuration),
	easeOutQuad = t => t * (2 - t)


const animateCountUp = el => {
	let frame = 0

	const countTo = parseInt(el.innerHTML.replace(/\s/g, ''), 10),
		counter = setInterval(() => {
			frame++

			const progress = easeOutQuad(frame / totalFrames),
				currentCount = Math.round(countTo * progress)

			if (parseInt(el.innerHTML.replace(/\s/g, ''), 10) !== currentCount) {
				el.innerHTML = currentCount.toLocaleString()
			}

			if (frame === totalFrames) {
				clearInterval(counter)
			}
		}, frameDuration)
}


// Menmonica
const animateWords = el => {
	el.classList.toggle('change')

	setTimeout(() => animateWords(el), 3200)
}