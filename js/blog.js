const blog = document.getElementById('blog'),
    article = document.getElementById('article'),
    ipfsStatus = document.querySelector('header .ipfs_status'),
    tweetsEl = blog ? blog.querySelector('.row') : null


class Tweets {
    neuron = 'bostrom1ndwqfv2skglrmsqu4wlneepthyrquf9r7sx6r0'
    particleFrom = 'QmbdH2WBamyKLPE5zu4mJ9v49qvY8BFfoumoVPMR5V4Rvx'
    limit = 1000
    loadURL = `https://lcd.bostrom.cybernode.ai/txs?cyberlink.neuron=${this.neuron}&cyberlink.particleFrom=${this.particleFrom}&limit=${this.limit}`
    loadData = []
    node = null
    html = ''
    gateway = 'https://ipfs.io/ipfs/'


    async initNode() {
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
        }
    }


    async loadTweets() {
        await this.initNode()

        await fetch(this.loadURL)
            .then(response => response.json())
            .then(data => this.loadData = data.txs.sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)))
    }


    async parseALLTweets() {
        await this.loadTweets()

        for (const el of this.loadData) {
            let cid = el.tx.value.msg[0].value.links[0].to,
                time = new Date(el.timestamp).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })

            if (this.node !== null) {
                // Getting posts from ipfs
                for await (const message of await all(this.node.cat(cid))) {
                    let data = new TextDecoder().decode(message)

                    this.renderPost(cid, time, data)
                }
            } else {
                // Getting posts from gateway
                await fetch(this.gateway + cid)
                    .then(response => response.text())
                    .then(data => this.renderPost(cid, time, data))
            }
        }
    }


    renderPost(cid, time, data) {
        if (tweetsEl) {
            tweetsEl.innerHTML += String()
                + '<div class="item">'
                + '<div class="date">' + time + '</div>'
                + '<a href="./blog_item.html?cid=' + cid + '" class="title"></a>'
                + '<div class="desc text_block">' + marked.parse(data) + '</div>'
                + '</div>'


            // Title wrap
            let article = blog.querySelector('.item:last-child')

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


            // Hiding the loader
            const loader = blog.querySelector('.loader')
            if (loader) { loader.remove() }
        }
    }


    async parseOnTweet() {
        await this.loadTweets()

        let urlCID = new URL(window.location.href).searchParams.get('cid')

        // Date definition
        for (const el of this.loadData) {
            if (urlCID == el.tx.value.msg[0].value.links[0].to) {
                let time = new Date(el.timestamp).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })

                article.querySelector('.date').innerText = time

                // Getting post content
                if (this.node !== null) {
                    // Getting post from ipfs
                    for await (const message of await all(this.node.cat(urlCID))) {
                        let item = new TextDecoder().decode(message)

                        article.querySelector('.text_block').innerHTML = marked.parse(item)
                    }
                } else {
                    // Getting post from gateway
                    await fetch(this.gateway + urlCID)
                        .then(response => response.text())
                        .then(data => article.querySelector('.text_block').innerHTML = marked.parse(data))
                }
            }
        }


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


        // Hiding the loader
        const loader = article.querySelector('.loader')
        if (loader) { loader.remove() }
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