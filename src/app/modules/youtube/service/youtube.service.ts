import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/internal/operators';

import { appConfig } from 'appConfig';
import { VideoClass } from '../models/video.class';
import { VideoCategoryClass } from '@modules/youtube/models/video-category.class';

@Injectable({ providedIn: 'root' })
export class YoutubeService {
  constructor(private http: HttpClient) {}

  public getTrendingVideos(
    regionCode: string,
    videosPerPage?: number,
    videoCategoryId?: string
  ): Observable<VideoClass[]> {
    return this.http
      .get<VideoClass>(appConfig.getYoutubeEndPoint('videos'), {
        params: {
          part: appConfig.partsToLoad,
          chart: appConfig.chart,
          ...(videoCategoryId && { videoCategoryId }),
          regionCode,
          maxResults: videosPerPage
            ? videosPerPage.toString()
            : appConfig.maxVideosToLoad.toString(),
          key: appConfig.youtubeApiKey
        }
      })
      .pipe(
        map((data) =>
          data.items.map((item) => new VideoClass(item)).filter((item) => item.id !== '')
        ),
        catchError(this.handleError('getTrendingVideos'))
      );
  }

  public getVideoCategories(regionCode: string): Observable<VideoCategoryClass[]> {
    return this.http
      .get<VideoCategoryClass>(appConfig.getYoutubeEndPoint('videoCategories'), {
        params: {
          part: appConfig.partsToLoadCategories,
          key: appConfig.youtubeApiKey,
          regionCode
        }
      })
      .pipe(
        map((data) =>
          data.items.map((item) => new VideoCategoryClass(item)).filter((item) => item.id !== '')
        ),
        catchError(this.handleError('getTrendingVideos'))
      );
  }

  private handleError(operation: string = 'operation') {
    return (error: any) => {
      error.operation = operation;
      return throwError(error);
    };
  }
}
