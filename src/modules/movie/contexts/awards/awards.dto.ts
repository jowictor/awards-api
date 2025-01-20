export class Producer {
  constructor(
    public producer: string,
    public interval: number,
    public previousWin: number,
    public followingWin: number,
  ) {}
}
