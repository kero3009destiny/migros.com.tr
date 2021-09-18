import { Pipe, PipeTransform } from '@angular/core'

interface IRegexpObject {
  regex: string
  prefix: string
}

@Pipe({
  name: 'feRestUrl',
})
export class RestUrlPipe implements PipeTransform {
  private _restUrlRegexs: Array<IRegexpObject> = [
    { regex: '.*-p-[0-9a-fA-F]+', prefix: 'product/detail' },
    { regex: '.*-c-[0-9a-fA-F]+', prefix: 'product/category' },
    { regex: '.*-l-[0-9a-fA-F]+', prefix: 'campaign' }, // TODO: We don't know yet, what are thoose?
    { regex: '.*-x-[0-9a-fA-F]+', prefix: 'campaign' }, // TODO: We don't know yet, what are thoose?
    { regex: '.*-dt-[0-9a-fA-F]+', prefix: 'campaign' }, // TODO: We don't know yet, what are thoose?
    { regex: '.*-g-[0-9a-fA-F]+', prefix: 'campaign' }, // TODO: We don't know yet, what are thoose?
    { regex: '.*-b-[0-9a-fA-F]+', prefix: 'campaign' }, // TODO: We don't know yet, what are thoose?
  ]
  transform(value: any) {
    // TODO: make split regex with "-"
    const getMatch = (urlValue: string) => {
      const matchedRegexObject = this._restUrlRegexs.find(item => {
        return value.match(item.regex)
      })

      const hexValue = urlValue.split('-').splice(-1)[0]
      const decValue = this.hexToDec(hexValue)

      return `/${matchedRegexObject.prefix}/${decValue}`
    }

    return getMatch(value)
  }

  private hexToDec(s) {
    const digits = [0]
    let i, j, carry
    for (i = 0; i < s.length; i += 1) {
      carry = parseInt(s.charAt(i), 16)
      for (j = 0; j < digits.length; j += 1) {
        digits[j] = digits[j] * 16 + carry
        // tslint:disable-next-line:no-bitwise
        carry = (digits[j] / 10) | 0
        digits[j] %= 10
      }
      while (carry > 0) {
        digits.push(carry % 10)
        // tslint:disable-next-line:no-bitwise
        carry = (carry / 10) | 0
      }
    }
    return digits.reverse().join('')
  }
}
