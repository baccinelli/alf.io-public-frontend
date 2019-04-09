import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-additional-field',
  templateUrl: './additional-field.component.html',
  styleUrls: ['./additional-field.component.scss']
})
export class AdditionalFieldComponent {

  @Input()
  field: any;

  @Input()
  form: FormGroup;

  @Input()
  ticket: any;

  constructor() { }
}