import { backend } from 'declarations/backend';

let displayValue = '0';
let firstOperand = null;
let operator = null;
let waitingForSecondOperand = false;

const display = document.getElementById('display');

function updateDisplay() {
    display.textContent = displayValue;
}

function inputDigit(digit) {
    if (waitingForSecondOperand) {
        displayValue = digit;
        waitingForSecondOperand = false;
    } else {
        displayValue = displayValue === '0' ? digit : displayValue + digit;
    }
}

function inputDecimal() {
    if (!displayValue.includes('.')) {
        displayValue += '.';
    }
}

function clear() {
    displayValue = '0';
    firstOperand = null;
    operator = null;
    waitingForSecondOperand = false;
}

async function performCalculation() {
    if (operator === null || waitingForSecondOperand) {
        return;
    }

    let result;
    const secondOperand = parseFloat(displayValue);

    try {
        switch (operator) {
            case 'add':
                result = await backend.add(firstOperand, secondOperand);
                break;
            case 'subtract':
                result = await backend.subtract(firstOperand, secondOperand);
                break;
            case 'multiply':
                result = await backend.multiply(firstOperand, secondOperand);
                break;
            case 'divide':
                if (secondOperand === 0) {
                    displayValue = 'Error';
                    updateDisplay();
                    return;
                }
                const divisionResult = await backend.divide(firstOperand, secondOperand);
                result = divisionResult[0];
                break;
        }

        displayValue = String(result);
        firstOperand = result;
    } catch (error) {
        console.error('Calculation error:', error);
        displayValue = 'Error';
    }

    operator = null;
    waitingForSecondOperand = true;
}

document.querySelector('.keypad').addEventListener('click', (event) => {
    const { target } = event;

    if (!target.matches('button')) {
        return;
    }

    if (target.classList.contains('operator')) {
        const nextOperator = target.dataset.action;
        if (firstOperand === null) {
            firstOperand = parseFloat(displayValue);
        } else if (operator) {
            performCalculation();
        }
        operator = nextOperator;
        waitingForSecondOperand = true;
    } else if (target.classList.contains('number')) {
        inputDigit(target.textContent);
    } else if (target.classList.contains('decimal')) {
        inputDecimal();
    } else if (target.classList.contains('clear')) {
        clear();
    } else if (target.classList.contains('equals')) {
        performCalculation();
    }

    updateDisplay();
});

updateDisplay();
