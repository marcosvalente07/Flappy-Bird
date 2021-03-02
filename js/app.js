function NewElement(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

function Pipe(reverse = false) {
    this.element = NewElement('div', 'pipes')

    const border = NewElement('div', 'border')
    const body = NewElement('div', 'body')

    this.element.appendChild(reverse ? body : border)
    this.element.appendChild(reverse ? border : body)

    this.setHeight = height => body.style.height = `${height}px`
}

function PairOfPipes(height, aperture, x) {
    this.element = NewElement('div', 'pair-of-pipes')

    this.superior = new Pipe(true)
    this.inferior = new Pipe(false)

    this.element.appendChild(this.superior.element)
    this.element.appendChild(this.inferior.element)

    this.openApertureForTheBird = () => {

        const superiorHeight = Math.random() * (height - aperture)
        const inferiorHeight = height - aperture - superiorHeight

        this.superior.setHeight(superiorHeight)
        this.inferior.setHeight(inferiorHeight)

    }

    this.getX = () => parseInt(this.element.style.left.split('px')[0])
    this.setX = x => this.element.style.left = `${x}px`
    this.getWidth = () => this.element.clientWidth

    this.openApertureForTheBird()
    this.setX(x)
}

function Pipes(height, width, aperture, space, notifyPoint) {

    this.pairs = [
        new PairOfPipes(height, aperture, width),
        new PairOfPipes(height, aperture, width + space),
        new PairOfPipes(height, aperture, width + space * 2),
        new PairOfPipes(height, aperture, width + space * 3)
    ]

    const displacement = 10
    this.livenUp = () => {
        this.pairs.forEach(pair => {
            pair.setX(pair.getX() - displacement)

            if (pair.getX() < -pair.getWidth()) {
                pair.setX(pair.getX() + space * this.pairs.length)
                pair.openApertureForTheBird()
            }

            const middle = width / 2
            const crossedTheMiddle = pair.getX() + displacement >= middle
                && pair.getX() < middle
            if (crossedTheMiddle) notifyPoint()
        })
    }
}

function Bird(gameHeight) {
    let flying = false

    this.element = NewElement('img', 'bird')
    this.element.src = 'img/bird.png'

    this.getY = () => parseInt(this.element.style.bottom.split('px')[0])
    this.setY = y => this.element.style.bottom = `${y}px`

    window.onkeydown = e => flying = true
    window.onkeyup = e => flying = false

    this.livenUp = () => {
        const newY = this.getY() + (flying ? 8 : -5)
        const maxHeight = gameHeight - this.element.clientHeight

        if (newY <= 0) {
            this.setY(0)
        } else if (newY >= maxHeight) {
            this.setY(maxHeight)
        } else {
            this.setY(newY)
        }
    }

    this.setY(gameHeight / 2)
}


function Progress() {
    this.element = NewElement('span', 'progress')
    this.attPoints = points => {
        this.element.innerHTML = points
    }
    this.attPoints(0)
}

function FlappyBird() {
    let points = 0

    const gameArea = document.querySelector('[wm-flappy]')
    const height = gameArea.clientHeight
    const width = gameArea.clientWidth

    const progress = new Progress()
    const pipes = new Pipes(height, width, 200, 400,
        () => progress.attPoints(++points))
    const bird = new Bird(height)

    gameArea.appendChild(progress.element)
    gameArea.appendChild(bird.element)
    pipes.pairs.forEach(pair => gameArea.appendChild(pair.element))

    this.start = () => {
        const timer = setInterval(() => {
            pipes.livenUp()
            bird.livenUp()
            if (Clash(bird, pipes)) {
                clearInterval(timer)
            }
        }, 20)
    }
}

function AreOverlapping(elementA, elementB) {
    const a = elementA.getBoundingClientRect()
    const b = elementB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top
    return horizontal && vertical
}

function Clash(bird, pipes) {
    let clash = false
    pipes.pairs.forEach(PairOfPipes => {
        if (!clash) {
            const superior = PairOfPipes.superior.element
            const inferior = PairOfPipes.inferior.element
            clash = AreOverlapping(bird.element, superior) || AreOverlapping(bird.element, inferior)
        }
    })

    return clash
}

new FlappyBird().start()