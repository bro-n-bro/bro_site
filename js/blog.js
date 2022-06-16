class Tweets {
    neuron = 'bostrom1ndwqfv2skglrmsqu4wlneepthyrquf9r7sx6r0'
    particleFrom = 'QmbdH2WBamyKLPE5zu4mJ9v49qvY8BFfoumoVPMR5V4Rvx'
    limit = 1000000000
    loadURL = `https://lcd.bostrom.cybernode.ai/txs?cyberlink.neuron=${this.neuron}&cyberlink.particleFrom=${this.particleFrom}&limit=${this.limit}`
    loadData = []
    // tweets = []
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
            const ipfsStatus = document.querySelector('header .ipfs_status')

            if (ipfsStatus) { ipfsStatus.classList.add('green') }
        } else {
            // запосной вариант загрузки
        }


        await fetch(this.loadURL)
            .then(response => response.json())
            .then(data => this.loadData = data.txs.sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)))
    }

    async parseTweets() {
        await this.loadTweets()

        if (this.node !== null) {
            let tweetsEl = document.getElementById('blog').querySelector('.row')

            for (const el of this.loadData) {
                let cid = el.tx.value.msg[0].value.links[0].to,
                    time = new Date(el.timestamp).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })

                for await (const message of await all(this.node.cat(cid))) {
                    let item = new TextDecoder().decode(message)

                    // this.tweets.push({
                    //     date: time,
                    //     text: item
                    // })

                    if (tweetsEl) {
                        tweetsEl.innerHTML += String()
                            + '<div class="item">'
                            + '<div class="date">' + time + '</div>'
                            + '<a href="./" class="title"></a>'
                            + '<div class="desc text_block">' + marked.parse(item) + '</div>'
                            + '</div>'
                    }
                }

                // Переносим заголовок
                let articles = document.querySelectorAll('.blog .item')

                articles.forEach(element => {
                    let firstTitle = element.querySelector('.desc h2:first-child')

                    if (firstTitle) {
                        element.querySelector('.title').textContent = firstTitle.textContent

                        firstTitle.remove()
                    }
                })

                // Убираем лоадер
                const loader = document.querySelector('.blog .loader')
                if (loader) { loader.remove() }
            }
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

tweets.parseTweets()