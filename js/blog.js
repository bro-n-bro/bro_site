const blog = document.getElementById('blog'),
    article = document.getElementById('article'),
    ipfsStatus = document.querySelector('header .ipfs_status')


class Tweets {
    neuron = 'bostrom1ndwqfv2skglrmsqu4wlneepthyrquf9r7sx6r0'
    particleFrom = 'QmbdH2WBamyKLPE5zu4mJ9v49qvY8BFfoumoVPMR5V4Rvx'
    limit = 1000000000
    loadURL = `https://lcd.bostrom.cybernode.ai/txs?cyberlink.neuron=${this.neuron}&cyberlink.particleFrom=${this.particleFrom}&limit=${this.limit}`
    loadData = []
    node = {}
    html = ''

    async loadTweets() {
        this.node = await Ipfs.create({
            // repo: 'ipfs-repo-cyber',
            init: true,
            start: true,
            relay: {
                enabled: true,
                hop: {
                    enabled: true,
                },
            },
            EXPERIMENTAL: {
                pubsub: true,
            },
            config: {
                Addresses: {
                    Swarm: [
                        // '/dns4/star.thedisco.zone/tcp/9090/wss/p2p-webrtc-star',
                        // '/dns6/star.thedisco.zone/tcp/9090/wss/p2p-webrtc-star',
                        '/dns4/ws-star.discovery.cybernode.ai/tcp/443/wss/p2p-webrtc-star',
                        // '/dns4/ws-star.discovery.cybernode.ai/tcp/4430/wss/p2p/QmUgmRxoLtGERot7Y6G7UyF6fwvnusQZfGR15PuE6pY3aB',
                    ],
                },
                Bootstrap: [
                    // '/dns4/ws-star.discovery.cybernode.ai/tcp/4430/p2p/QmUgmRxoLtGERot7Y6G7UyF6fwvnusQZfGR15PuE6pY3aB'
                    '/dns4/ws-star.discovery.cybernode.ai/tcp/4430/wss/p2p/QmUgmRxoLtGERot7Y6G7UyF6fwvnusQZfGR15PuE6pY3aB',
                    // '/dns6/ipfs.thedisco.zone/tcp/4430/wss/p2p/12D3KooWChhhfGdB9GJy1GbhghAAKCUR99oCymMEVS4eUcEy67nt',
                    // '/dns4/ipfs.thedisco.zone/tcp/4430/wss/p2p/12D3KooWChhhfGdB9GJy1GbhghAAKCUR99oCymMEVS4eUcEy67nt',
                ],
            },
        })


        if (this.node !== null) {
            if (ipfsStatus) { ipfsStatus.classList.add('green') }
        } else {
            // запосной вариант загрузки
        }


        await fetch(this.loadURL)
            .then(response => response.json())
            .then(data => this.loadData = data.txs.sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)))
    }


    async parseALLTweets() {
        await this.loadTweets()

        if (this.node !== null) {
            let tweetsEl = blog.querySelector('.row')

            for (const el of this.loadData) {
                let cid = el.tx.value.msg[0].value.links[0].to,
                    time = new Date(el.timestamp).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })

                for await (const message of await all(this.node.cat(cid))) {
                    let item = new TextDecoder().decode(message)

                    if (tweetsEl) {
                        tweetsEl.innerHTML += String()
                            + '<div class="item">'
                            + '<div class="date">' + time + '</div>'
                            + '<a href="./blog_item.html?cid=' + cid + '" class="title"></a>'
                            + '<div class="desc text_block">' + marked.parse(item) + '</div>'
                            + '</div>'
                    }
                }
            }


            // Переносим заголовок
            let articles = blog.querySelectorAll('.item')

            articles.forEach(element => {
                let firstTitle = element.querySelector('.desc h2:first-child')

                if (firstTitle) {
                    element.querySelector('.title').textContent = firstTitle.textContent

                    firstTitle.remove()
                }
            })


            // Добавление аттрибутов ссылкам
            let links = blog.querySelectorAll('.item .desc a')

            links.forEach(element => {
                element.setAttribute('target', '_blank')
                element.setAttribute('rel', 'noopener nofollow')
            })


            // Убираем лоадер
            const loader = blog.querySelector('.loader')
            if (loader) { loader.remove() }
        }
    }


    async parseOnTweet() {
        await this.loadTweets()

        if (this.node !== null) {
            let urlCID = new URL(window.location.href).searchParams.get('cid')

            // Определение даты
            for (const el of this.loadData) {
                if (urlCID == el.tx.value.msg[0].value.links[0].to) {
                    let time = new Date(el.timestamp).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })

                    article.querySelector('.date').innerText = time
                }
            }

            // Получение контента поста
            for await (const message of await all(this.node.cat(urlCID))) {
                let item = new TextDecoder().decode(message)

                article.querySelector('.text_block').innerHTML = marked.parse(item)
            }


            // Переносим заголовок
            let firstTitle = article.querySelector('.text_block h2:first-child')

            if (firstTitle) {
                article.querySelector('.title').textContent = firstTitle.textContent

                firstTitle.remove()
            }


            // Добавление аттрибутов ссылкам
            let links = article.querySelectorAll('.text_block a')

            links.forEach(element => {
                element.setAttribute('target', '_blank')
                element.setAttribute('rel', 'noopener nofollow')
            })


            // Убираем лоадер
            const loader = article.querySelector('.loader')
            if (loader) { loader.remove() }
        }
    }
}



const all = async source => {
    const arr = []

    for await (const entry of source) {
        arr.push(entry)
    }

    return arr
}



let tweets = new Tweets()

if (blog) { tweets.parseALLTweets() }
if (article) { tweets.parseOnTweet() }