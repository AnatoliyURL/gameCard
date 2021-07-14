(function () {
  const CLASS_GAME_BLOCK = 'game-block'

  function createGameTitle(title) {
    let gameTitle = document.createElement('h2')
    gameTitle.innerText = title
    return gameTitle
  }

  function createGameBlock() {
    let gameBlock = document.createElement('div')
    gameBlock.classList.add('container', CLASS_GAME_BLOCK)

    return gameBlock
  }

  function createCardsRow(arrCards) {
    let gameRow = document.createElement('div')
    gameRow.classList.add('row', 'justify-content-around')

    for (const card of arrCards) {
      gameRow.append(card)
    }

    return gameRow
  }

  function createGameCard(numberCard) {
    let gameCard = document.createElement('div')
    gameCard.innerText = numberCard
    gameCard.classList.add('col', 'card')

    return gameCard
  }

  function generatePairsValues(size) {
    let pairsValues = []

    for (let i = 1; i <= (size * size)/2; i++) {
      pairsValues.push(i)
      pairsValues.push(i)
    }

    return shuffleFisherYates(pairsValues)
  }


  function shuffleFisherYates(array) {
    let randomIndex
    let currentIndex = array.length

    while (0 !== currentIndex) {

      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--

      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]]
    }

    return array
  }

  function generatePage() {
    let div = document.createElement('div')
    let row = document.createElement('div')
    let title = createGameTitle('Игра на выживание')
    let form = createForm();

    row.classList.add('row')
    div.classList.add('container')

    form.buttonReseat.disabled = true
    form.buttonStart.disabled = true

    form.input.addEventListener('input',function () {
      if (form.input.value.match(/4|6|8|10|12/)) {
        form.buttonReseat.disabled = true
        form.buttonStart.disabled = false
      } else  {
        form.buttonReseat.disabled = true
        form.buttonStart.disabled = true
      }
    })

    form.form.addEventListener('submit', function (e) {

      e.preventDefault();

      stopTimer()

      const shuffleArr = generatePairsValues(form.input.value)
      restartGame(shuffleArr, form.input.value)
      form.buttonStart.disabled = true
      startTimer(60000)

    })

    div.append(row)
    row.append(title)
    row.append(form.form)

    document.body.append(div)
  }

  function createForm() {
    let form = document.createElement('form')
    let input = document.createElement('input')
    let buttonWrapper = document.createElement('div')
    let buttonStart = document.createElement('button')
    let buttonReseat = document.createElement('button')

    form.classList.add('input-group', 'mb-3')
    input.classList.add('form-control')
    input.placeholder = 'Кол-во карточек по вертикали/горизонтали (4-12)'
    input.type = 'number'
    input.required = true
    buttonWrapper.classList.add('input-group-append')
    buttonStart.classList.add('btn', 'btn-primary', 'btn-group', 'btn-start')
    buttonStart.textContent = 'Начать игру'

    buttonReseat.classList.add('btn', 'btn-warning', 'btn-group', 'btn-restart')
    buttonReseat.textContent = 'Перезапустить игру'

    buttonWrapper.append(buttonReseat)
    buttonWrapper.append(buttonStart)
    form.append(input)
    form.append(buttonWrapper)

    return {
      form,
      input,
      buttonStart,
      buttonReseat
    }
  }

  function deleteGame() {
    let gameBlock = document.querySelector(`.${CLASS_GAME_BLOCK}`)
    gameBlock ? gameBlock.remove() : ''
  }

  function startGame(shuffleArr, size) {
    let GameState = {
      FirstPickCard: 'firstPickCard',
      SecondPickCard: 'secondPickCard',
      TwoUpCards: 'twoUpCards',
      TwoUpCardsSame: 'twoUpCardsSame',
      TwoUpCardsNotSame: 'twoUpCardsNotSame',
      DoubleClick: 'doubleClick',
      AllCardsOpen: 'allCardsOpen',
    }

    let currentGameState = GameState.FirstPickCard

    let firstPickCard = null
    let counterOpenCard = 0

    let gameZone = createGameBlock()

    document.body.append(gameZone)

    let chunkArr = splitArrayIntoChunksOfLen(shuffleArr, size)

    for (const row of chunkArr) {

      let rowArr = []

      for (const number of row) {
        let card = createGameCard(number)

        card.addEventListener('click', function () {

          switch (currentGameState) {
            case GameState.FirstPickCard:
              card.classList.toggle('open')
              counterOpenCard++
              firstPickCard = {card, number};
              currentGameState = GameState.SecondPickCard
              break

            case GameState.SecondPickCard:
              card.classList.toggle('open')
              counterOpenCard++
              currentGameState = GameState.TwoUpCards

              switch (currentGameState) {
                case GameState.TwoUpCards:
                  if (firstPickCard.number === number) {
                    currentGameState = GameState.TwoUpCardsSame
                  } else {
                    currentGameState = GameState.TwoUpCardsNotSame
                  }

                  switch (currentGameState) {
                    case GameState.TwoUpCardsSame:
                      firstPickCard = null
                      currentGameState = GameState.FirstPickCard
                      if (counterOpenCard === shuffleArr.length) {
                        currentGameState = GameState.AllCardsOpen

                        switch (currentGameState) {
                          case GameState.AllCardsOpen:
                            document.querySelector('.btn-restart').disabled = false
                            stopTimer(startTimer)
                            break
                        }
                      }
                      break

                    case GameState.TwoUpCardsNotSame:
                      window.setTimeout(function () {
                        card.classList.toggle('open')
                        firstPickCard.card.classList.toggle('open')
                        counterOpenCard -= 2
                        firstPickCard = null
                        currentGameState = GameState.FirstPickCard
                      }, 500);
                      currentGameState = GameState.DoubleClick
                      break
                  }
                  break
              }
              break

            case GameState.DoubleClick:
              break
          }
        })
        rowArr.push(card)
      }

      gameZone.append(createCardsRow(rowArr))
    }

    return gameZone
  }

  function restartGame(shuffleArr, size) {
    deleteGame()
    startGame(shuffleArr, size)
  }

  function disableGame() {
    let gameBlock = document.querySelector(`.${CLASS_GAME_BLOCK}`)
    gameBlock.classList.add('disabled-game')
    document.querySelector('.btn-start').disabled = false
    alert('Игра на выживание окончена')
  }

  function startTimer(time) {
    generateTimerBlock(time)
    window.timer = setTimeout(disableGame, time);
  }

  function stopTimer() {
    clearTimeout(window.timer)
  }

  function generateTimerBlock(time) {
    if (document.querySelector(".timer-block")) {
      document.querySelector(".timer-block").remove()
    }
    stopInterval()

    let block = document.createElement('div')
    let strTime = document.createElement('p')

    block.classList.add('timer-block')
    strTime.classList.add('time-str')
    strTime.innerText = time/1000

    block.append(strTime)

    document.body.append(block)

    startInterval()
  }

  function changeIntervalText() {
    let time = document.querySelector('.time-str')
    time.innerText <= 0 ? stopInterval() : --time.innerText
  }

  function startInterval() {
    window.interval = setInterval(changeIntervalText , 1000);
  }

  function stopInterval() {
    clearInterval(window.interval)
  }

  function splitArrayIntoChunksOfLen(arr, size) {
    return arr.reduce((acc, e, i) => (i % size ? acc[acc.length - 1].push(e) : acc.push([e]), acc), [])
  }

  generatePage()

})()
