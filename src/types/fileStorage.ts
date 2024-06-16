export interface StoreOptions {
  keyPath?: string;
  indexs?: string[];
}

export interface Store {
  [key: string]: StoreOptions;
}
