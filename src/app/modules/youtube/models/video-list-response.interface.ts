import { VideoClass } from '@modules/youtube/models/video.class';

export interface IVideoListResponseModel {
  items: VideoClass[];
  nextPageToken: string;
  pageInfo: { totalResults: number; resultsPerPage: number };
}
