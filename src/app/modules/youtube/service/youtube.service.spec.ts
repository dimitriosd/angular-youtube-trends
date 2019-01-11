import { TestBed, inject } from '@angular/core/testing';
import { YoutubeService } from './youtube.service';
import { HttpClientModule } from '@angular/common/http';

describe('YoutubeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [YoutubeService],
      imports: [HttpClientModule]
    });
  });

  it('should create service', inject([YoutubeService], (service: YoutubeService) => {
    expect(service).toBeTruthy();
  }));

  it('should get trending videos', inject([YoutubeService], (service: YoutubeService) => {
    expect(service.getTrendingVideos('US')).toBeDefined();
    expect(service.getTrendingVideos('US', 5)).toBeDefined();
    expect(service.getTrendingVideos('US', 51, '10', 'someToken')).toBeDefined();
  }));

  it('should get video categories', inject([YoutubeService], (service: YoutubeService) => {
    expect(service.getVideoCategories('US')).toBeDefined();
  }));
});
