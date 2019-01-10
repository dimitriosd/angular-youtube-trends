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
          title: 'Test',
        },
      });
      return Observable.of([ { videoCategoryClass }]);
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

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
