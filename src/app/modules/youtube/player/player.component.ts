import { Component, OnInit } from '@angular/core';

import { appConfig } from 'appConfig';
import { ContextService } from '@shared/context.service';
import { YoutubeService } from '@modules/youtube/service/youtube.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {
  public embedUrl: string;
  public videoLoader: boolean;

  constructor(private appContext: ContextService, private youtubeService: YoutubeService) {}

  public ngOnInit() {
    this.appContext.showFilterButton.next(false);
    const id = window.location.href.replace(/^.*\//g, '').replace(/^.*\..*/g, '');
    if (!id.length) {
      return;
    }
/*    this.youtubeService
      .getTrendingVideos(undefined, undefined, undefined, undefined, id)

      .subscribe((response) => {
        console.log(response);
      });*/

    this.videoLoader = true;
    this.embedUrl = appConfig.getYoutubeEmbdedUrl(id);
  }

  /* On video ready hide loader */
  public loadVideo(): void {
    this.videoLoader = false;
  }
}
