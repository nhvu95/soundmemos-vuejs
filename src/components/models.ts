export interface ISound {
  id: string;
  name: string;
  time: number;
  date: number;
  blob: Blob;
}

export interface IMeta {
  totalCount: number;
}