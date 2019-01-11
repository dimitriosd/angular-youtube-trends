export class VideoCategoryClass {
  public id = '';
  public title = '';
  public items? = [];

  constructor(data = {}) {
    if (!data || !data['snippet']) {
      return;
    }

    this.id = data['id'];
    this.title = data['snippet']['title'];
  }
}
