import { Component, EventEmitter, Inject, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

import { appConfig } from 'appConfig';
import { ICountryListModel } from '@shared/models/country-list.interface';
import { ContextService } from '@shared/context.service';
import { Observable, Subject, throwError } from 'rxjs';
import { VideoCategoryClass } from '@modules/youtube/models/video-category.class';
import { catchError, map, startWith, takeUntil } from 'rxjs/operators';
import { YoutubeService } from '@modules/youtube/service/youtube.service';
import { ISearchFiltersModel } from '@shared/models/search-filters.interface';
import { SESSION_STORAGE_TOKEN } from '@shared/tokens/session-storage.token';

@Component({
  selector: 'app-slide-filters',
  templateUrl: './slide-filters.component.html',
  styleUrls: ['./slide-filters.component.scss']
})
export class SlideFiltersComponent implements OnInit, OnDestroy {
  @Output() public filterSlideClose: EventEmitter<boolean> = new EventEmitter();
  public countryFormControl: FormControl = new FormControl();
  public countryList: ICountryListModel[] = appConfig.countryList;
  public filteredCountries: Observable<ICountryListModel[]>;

  public categoryFormControl: FormControl = new FormControl();
  public videoCategories: VideoCategoryClass[];
  public filteredCategories: Observable<VideoCategoryClass[]>;

  public defaultVideosOnPage: number;
  public readonly destroy$ = new Subject();

  constructor(
    private appContext: ContextService,
    private youtubeService: YoutubeService,
    @Inject(SESSION_STORAGE_TOKEN) protected sessionStorage: Storage
  ) {}

  public ngOnInit(): void {
    this.setCountries();
    this.defaultVideosOnPage = this.getVideosToLoadFromStorage();
    this.loadCategories(this.getCountryCode(this.countryFormControl.value), false);
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public onChangeVideosPerPage(count: number): void {
    const filters: ISearchFiltersModel = {
      videosCountPerPage: count,
      selectedRegionCode: this.getCountryCode(this.countryFormControl.value),
      selectedCategoryId: this.getCategoryId(this.categoryFormControl.value)
    };
    this.appContext.searchFilters.next(filters);
  }

  public close(): void {
    this.filterSlideClose.emit();
  }

  public onCountryChange(value: string): void {
    const countryCode = this.getCountryCode(value);
    // We assume that each time we change country the categories for this country should be loaded
    this.loadCategories(countryCode, true);
  }

  public onCategoryChange(value: string): void {
    const filters: ISearchFiltersModel = {
      videosCountPerPage: this.defaultVideosOnPage,
      selectedRegionCode: this.getCountryCode(this.countryFormControl.value),
      selectedCategoryId: this.getCategoryId(value)
    };
    this.appContext.searchFilters.next(filters);
  }

  private getCountryCode(name): string {
    const country = this.countryList.find((item) => item.name === name);
    // If user types wrong country we make the regionCode the default one to prevent errors
    return country ? country.code : appConfig.defaultRegion;
  }

  private getCategoryId(title): string | undefined {
    if (title) {
      const category = this.videoCategories.find((item) => item.title === title);
      return category ? category.id : undefined;
    }
    return undefined;
  }

  private getCountryFilterFromStorage(): string {
    const searchFilter = JSON.parse(this.sessionStorage.getItem(appConfig.storagFiltersObjectName));
    const defaultCountry = this.countryList.find(
      (country) => country.code === appConfig.defaultRegion
    ).name;
    if (searchFilter) {
      return this.countryList.find(
        (country) => country.code === searchFilter[appConfig.storageFiltersCountry]
      ).name;
    }
    return defaultCountry;
  }

  private getCategoryFilterFromStorage(): string {
    const searchFilter = JSON.parse(this.sessionStorage.getItem(appConfig.storagFiltersObjectName));
    return searchFilter
      ? searchFilter[appConfig.storageFiltersCategory]
      : appConfig.defaultCategoryId;
  }

  private getVideosToLoadFromStorage(): number {
    const searchFilter = JSON.parse(this.sessionStorage.getItem(appConfig.storagFiltersObjectName));
    return searchFilter
      ? searchFilter[appConfig.storageFiltersVideosCountPerPage]
      : appConfig.maxVideosToLoad;
  }

  private setCountries(): void {
    this.filteredCountries = this.countryFormControl.valueChanges.pipe(
      startWith<string | ICountryListModel>(''),
      map((value) => (typeof value === 'string' ? value : value.name)),
      map((name) => (name ? this.filterCountries(name) : this.countryList.slice()))
    );
    this.countryFormControl.setValue(this.getCountryFilterFromStorage());
  }

  private loadCategories(regionCode: string, refresh: boolean): void {
    this.videoCategories = [];
    this.youtubeService
      .getVideoCategories(regionCode)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          return throwError(error);
        })
      )
      .subscribe((videoCategories) => {
        this.videoCategories = videoCategories;
        this.addDefaultCategoryIfNotExists();
        this.setCategories();
        if (refresh) {
          const filters: ISearchFiltersModel = {
            videosCountPerPage: this.defaultVideosOnPage,
            selectedRegionCode: this.getCountryCode(this.countryFormControl.value),
            selectedCategoryId: this.getCategoryId(this.categoryFormControl.value)
          };
          this.appContext.searchFilters.next(filters);
        }
      });
  }

  private addDefaultCategoryIfNotExists(): void {
    // We assume that all countries have a default category Music
    const defaultCategoryId = appConfig.defaultCategoryId;
    const categoryExists = this.videoCategories.some(
      (category) => category.id === defaultCategoryId
    );
    if (!categoryExists) {
      this.videoCategories.push({
        id: defaultCategoryId,
        title: appConfig.defaultCategoryName
      });
    }
  }

  private setCategories(): void {
    this.filteredCategories = this.categoryFormControl.valueChanges.pipe(
      startWith<string | VideoCategoryClass>(''),
      map((value) => (typeof value === 'string' ? value : value.title)),
      map((title) => (title ? this.filterCategories(title) : this.videoCategories.slice()))
    );
    const selectedCategoryId = this.getCategoryFilterFromStorage();
    const selectedCategory = this.videoCategories.find(
      (category) => category.id === selectedCategoryId
    );
    this.categoryFormControl.setValue(
      selectedCategory ? selectedCategory.title : appConfig.defaultCategoryName
    );
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
