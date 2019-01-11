import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PlayerComponent } from './player.component';
import { SafePipe } from '@modules/youtube/pipes/safe.pipe';
import { ContextService } from '@shared/context.service';
import { YoutubeService } from '@modules/youtube/service/youtube.service';
import { Observable } from 'rxjs';

describe('PlayerComponent', () => {
  let component: PlayerComponent;
  let fixture: ComponentFixture<PlayerComponent>;
  const service = {
    getTrendingVideos() {
      return Observable.of([]);
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PlayerComponent, SafePipe],
      providers: [ContextService, { provide: YoutubeService, useValue: service }],
      imports: [RouterTestingModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
