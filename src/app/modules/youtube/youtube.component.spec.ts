import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { MatButtonModule, MatIconModule, MatSidenavModule } from '@angular/material';
import { MomentModule } from 'angular2-moment';
import { Observable } from 'rxjs';
import 'rxjs-compat/add/observable/of';

import { YoutubeComponent } from './youtube.component';
import { YoutubeService } from './service/youtube.service';
import { ContextService } from '@shared/context.service';
import { VideoClass } from '@modules/youtube/models/video.class';
import { SESSION_STORAGE_TOKEN } from '@shared/tokens/session-storage.token';

@Component({
  selector: 'app-video-component',
  template: ''
})
class VideoComponent {
  @Input() public video: VideoClass;
}

describe('YoutubeComponent', () => {
  let component: YoutubeComponent;
  let fixture: ComponentFixture<YoutubeComponent>;
  const service = {
    getTrendingVideos() {
      return Observable.of([]);
    }
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [YoutubeComponent, VideoComponent],
      imports: [
        RouterTestingModule,
        MatButtonModule,
        MatIconModule,
        MatSidenavModule,
        MomentModule
      ],
      providers: [
        { provide: YoutubeService, useValue: service },
        ContextService,
        {
          provide: SESSION_STORAGE_TOKEN,
          useValue: {
            getItem: () => '',
            setItem: () => ''
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YoutubeComponent);
    component = fixture.componentInstance;
  });

  it('should create component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load more videos on scroll', () => {
    spyOn(service, 'getTrendingVideos').and.callThrough();
    component.onScroll();
    expect(service.getTrendingVideos).not.toHaveBeenCalled();
    const privateComponent = component as any;
    spyOn(privateComponent, 'loadVideos');
    component.showMoreVideos = true;
    component.onScroll();
    expect(privateComponent.loadVideos).toHaveBeenCalled();
  });

  it('should reset filters', () => {
    const privateComponent = component as any;
    spyOn(privateComponent, 'loadVideos');
    privateComponent.resetFiltersAndLoad({});
    expect(privateComponent.loadVideos).toHaveBeenCalled();
  });

  it('should get filters', () => {
    const privateComponent = component as any;
    const filters = {
      selectedRegionCode: 'US',
      videosCountPerPage: 10,
      selectedCategoryId: '1'
    };
    expect(privateComponent.getFilters(filters).videosCountPerPage).toEqual(10);
  });

  it('should load video with next page token set', () => {
    const privateComponent = component as any;
    const filters = {
      selectedRegionCode: 'US',
      videosCountPerPage: 1,
      selectedCategoryId: '1'
    };
    spyOn(service, 'getTrendingVideos');
    fixture.detectChanges();
    privateComponent.loadVideos(filters, 'someToken');
    expect(component.showMoreVideos).toBeFalsy();
  });
});
