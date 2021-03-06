import { Component, Inject, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { catchError, finalize } from 'rxjs/internal/operators';
import { throwError } from 'rxjs/index';

import { YoutubeService } from './service/youtube.service';
import { ContextService } from '@shared/context.service';
import { VideoClass } from './models/video.class';
import { ISearchFiltersModel } from '@shared/models/search-filters.interface';
import { appConfig } from 'appConfig';
import { SESSION_STORAGE_TOKEN } from '@shared/tokens/session-storage.token';

@Component({
  selector: 'app-youtube-component',
  templateUrl: './youtube.component.html',
  styleUrls: ['./youtube.component.scss']
})
export class YoutubeComponent implements OnInit {
  public trendingVideos: VideoClass[];
  public loadingError$ = new Subject<boolean>();
  public showMoreVideos: boolean;
  public isVideosLoading = true;
  public nextPageToken: string;
  public currentPage = 0;
  public totalPages = 0;

  constructor(
    private youtubeService: YoutubeService,
    private appContext: ContextService,
    @Inject(SESSION_STORAGE_TOKEN) protected sessionStorage: Storage
  ) {}

  public ngOnInit(): void {
    this.appContext.moduleTitle.next('YOUTUBE');
    this.appContext.showFilterButton.next(true);
    this.initFiltersAndLoad();
    this.appContext.searchFilters.subscribe((filters) => this.resetFiltersAndLoad(filters));
  }

  public onScroll(): void {
    if (this.showMoreVideos) {
      const filters = this.getFilters(undefined);
      this.currentPage++;
      this.loadVideos(filters, this.nextPageToken);
    }
  }

  private initFiltersAndLoad(searchFilters?: ISearchFiltersModel): void {
    this.currentPage = 0;
    this.totalPages = 0;
    this.clearData();
    const filters = this.getFilters(searchFilters);
    this.findTotalPages(filters);
    this.loadVideos(filters);
  }

  private resetFiltersAndLoad(searchFilters: ISearchFiltersModel): void {
    this.currentPage = 0;
    this.totalPages = 0;
    this.clearData();
    this.saveFilters(searchFilters);
    const filters = this.getFilters(searchFilters);
    this.findTotalPages(filters);
    this.loadVideos(filters);
  }

  private findTotalPages(searchFilters: ISearchFiltersModel) {
    this.totalPages = Math.ceil(searchFilters.videosCountPerPage / appConfig.maxVideosToLoad);
  }

  private clearData(): void {
    this.trendingVideos = [];
    this.nextPageToken = null;
    this.isVideosLoading = true;
  }

  private loadVideos(
    searchFilters: ISearchFiltersModel,
    nextPageToken: string = this.nextPageToken
  ): void {
    const isLastPage = this.currentPage === this.totalPages - 1;
    this.youtubeService
      .getTrendingVideos(
        isLastPage,
        searchFilters.selectedRegionCode,
        searchFilters.videosCountPerPage,
        searchFilters.selectedCategoryId,
        nextPageToken
      )
      .pipe(
        finalize(() => (this.isVideosLoading = false)),
        catchError((error) => {
          this.loadingError$.next(true);
          return throwError(error);
        })
      )
      .subscribe((response) => {
        this.trendingVideos = this.trendingVideos.concat(response.items);
        this.nextPageToken = response.nextPageToken;
        this.showMoreVideos =
          !!this.nextPageToken && this.trendingVideos.length < searchFilters.videosCountPerPage;
      });
  }

  private saveFilters(searchFilters: ISearchFiltersModel): void {
    this.sessionStorage.setItem(appConfig.storagFiltersObjectName, JSON.stringify(searchFilters));
  }

  private getFilters(filters: ISearchFiltersModel): ISearchFiltersModel {
    // First check in storage
    const storageFilters = this.sessionStorage.getItem(appConfig.storagFiltersObjectName);
    if (!filters && storageFilters) {
      return JSON.parse(this.sessionStorage.getItem(appConfig.storagFiltersObjectName));
    } else {
      // If filters are set from filters sidebar or there is nothing in storage then construct them
      const regionCode =
        filters && filters.selectedRegionCode
          ? filters.selectedRegionCode
          : appConfig.defaultRegion;
      const videosCountPerPage =
        filters && filters.videosCountPerPage
          ? filters.videosCountPerPage
          : appConfig.maxVideosToLoad;
      const categoryId =
        filters && filters.selectedCategoryId
          ? filters.selectedCategoryId
          : appConfig.defaultCategoryId;
      return {
        selectedRegionCode: regionCode,
        videosCountPerPage,
        selectedCategoryId: categoryId
      };
    }
  }
}
