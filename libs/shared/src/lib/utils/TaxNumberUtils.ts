import { AbstractControl, ValidatorFn } from '@angular/forms'

const taxOfficeValidator = (validatorKey: string): ValidatorFn => {
  return (control) => {
    const isValid = taxOfficeChecker(control)
    return isValid ? null : { [validatorKey]: { value: control.value } }
  }
}

const taxOfficeChecker = (control: AbstractControl) => {
  if (!control.value) {
    return false
  }
  let value = control.value.toString()
  if (value.length === 11) {
    let sumOfDigits = 0
    let sumOfEvenDigits = 0
    let sumOfOddDigits = 0
    for (let i = 0; i < 10; i++) {
      sumOfDigits += Number(value.substr(i, 1))
      if (i % 2 === 0) {
        sumOfEvenDigits += Number(value.substr(i, 1))
      } else if (i !== 9) {
        sumOfOddDigits += Number(value.substr(i, 1))
      }
    }
    const noZeroFirst = Number(value.substr(0, 1)) !== 0
    const lastDigitRule = sumOfDigits % 10 === Number(value.substr(10, 1))
    const modularRule = (((sumOfEvenDigits * 7 - sumOfOddDigits) % 10) + 10) % 10 === Number(value.substr(9, 1))
    return noZeroFirst && lastDigitRule && modularRule
  } else {
    while (value.length < 10) {
      value = '0' + value
    }
    const characters = String(value).split('')
    const paddedTaxNumberNumerals = characters.map(function (char) {
      return Number(char)
    })
    let sum = 0
    for (let index = 0; index < 9; index++) {
      const tmp = (paddedTaxNumberNumerals[index] + (9 - index)) % 10
      sum += tmp === 9 ? tmp : (tmp * Math.pow(2, 9 - index)) % 9
    }
    const lastNumeral = paddedTaxNumberNumerals[9]
    return lastNumeral === (10 - (sum % 10)) % 10
  }
}

export { taxOfficeValidator }
