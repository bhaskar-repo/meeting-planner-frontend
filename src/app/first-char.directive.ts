import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appFirstChar]'
})
export class FirstCharDirective {

  constructor(private _el: ElementRef) {
    this._el.nativeElement.style.borderRadius = "100%";
    this._el.nativeElement.style.lineHeight = "1em";
    this._el.nativeElement.style.padding = "1em";
    this._el.nativeElement.style.textAlign = "center";
    this._el.nativeElement.style.margin = "0em";
    this._el.nativeElement.style.width = "3em";
    this._el.nativeElement.style.height = "3em";
    this._el.nativeElement.style.textTransform = "uppercase";
   }

}
