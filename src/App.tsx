import { useState } from 'react'
import './App.css'

type ThemeMode = 'dark' | 'light'

type ButtonSpec = {
  label: string
  value: string
  variant?: 'operator' | 'action' | 'number' | 'equals'
}

const buttonRows: ButtonSpec[][] = [
  [
    { label: 'C', value: 'clear', variant: 'action' },
    { label: '±', value: 'sign', variant: 'action' },
    { label: '%', value: 'percent', variant: 'action' },
    { label: '÷', value: '/', variant: 'operator' },
  ],
  [
    { label: '7', value: '7', variant: 'number' },
    { label: '8', value: '8', variant: 'number' },
    { label: '9', value: '9', variant: 'number' },
    { label: '×', value: '*', variant: 'operator' },
  ],
  [
    { label: '4', value: '4', variant: 'number' },
    { label: '5', value: '5', variant: 'number' },
    { label: '6', value: '6', variant: 'number' },
    { label: '-', value: '-', variant: 'operator' },
  ],
  [
    { label: '1', value: '1', variant: 'number' },
    { label: '2', value: '2', variant: 'number' },
    { label: '3', value: '3', variant: 'number' },
    { label: '+', value: '+', variant: 'operator' },
  ],
  [
    { label: '0', value: '0', variant: 'number' },
    { label: '.', value: '.', variant: 'number' },
    { label: '=', value: '=', variant: 'equals' },
  ],
]

const formatDisplayValue = (value: string): string => {
  if (!value || value === '-') return '0'

  const number = Number(value)
  if (!Number.isFinite(number)) return '0'

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 10,
  }).format(number)
}

const calculate = (left: number, right: number, operator: string): number => {
  switch (operator) {
    case '+':
      return left + right
    case '-':
      return left - right
    case '*':
      return left * right
    case '/':
      return right === 0 ? 0 : left / right
    default:
      return right
  }
}

function App() {
  const [theme, setTheme] = useState<ThemeMode>('dark')
  const [display, setDisplay] = useState('0')
  const [storedValue, setStoredValue] = useState<number | null>(null)
  const [pendingOperator, setPendingOperator] = useState<string | null>(null)
  const [justEvaluated, setJustEvaluated] = useState(false)

  const handleDigitInput = (digit: string) => {
    if (justEvaluated) {
      setDisplay(digit)
      setJustEvaluated(false)
      return
    }

    setDisplay((current) => (current === '0' ? digit : current + digit))
  }

  const handleDecimalInput = () => {
    if (justEvaluated) {
      setDisplay('0.')
      setJustEvaluated(false)
      return
    }

    setDisplay((current) => (current.includes('.') ? current : `${current}.`))
  }

  const handleOperatorInput = (operator: string) => {
    const currentValue = Number(display)

    if (storedValue === null) {
      setStoredValue(currentValue)
      setPendingOperator(operator)
      setDisplay('0')
      return
    }

    if (pendingOperator) {
      const result = calculate(storedValue, currentValue, pendingOperator)
      setStoredValue(result)
      setDisplay(String(result))
    }

    setPendingOperator(operator)
    setJustEvaluated(false)
  }

  const handleEquals = () => {
    if (storedValue === null || pendingOperator === null) return

    const currentValue = Number(display)
    const result = calculate(storedValue, currentValue, pendingOperator)
    setStoredValue(null)
    setPendingOperator(null)
    setDisplay(String(result))
    setJustEvaluated(true)
  }

  const handleClear = () => {
    setDisplay('0')
    setStoredValue(null)
    setPendingOperator(null)
    setJustEvaluated(false)
  }

  const handleToggleSign = () => {
    setDisplay((current) => String(Number(current) * -1))
  }

  const handlePercent = () => {
    setDisplay((current) => String(Number(current) / 100))
  }

  const handleButtonClick = (button: ButtonSpec) => {
    if (button.variant === 'number') {
      if (button.value === '.') {
        handleDecimalInput()
      } else {
        handleDigitInput(button.value)
      }
      return
    }

    switch (button.value) {
      case 'clear':
        handleClear()
        break
      case 'sign':
        handleToggleSign()
        break
      case 'percent':
        handlePercent()
        break
      case '=':
        handleEquals()
        break
      default:
        handleOperatorInput(button.value)
        break
    }
  }

  return (
    <div className={`app-shell ${theme}`}>
      <div className="calculator-scene" aria-label="Calculator mockup">
        <span className="orbit orbit-left" aria-hidden="true" />
        <span className="orbit orbit-right" aria-hidden="true" />

        <div className={`calculator-card ${theme}`}>
          <div className="calculator-topbar">
            <span className="status-dot" aria-hidden="true" />
            <button
              type="button"
              className="theme-toggle"
              onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
              aria-label="Toggle color theme"
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>

          <div className="display-panel">
            <div className="display-meta">{theme === 'dark' ? 'A 900' : 'C 850'}</div>
            <div className="display-value">{formatDisplayValue(display)}</div>
          </div>

          <div className="keypad">
            {buttonRows.map((row, rowIndex) => (
              <div key={`row-${rowIndex}`} className="key-row">
                {row.map((button) => (
                  <button
                    key={`${button.label}-${button.value}`}
                    type="button"
                    className={`key ${button.variant ?? 'number'}`}
                    onClick={() => handleButtonClick(button)}
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
