import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

import { appConfig } from 'appConfig';
import { ICountryListModel } from '@shared/models/country-list.interface';
import { ContextService } from '@shared/context.service';
import { Observable, throwError } from 'rxjs';
import { VideoCategoryClass } from '@modules/youtube/models/video-category.class';
import { catchError, filter, map, startWith } from 'rxjs/operators';
import { YoutubeService } from '@modules/youtube/service/youtube.service';
import { ISearchFiltersInterface } from '@shared/models/search-filters.interface';

@Component({
  selector: 'app-slide-filters',
  templateUrl: './slide-filters.component.html',
  styleUrls: ['./slide-filters.component.scss']
})
export class SlideFiltersComponent implements OnInit {
  @Output() public filterSlideClose: EventEmitter<any> = new EventEmitter();
  public countryFormControl: FormControl = new FormControl();
  public countryList: ICountryListModel[] = appConfig.countryList;
  public filteredCountries: Observable<ICountryListModel[]>;

  public categoryFormControl: FormControl = new FormControl();
  public videoCategories: VideoCategoryClass[];
  public filteredCategories: Observable<VideoCategoryClass[]>;

  public defaultVideosOnPage: number = appConfig.maxVideosToLoad;

  constructor(private appContext: ContextService, private youtubeService: YoutubeService) {}

  public ngOnInit() {
    this.setCountries();
    this.loadCategories('US', false);
  }

  public onChangeVideosPerPage(count: number) {
    const filters: ISearchFiltersInterface = {
      videosCountPerPage: count,
      selectedRegionCode: this.getCountryCode(this.countryFormControl.value),
      selectedCategoryId: this.getCategoryId(this.categoryFormControl.value)
    };
    this.appContext.searchFilters.next(filters);
  }

  public close() {
    this.filterSlideClose.emit();
  }

  public onCountryChange(value: string) {
    const countryCode = this.getCountryCode(value);
    this.loadCategories(countryCode, true);
  }

  public onCategoryChange(value: string) {
    const filters: ISearchFiltersInterface = {
      videosCountPerPage: this.defaultVideosOnPage,
      selectedRegionCode: this.getCountryCode(this.countryFormControl.value),
      selectedCategoryId: this.getCategoryId(value)
    };
    this.appContext.searchFilters.next(filters);
  }

  private getCountryCode(name) {
    return this.countryList.find((country) => country.name === name).code;
  }

  private getCategoryId(title) {
    if (title) {
      const category = this.videoCategories.find((item) => item.title === title);
      return category ? category.id : undefined;
    }
    return undefined;
  }

  private setCountries() {
    this.filteredCountries = this.countryFormControl.valueChanges.pipe(
      startWith<string | ICountryListModel>(''),
      map((value) => (typeof value === 'string' ? value : value.name)),
      map((name) => (name ? this.filterCountries(name) : this.countryList.slice()))
    );
    const defaultCountry = this.countryList.find(
      (country) => country.code === appConfig.defaultRegion
    ).name;
    this.countryFormControl.setValue(defaultCountry);
  }

  private loadCategories(regionCode: string, refresh: boolean) {
    this.videoCategories = [];
    this.youtubeService
      .getVideoCategories(regionCode)
      .pipe(
        catchError((error: any) => {
          return throwError(error);
        })
      )
      .subscribe((videoCategories) => {
        this.videoCategories = videoCategories;
        this.setCategories();
        if (refresh) {
          const filters: ISearchFiltersInterface = {
            videosCountPerPage: this.defaultVideosOnPage,
            selectedRegionCode: this.getCountryCode(this.countryFormControl.value),
            selectedCategoryId: this.getCategoryId(this.categoryFormControl.value)
          };
          this.appContext.searchFilters.next(filters);
        }
      });
  }

  private setCategories() {
    this.filteredCategories = this.categoryFormControl.valueChanges.pipe(
      startWith<string | VideoCategoryClass>(''),
      filter((value) => !!value),
      map((value) => (typeof value === 'string' ? value : value.title)),
      map((title) => (title ? this.filterCategories(title) : this.videoCategories.slice()))
    );
    this.videoCategories[0]
      ? this.categoryFormControl.setValue(this.videoCategories[0].title)
      : this.categoryFormControl.setValue(null);
  }

  private filterCountries(value: string): ICountryListModel[] {
    const filterValue = value.toLowerCase();

    return this.countryList.filter(
      (country) => country.name.toLowerCase().indexOf(filterValue) === 0
    );
  }

  private filterCategories(value: string): VideoCategoryClass[] {
    const filterValue = value.toLowerCase();

    return this.videoCategories.filter(
      (category) => category.title.toLowerCase().indexOf(filterValue) === 0
    );
  }
}
