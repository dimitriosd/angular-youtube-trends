import { Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { catchError } from 'rxjs/internal/operators';
import { throwError } from 'rxjs/index';

import { YoutubeService } from './service/youtube.service';
import { ContextService } from '@shared/context.service';
import { VideoClass } from './models/video.class';
import { ISearchFiltersInterface } from '@shared/models/search-filters.interface';
import { appConfig } from 'appConfig';

@Component({
  selector: 'app-youtube-component',
  templateUrl: './youtube.component.html',
  styleUrls: ['./youtube.component.scss']
})
export class YoutubeComponent implements OnInit {
  public trendingVideos: Observable<VideoClass[]>;
  public loadingError$ = new Subject<boolean>();
  public videos: VideoClass[];

  constructor(private youtubeService: YoutubeService, private appContext: ContextService) {}

  public ngOnInit(): void {
    this.appContext.moduleTitle.next('YOUTUBE');
    this.loadVideos();
    this.appContext.searchFilters.subscribe((filters) => this.loadVideos(filters));
  }

  private loadVideos(searchFilters?: ISearchFiltersInterface) {
    const filters = this.getFilters(searchFilters);
    this.trendingVideos = this.youtubeService
      .getTrendingVideos(
        filters.selectedRegionCode,
        filters.videosCountPerPage,
        filters.selectedCategoryId
      )
      .pipe(
        catchError((error: any) => {
          this.loadingError$.next(true);
          return throwError(error);
        })
      );
  }

  private getFilters(filters: ISearchFiltersInterface) {
    const regionCode =
      filters && filters.selectedRegionCode ? filters.selectedRegionCode : appConfig.defaultRegion;
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
