const width = 10
let intervalMs = 1000

const startTime = performance.now()

function sleep(milliseconds) {
  const start = new Date().getTime()
  for (let i = 0; i < 1e7; i++) {
    if (new Date().getTime() - start > milliseconds) {
      break
    }
  }
}

const Tetrominoes = {
  lTetromino: [
    [1, width + 1, width * 2 + 1, 2],
    [width, width + 1, width + 2, width * 2 + 2],
    [1, width + 1, width * 2 + 1, width * 2],
    [width, width * 2, width * 2 + 1, width * 2 + 2],
  ],

  zTetromino: [
    [0, width, width + 1, width * 2 + 1],
    [width + 1, width + 2, width * 2, width * 2 + 1],
    [0, width, width + 1, width * 2 + 1],
    [width + 1, width + 2, width * 2, width * 2 + 1],
  ],

  tTetromino: [
    [1, width, width + 1, width + 2],
    [1, width + 1, width + 2, width * 2 + 1],
    [width, width + 1, width + 2, width * 2 + 1],
    [1, width, width + 1, width * 2 + 1],
  ],

  oTetromino: [
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
  ],

  iTetromino: [
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3],
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3],
  ],
}

function buildGrid() {
  const grid = document.getElementById('grid')
  const miniGrid = document.getElementById('mini-grid')

  for (let i = 0; i < 210; i++) {
    const div = document.createElement('div')

    if (i > 199) {
      div.className = 'taken'
    }

    grid.appendChild(div)
  }

  for (let i = 0; i < 16; i++) {
    const div = document.createElement('div')

    miniGrid.appendChild(div)
  }
}

