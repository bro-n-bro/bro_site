const blog = document.getElementById('blog'),
    article = document.getElementById('article'),
    error = document.getElementById('error'),
    ipfsStatus = document.querySelector('header .ipfs_status'),
    tweetsEl = blog ? blog.querySelector('.row') : null


class Tweets {
    neuron = 'bostrom1ndwqfv2skglrmsqu4wlneepthyrquf9r7sx6r0'
    particleFrom = 'QmbdH2WBamyKLPE5zu4mJ9v49qvY8BFfoumoVPMR5V4Rvx'
    limit = 1000
    // loadURL = `https://lcd.bostrom.bronbro.io/cosmos/tx/v1beta1/txs?pagination.offset=0&pagination.limit=${this.limit}&orderBy=ORDER_BY_DESC&events=message.sender%3D%27${this.neuron}%27&events=cyberlink.particleFrom%3D%27${this.particleFrom}%27`
    loadURL = `https://lcd.bostrom.cybernode.ai/cosmos/tx/v1beta1/txs?pagination.offset=0&pagination.limit=${this.limit}&orderBy=ORDER_BY_DESC&events=message.sender%3D%27${this.neuron}%27&events=cyberlink.particleFrom%3D%27${this.particleFrom}%27`
    loadData = []
    node = null
    html = ''
    gateway = 'https://gateway.ipfs.cybernode.ai/ipfs/'


