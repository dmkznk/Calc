document.addEventListener("DOMContentLoaded", () => {
  initCalc(
    ".calc_screen",
    ".number",
    ".operator",
    ".equal",
    ".clear",
    "button",
    ".sound_on-off",
    "./sound/button-35.mp3"
  )
})

const initCalc = (
  calclScreenSelector,
  numbersSelector,
  operatorsSelector,
  equalBtnlSelector,
  clearBtnSelector,
  allButtonsSelector,
  soundBtnSelector,
  soundLinkSelector
) => {
  const LOCAL_STORAGE_KEY = "savedState"

  let state = getFromLS(LOCAL_STORAGE_KEY) || {
    a: "0",
    b: "",
    operator: "",
    isOperator: false,
    numbersOnScreen: "",
    result: "",
    isSound: false,
  }

  const initialState = {
    a: "0",
    b: "",
    operator: "",
    isOperator: false,
    numbersOnScreen: "",
    result: "",
    isSound: false,
  }

  const screen = document.querySelector(calclScreenSelector)
  const numbers = document.querySelectorAll(numbersSelector)
  const operators = document.querySelectorAll(operatorsSelector)
  const equelBtn = document.querySelector(equalBtnlSelector)
  const clearBtn = document.querySelector(clearBtnSelector)
  const allButtons = document.querySelectorAll(allButtonsSelector)
  const soundBtn = document.querySelector(soundBtnSelector)
  const sound = new Audio(soundLinkSelector)
  sound.volume = 0.2
  soundBtn.checked = state.isSound

  soundBtn.addEventListener("click", () => {
    state.isSound = soundBtn.checked
    setToLS(LOCAL_STORAGE_KEY, state)
  })

  const onSound = () => {
    if (state.isSound) sound.play()
  }

  allButtons.forEach(i => {
    i.addEventListener("click", () => {
      onSound()
    })
  })

  numbers.forEach(i => {
    i.addEventListener("click", () => {
      calcNumbers(i.value)
    })
  })

  operators.forEach(i => {
    i.addEventListener("click", () => {
      calcOperators(i.value)
    })
  })

  const calcNumbers = value => {
    if (!state.isOperator) state.a += value
    else state.b += value

    state.numbersOnScreen += value
    render(screen, state.numbersOnScreen)
  }

  const calcOperators = value => {
    if (state.operator.length >= 1) return
    if (state.a.length === 1 && value !== "-") return
    state.isOperator = true
    state.operator = value

    if (state.a.length === 1 && state.operator === "-") {
      state.a = state.operator
      state.operator = ""
      state.isOperator = false
      state.numbersOnScreen = state.a
    }

    state.numbersOnScreen += state.operator
    render(screen, state.numbersOnScreen)
  }

  const equel = () => {
    if (!+state.a || !+state.b) return

    switch (state.operator) {
      case "+":
        state.result = parseFloat(state.a) + parseFloat(state.b)
        break
      case "-":
        state.result = parseFloat(state.a) - parseFloat(state.b)
        break
      case "*":
        state.result = parseFloat(state.a) * parseFloat(state.b)
        break
      case "/":
        state.result = parseFloat(state.a) / parseFloat(state.b)
    }
    render(screen, state.result)
    clear()
  }
  equelBtn.addEventListener("click", equel)

  const clear = triger => {
    if (triger === "Backspace") {
      state.numbersOnScreen = state.numbersOnScreen.slice(0, -1)

      if (state.isOperator && !state.b) {
        state.operator = ""
      }

      if (state.isOperator) {
        state.b = state.b.slice(0, -1)
      } else {
        state.a = state.a.slice(0, -1)
      }

      if (!state.b && !state.operator) {
        state.isOperator = false
      }
      render(screen, state.numbersOnScreen), onSound()
    } else {
      const isSound = state.isSound
      const result = state.result
      state = {
        ...initialState,
        a: state.result,
        numbersOnScreen: state.result,
        isSound,
      }
      render(screen, state.a)

      setToLS(LOCAL_STORAGE_KEY, { ...state, result, isSound })
    }

    if (triger === "KeyC") {
      const isSound = soundBtn.checked
      setToLS(LOCAL_STORAGE_KEY, { ...state, isSound })
      state = { ...initialState, isSound }
      render(screen, (state.a = "0"))
    }
  }

  clearBtn.addEventListener("click", () => clear("KeyC"))

  const render = (screen, numbersOnScreen) => {
    screen.textContent = numbersOnScreen
    setToLS(LOCAL_STORAGE_KEY, state)
  }

  const setToLS = (key, state) => {
    localStorage.setItem(key, JSON.stringify(state))
  }

  function getFromLS(key) {
    return JSON.parse(localStorage.getItem(key))
  }

  const keyPress = (eKey, eCode) => {
    switch (eKey) {
      case "=":
        equel(), onSound()
        break
      case "c" || "C":
        clear("KeyC"), onSound()
        break
      case "m" || "M":
        state.isSound = soundBtn.checked = false
        break
      case "v" || "V":
        state.isSound = soundBtn.checked = true
        break
    }
    if (eCode === "Backspace") clear("Backspace"), onSound()

    if (eKey.match(/[0-9.]/)) calcNumbers(eKey), onSound()
    else if (eKey.match(/[/*+-]/)) calcOperators(eKey), onSound()
  }

  document.addEventListener("keydown", e => {
    keyPress(e.key, e.code)
  })

  const isLS = () => {
    if (!state.result && !state.numbersOnScreen) return state.a
    else if (state.result && state.numbersOnScreen) return state.numbersOnScreen

    if (!state.result) return state.numbersOnScreen
    else if (state.result) return state.result
  }

  render(screen, isLS())
}
