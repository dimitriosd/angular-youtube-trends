import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { ISearchFiltersInterface } from '@shared/models/search-filters.interface';

@Injectable()
export class ContextService {
  public moduleTitle: Subject<string> = new Subject<string>();
  public searchFilters: Subject<ISearchFiltersInterface> = new Subject<ISearchFiltersInterface>();
}
