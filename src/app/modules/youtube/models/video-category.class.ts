export class VideoCategoryClass {
  public id = '';
  public title = '';

  constructor(data: any = {}) {
    if (!data || !data[ 'snippet' ]) {
      return;
    }

    this.id = data[ 'id' ];
    this.title = data[ 'snippet' ][ 'title' ];
  }
}