document.addEventListener('DOMContentLoaded', () => {
  buildGrid()
  document.querySelector('#music').volume = '0.1'

  const scoreDisplay = document.querySelector('#score')
  const startButton = document.querySelector('#start-button')
  const pauseButton = document.querySelector('#pause-button')
  const continueButton = document.querySelector('#continue-button')

  startButton.addEventListener('click', start)
  pauseButton.addEventListener('click', pause)
  continueButton.addEventListener('click', cont)

  let squares = Array.from(document.querySelectorAll('.grid div'))

  let score = 0

  const {
    lTetromino: l,
    zTetromino: z,
    tTetromino: t,
    oTetromino: o,
    iTetromino: i,
  } = Tetrominoes

  const tetrominoes = [l, z, t, o, i]

  const startingPosition = 4
  let currentPosition = startingPosition
  let currentRotation = 0

  let tetrominoIndex = getRandom()
  let nextTetrominoIndex = 0
  let current = tetrominoes[tetrominoIndex][currentRotation]

  function getRandom() {
    return Math.floor(Math.random() * tetrominoes.length)
  }

  // draw the first rotation in the first tetromino
  function draw() {
    const now = performance.now()
    current.forEach((i) => {
      squares[currentPosition + i].classList.add(`tetromino-${tetrominoIndex}`)
    })
  }

  // clear tetromino
  function undraw() {
    current.forEach((i) => {
      squares[currentPosition + i].classList.remove(
        `tetromino-${tetrominoIndex}`
      )
    })
  }

  let timerID = null

  function pause() {
    document.querySelector('#music').pause()

    if (timerID === null) {
      return
    }

    clearInterval(timerID)
  }

  function start() {
    document.querySelector('#music').play()
    draw()
    timerID = setInterval(moveDown, intervalMs)
    nextTetrominoIndex = getRandom()
    previewShape()
  }

  function cont() {
    document.querySelector('#music').play()
    if (timerID) {
      clearInterval(timerID)
    }

    draw()
    timerID = setInterval(moveDown, intervalMs)
  }

  function addScore() {
    for (let i = 0; i < 199; i += width) {
      const row = [
        i,
        i + 1,
        i + 2,
        i + 3,
        i + 4,
        i + 5,
        i + 6,
        i + 7,
        i + 8,
        i + 9,
      ]

      const isEntireRowTaken = row.every((i) =>
        squares[i].classList.contains('taken')
      )

      if (isEntireRowTaken) {
        scoreDisplay.innerHTML = ''

        score += 10
        const stringScore = `${score}`
        const wrappedScore = stringScore
          .split('')
          .map((s) => {
            const scoreCard = document.createElement('div')
            scoreCard.classList.add('score-unit')
            scoreCard.innerHTML = s

            return scoreCard
          })
          .forEach((sc) => scoreDisplay.appendChild(sc))

        row.forEach((i) => {
          square = squares[i]
          square.className = ''
        })

        const removed = squares.splice(i, width)

        squares = [...removed, ...squares]

        squares.forEach((cell) => {
          grid.appendChild(cell)
        })
      }
    }
  }

  // assign functions to keyCode
  function control(e) {
    if (e.key === 'ArrowLeft') {
      moveLeft()
    }

    if (e.key === 'ArrowUp') {
      rotate()
    }

    if (e.key === 'ArrowRight') {
      moveRight()
    }

    if (e.key === 'ArrowDown') {
      moveDown()
    }
  }

  document.addEventListener('keydown', control)

  // move tetromino down the grid
  function moveDown() {
    undraw()
    currentPosition += width
    draw()
    freeze()
  }

  function freeze() {
    const isTaken = current.some((i) =>
      squares[currentPosition + i + width].classList.contains('taken')
    )

    if (!isTaken) {
      return
    }

    tetrominoIndex = nextTetrominoIndex
    nextTetrominoIndex = getRandom()

    current.forEach((i) => squares[currentPosition + i].classList.add('taken'))
    current = tetrominoes[tetrominoIndex][currentRotation]
    currentPosition = startingPosition
    draw()
    previewShape()
    addScore()
  }

  // move the tetromino left, unless it is at the edge or there is a blockage
  function moveLeft() {
    undraw()
    if (!isAtLeftEdge(current)) {
      currentPosition -= 1
    }

    const isTaken = current.some((i) =>
      squares[currentPosition + i].classList.contains('taken')
    )

    if (isTaken) {
      currentPosition += 1
    }

    draw()
  }

  // move the tetromino right, unless it is at the edge or there is a blockage
  function moveRight() {
    undraw()

    if (!isAtRightEdge(current)) {
      currentPosition += 1
    }

    const isTaken = current.some((i) =>
      squares[currentPosition + i].classList.contains('taken')
    )

    if (isTaken) {
      currentPosition -= 1
    }

    draw()
  }

  // rotate the tetromino
  function rotate() {
    undraw()

    currentRotation++

    if (currentRotation === current.length) {
      currentRotation = 0
    }

    current = tetrominoes[tetrominoIndex][currentRotation]

    draw()
  }

  function isAtRightEdge(current) {
    return current.some((i) => (currentPosition + i) % width === width - 1)
  }

  function isAtLeftEdge(current) {
    return current.some((i) => (currentPosition + i) % width === 0)
  }

  const previewSquares = document.querySelectorAll('.mini-grid div')
  const previewWidth = 4
  let previewIndex = 0

  // The tetrominos without rotations
  const upNext = [
    [1, previewWidth + 1, previewWidth * 2 + 1, 2], //lTetromino
    [0, previewWidth, previewWidth + 1, previewWidth * 2 + 1], //zTetromino
    [1, previewWidth, previewWidth + 1, previewWidth + 2], //tTetromino
    [0, 1, previewWidth, previewWidth + 1], //oTetromino
    [1, previewWidth + 1, previewWidth * 2 + 1, previewWidth * 3 + 1], //iTetromino
  ]

  // Display the next tetromino in the mini-grid preview
  function previewShape() {
    previewSquares.forEach((square) => {
      square.classList.remove(`tetromino-${tetrominoIndex}`)
    })

    const nextTetromino = upNext[nextTetrominoIndex]

    nextTetromino.forEach((i) => {
      const square = previewSquares[previewIndex + i]
      square.classList.add(`tetromino-${nextTetrominoIndex}`)
    })
  }
})
