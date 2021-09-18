import { ElementRef } from '@angular/core'

function extractInputsFromNodeList(form: ElementRef<HTMLFormElement>) {
  const inputs = []
  form.nativeElement.querySelectorAll('input').forEach(el => {
    inputs.push(el)
  })
  return inputs
}

export { extractInputsFromNodeList }