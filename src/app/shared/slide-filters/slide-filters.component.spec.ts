import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MatAutocompleteModule,
  MatIconModule,
  MatInputModule,
  MatSidenavModule,
  MatSliderModule
} from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { SlideFiltersComponent } from './slide-filters.component';
import { ContextService } from '../context.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SESSION_STORAGE_TOKEN } from '@shared/tokens/session-storage.token';
import { Observable } from 'rxjs';
import { YoutubeService } from '@modules/youtube/service/youtube.service';
import { VideoCategoryClass } from '@modules/youtube/models/video-category.class';

describe('SlideFiltersComponent', () => {
  let component: SlideFiltersComponent;
  let fixture: ComponentFixture<SlideFiltersComponent>;
  let context: ContextService;
  const service = {
    getVideoCategories() {
      const videoCategoryClass = new VideoCategoryClass({
        id: 123,
        snippet: {
          title: 'Test'
        }
      });
      return Observable.of([{ videoCategoryClass }]);
    }
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SlideFiltersComponent],
      providers: [
        ContextService,
        { provide: YoutubeService, useValue: service },
        {
          provide: SESSION_STORAGE_TOKEN,
          useValue: {
            getItem: () =>
              '{"selectedRegionCode":"US","videosCountPerPage":24,"selectedCategoryId":"10"}',
            setItem: () => ''
          }
        }
      ],
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        HttpClientTestingModule,
        ReactiveFormsModule,
        RouterTestingModule,
        MatAutocompleteModule,
        MatIconModule,
        MatInputModule,
        MatSidenavModule,
        MatSliderModule
      ]
    }).compileComponents();
    context = TestBed.get(ContextService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SlideFiltersComponent);
    component = fixture.componentInstance;
  });

  it('should create component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('shoud reload categories on country change', () => {
    const privateComponent = component as any;
    component.videoCategories = [{ id: '1', title: 'test' }];
    spyOn(privateComponent, 'loadCategories');
    component.onChangeVideosPerPage(30);
    component.onCountryChange('US');
    component.onCategoryChange('1');
    expect(privateComponent.loadCategories).toHaveBeenCalled();
  });

  it('should get filtered countries', () => {
    const privateComponent = component as any;
    expect(privateComponent.filterCountries('USA').length).toBe(1);
  });

  it('should get filtered categories', () => {
    const privateComponent = component as any;
    component.videoCategories = [{ id: '1', title: 'test' }];
    expect(privateComponent.filterCategories('test').length).toBe(1);
  });
});
