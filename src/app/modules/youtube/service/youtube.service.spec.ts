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

  it('should ...', inject([YoutubeService], (service: YoutubeService) => {
    expect(service).toBeTruthy();
  }));

  it('should ...', inject([YoutubeService], (service: YoutubeService) => {
    service.getTrendingVideos('US');
    service.getTrendingVideos('US', 50, '10');
  }));

  it('should ...', inject([YoutubeService], (service: YoutubeService) => {
    service.getVideoCategories('US');
  }));
});