    async initNode() {
        this.node = await Ipfs.create({
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
        }
    }


    async loadTweets() {
        await this.initNode()

        await fetch(this.loadURL)
            .then(response => response.json())
            .then(data => {
                if(data.total_count != '0') {
                    this.loadData = data.tx_responses.sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
                }
            })
    }


    async parseALLTweets(limit) {
        await this.loadTweets()

        let sliceArray = []

        // Limit
        limit
            ? sliceArray = this.loadData.slice(0, limit)
            : sliceArray = this.loadData

        sliceArray.forEach(async el => {
            let cid = el.tx.body.messages[0].links[0].to,
                time = new Date(el.timestamp).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                className = this.preRenderPost(cid)

            if (this.node !== null) {
                let delay = 5000,
                    postStatus = false

                // Getting post from gateway
                setTimeout(() => {
                    if (!postStatus) {
                        fetch(this.gateway + cid)
                            .then(response => response.text())
                            .then(data => this.renderPost(cid, time, data, className))
                    }
                }, delay)

                // Getting posts from ipfs node
                for (const message of await all(this.node.cat(cid))) {
                    let data = new TextDecoder().decode(message)

                    this.renderPost(cid, time, data, className)

                    postStatus = true
                }
            } else {
                // Getting post from gateway
                fetch(this.gateway + cid)
                    .then(response => response.text())
                    .then(data => this.renderPost(cid, time, data, className))
            }
        })
    }


    preRenderPost(cid) {
        if (tweetsEl) {
            let className = randomString(12)

            tweetsEl.innerHTML += String()
                + '<div class="item ' + className + '">'
                + '<div class="cid">' + cid + '</div>'
                + '<div class="loader"><span></span></div>'
                + '</div>'

            // Hiding the loader
            const loader = blog.querySelector('.main_loader')
            if (loader) { loader.remove() }

            return className
        }
    }


    renderPost(cid, time, data, className) {
        if (tweetsEl) {
            let article = blog.querySelector('.' + className)

            article.innerHTML = String()
                + '<div class="date">' + time + '</div>'
                + '<a href="./blog_item.html?cid=' + cid + '" class="title"></a>'
                + '<div class="desc text_block">' + marked.parse(data) + '</div>'

            // Title wrap
            let firstTitle = article.querySelector('.desc h1:first-child, .desc h2:first-child, .desc h3:first-child, .desc h4:first-child, .desc h5:first-child, .desc h6:first-child')

            if (firstTitle) {
                article.querySelector('.title').textContent = firstTitle.textContent

                firstTitle.remove()
            }


            // Adding Link Attributes
            let links = blog.querySelectorAll('.item:last-child .desc a')

            links.forEach(element => {
                element.setAttribute('target', '_blank')
                element.setAttribute('rel', 'noopener nofollow')
            })
        }
    }


    async parseOneTweet() {
        await this.loadTweets()

        let urlCID = new URL(window.location.href).searchParams.get('cid'),
            currentIndex

        if (urlCID) {
            // Get current index
            for (const [i, el] of this.loadData.entries()) {
                if (urlCID == el.tx.body.messages[0].links[0].to) {
                    currentIndex = i
                }
            }

            // Prev/Next
            let prevIndex = (currentIndex - 1 < 0) ? this.loadData.length - 1 : currentIndex - 1,
                nextIndex = (currentIndex + 1 > this.loadData.length - 1) ? 0 : currentIndex + 1

            article.querySelector('.prev_link').setAttribute('href', `./blog_item.html?cid=${this.loadData[prevIndex].tx.body.messages[0].links[0].to}`)

            article.querySelector('.next_link').setAttribute('href', `./blog_item.html?cid=${this.loadData[nextIndex].tx.body.messages[0].links[0].to}`)


            // Adding Link Attributes
            let firstTitle = article.querySelector('.text_block h1:first-child, .text_block h2:first-child, .text_block h3:first-child, .text_block h4:first-child, .text_block h5:first-child, .text_block h6:first-child')

            if (firstTitle) {
                article.querySelector('.title').textContent = firstTitle.textContent
                document.getElementsByTagName('title')[0].textContent = firstTitle.textContent

                firstTitle.remove()
            }


            // Adding Link Attributes
            let links = article.querySelectorAll('.text_block a')

            links.forEach(element => {
                element.setAttribute('target', '_blank')
                element.setAttribute('rel', 'noopener nofollow')
            })


            // Date definition
            for (const [i, el] of this.loadData.entries()) {
                if (urlCID == el.tx.body.messages[0].links[0].to) {
                    // Getting post date
                    let time = new Date(el.timestamp).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })

                    article.querySelector('.date').innerText = time

                    // Getting post content
                    if (this.node !== null) {
                        let delay = 5000,
                            postStatus = false

                        // Getting post from gateway
                        setTimeout(() => {
                            if (!postStatus) {
                                fetch(this.gateway + urlCID)
                                    .then(response => response.text())
                                    .then(data => {
                                        article.querySelector('.text_block').innerHTML = marked.parse(data)

                                        // Hiding the loader
                                        const loader = article.querySelector('.loader')
                                        if (loader) { loader.remove() }
                                    })
                            }
                        }, delay)

                        // Getting post from ipfs
                        for (const message of await all(this.node.cat(urlCID))) {
                            let item = new TextDecoder().decode(message)

                            article.querySelector('.text_block').innerHTML = marked.parse(item)

                            postStatus = true
                        }
                    } else {
                        // Getting post from gateway
                        fetch(this.gateway + urlCID)
                            .then(response => response.text())
                            .then(data => article.querySelector('.text_block').innerHTML = marked.parse(data))
                    }
                }
            }


            // Hiding the loader
            const loader = article.querySelector('.loader')
            if (loader) { loader.remove() }
        }
    }
}



const all = async source => {
    let arr = []

    for await (const entry of source) {
        arr.push(entry)
    }

    return arr
}



// Random string
function randomString(i) {
    let abc = 'abcdefghijklmnopqrstuvwxyz',
        rs = ''

    while (rs.length < i) {
        rs += abc[Math.floor(Math.random() * abc.length)]
    }

    return rs
}



let tweets = new Tweets()

if (blog) { tweets.parseALLTweets(blog.classList.contains('limit') ? 6 : false) }
if (article) { tweets.parseOneTweet() }
if (error) { tweets.initNode() }