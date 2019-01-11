import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { ISearchFiltersModel } from '@shared/models/search-filters.interface';

@Injectable()
export class ContextService {
  public moduleTitle: Subject<string> = new Subject<string>();
  public searchFilters: Subject<ISearchFiltersModel> = new Subject<ISearchFiltersModel>();
  public showFilterButton: Subject<boolean> = new Subject<boolean>();
}
