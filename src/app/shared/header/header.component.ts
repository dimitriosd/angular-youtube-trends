import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { ContextService } from '../context.service';

@Component({
  selector: 'app-page-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Output() public filterSlideOpen: EventEmitter<boolean> = new EventEmitter();
  public title$: Subject<string> = this.appContext.moduleTitle;
  public showFilterButton$: Subject<boolean> = this.appContext.showFilterButton;

  constructor(private appContext: ContextService) {}

  public open() {
    this.filterSlideOpen.emit();
  }
}
