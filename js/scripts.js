// Загрузка шрифта
addStylesheetURL('https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap')


document.addEventListener("DOMContentLoaded", function () {
	// Ширина окна для ресайза
	WW = document.body.clientWidth


	// Есть ли поддержка тач событий или это apple устройство
	if (!is_touch_device() || !/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform)) document.documentElement.classList.add('custom_scroll')


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


	// Установка ширины стандартного скроллбара
	document.documentElement.style.setProperty('--scroll_width', widthScroll() + 'px')


	// Моб. версия
	firstResize = false

	if (document.body.clientWidth < 375) {
		document.getElementsByTagName('meta')['viewport'].content = 'width=375, user-scalable=no'

		firstResize = true
	}


	// Плавная прокрутка к якорю
	const scrollBtns = document.querySelectorAll('.scroll_btn')

	if (scrollBtns) {
		scrollBtns.forEach(element => {
			element.addEventListener('click', e => {
				e.preventDefault()

				let anchor = element.getAttribute('data-anchor')

				document.getElementById(anchor).scrollIntoView({
					behavior: 'smooth'
				})
			})
		})
	}


	// Менмоника
	const words = document.querySelector('.first_section .words')

	if (words) {
		setTimeout(() => {
			animateWords(words)
		}, 3000)
	}
})



window.addEventListener('resize', () => {
	if (typeof WW !== 'undefined' && WW != document.body.clientWidth) {
		// Моб. версия
		if (!firstResize) {
			document.getElementsByTagName('meta')['viewport'].content = 'width=device-width, initial-scale=1, maximum-scale=1'

			if (document.body.clientWidth < 375) document.getElementsByTagName('meta')['viewport'].content = 'width=375, user-scalable=no'

			firstResize = true
		} else {
			firstResize = false
		}


		// Перезапись ширины окна
		WW = document.body.clientWidth
	}
})



// Вспомогательные функции
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


// Анимация чисел
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


// Менмоника
const animateWords = el => {
	el.classList.toggle('change')

	setTimeout(() => {
		animateWords(el)
	}, 3200)
}