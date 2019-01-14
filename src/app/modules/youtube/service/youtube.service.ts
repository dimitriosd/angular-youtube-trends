import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/internal/operators';

import { appConfig } from 'appConfig';
import { VideoClass } from '../models/video.class';
import { VideoCategoryClass } from '@modules/youtube/models/video-category.class';
import { IVideoListResponseModel } from '../models/video-list-response.interface';

@Injectable({ providedIn: 'root' })
export class YoutubeService {
  constructor(private http: HttpClient) {}

  public getTrendingVideos(
    isLastPage: boolean,
    regionCode: string,
    videosPerPage?: number,
    videoCategoryId?: string,
    pageToken?: string
  ): Observable<IVideoListResponseModel> {
    return this.http
      .get<IVideoListResponseModel>(appConfig.getYoutubeEndPoint('videos'), {
        params: {
          part: appConfig.partsToLoad,
          chart: appConfig.chart,
          ...(videoCategoryId && { videoCategoryId }),
          regionCode,
          ...(pageToken && { pageToken }),
          maxResults: this.getMaxVideosToLoad(videosPerPage, isLastPage),
          key: appConfig.youtubeApiKey
        }
      })
      .pipe(
        map((data) => {
          const returnData = {
            items: data.items.map((item) => new VideoClass(item)).filter((item) => item.id !== ''),
            nextPageToken: data.nextPageToken,
            pageInfo: {
              totalResults: data.pageInfo.totalResults,
              resultsPerPage: data.pageInfo.resultsPerPage
            }
          };
          return returnData;
        }),
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
        catchError(this.handleError('getVideoCategories'))
      );
  }

  public isVideoValid(id: string): Observable<boolean> {
    return this.http
      .get<IVideoListResponseModel>(appConfig.getYoutubeEndPoint('videos'), {
        params: {
          part: appConfig.partsToLoadCategories,
          key: appConfig.youtubeApiKey,
          id
        }
      })
      .pipe(
        map((data) => {
          return data.items.length > 0;
        }),
        catchError(this.handleError('isVideoValid'))
      );
  }

  private handleError(operation: string = 'operation') {
    return (error) => {
      error.operation = operation;
      return throwError(error);
    };
  }

  private getMaxVideosToLoad(maxVideos: number, isLastPage: boolean): string {
    if (maxVideos) {
      return maxVideos > appConfig.maxVideosToLoad
        ? isLastPage
          ? (maxVideos % appConfig.maxVideosToLoad).toString()
          : appConfig.maxVideosToLoad.toString()
        : maxVideos.toString();
    }
    return appConfig.maxVideosToLoad.toString();
  }
}
