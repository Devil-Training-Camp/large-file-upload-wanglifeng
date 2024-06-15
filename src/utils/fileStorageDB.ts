class fileStorageDBService {
  // 数据库名称
  dbName: string;
  // 版本
  dbVersion: number;
  // 数据库对象
  db: IDBDatabase | null;

  constructor(dbName: string, dbVersion: number) {
    this.dbName = dbName;
    this.dbVersion = dbVersion;
    this.db = null;
  }

  async openDB(stores: any) {
    const request = window.indexedDB.open(this.dbName, this.dbVersion);
    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        console.log("数据库打开成功");
        // 把数据库对象绑定到 db 属性上
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(true);
      };
      request.onerror = (event) => {
        console.log("数据库打开失败");
        reject(event);
      };
      request.onupgradeneeded = (event) => {
        console.log("数据库升级成功");
        // 创建存储对象，也就是数据表
        const { result } = event.target as IDBOpenDBRequest;
        for (const storeName in stores) {
          // 初始化多个objectStore对象仓库，获取数据表的主键和索引
          const { keyPath, indexs } = stores[storeName];
          if (!result.objectStoreNames.contains(storeName)) {
            const store = result.createObjectStore(storeName, {
              autoIncrement: true, // 是否自增
              keyPath, // 主键，主键（key）是默认建立索引的属性
            });

            // 创建数据表的索引
            if (indexs && indexs.length) {
              indexs.map((v: string) =>
                // createIndex可以新建索引，unique字段是否唯一
                store.createIndex(v, v, { unique: false }),
              );
            }
            store.transaction.oncomplete = () => {
              console.log("对象仓库创建成功");
            };
          }
        }
      };
    });
  }

  // 添加/修改 数据
  async updateItem(storeName: string, data: any) {
    // 添加数据通过事务来添加，事务是在数据库对象上
    const store = this.db!.transaction([storeName], "readwrite").objectStore(
      storeName,
    );
    // put可以新增和修改  add 只是新增
    const request = store.put({ ...data, updateTime: +new Date() });
    return new Promise((resolve, reject) => {
      request.onsuccess = (event: any) => {
        console.log("数据写入成功");
        resolve(event);
      };
      request.onerror = (event: any) => {
        console.log("数据写入失败");
        reject(event);
      };
    });
  }

  async getAllDatas(storeName: string) {
    const store = this.db!.transaction([storeName]).objectStore(storeName);
    const request = store.getAll();
    return new Promise((resolve, reject) => {
      request.onsuccess = (event: any) => {
        console.log("查询所有数据成功");
        resolve(event.target.result);
      };
      request.onerror = (event: any) => {
        console.log("查询所有数据失败");
        reject(event);
      };
    });
  }
}

const fileStorageDB = new fileStorageDBService("database", 1);
export default fileStorageDB;

export { fileStorageDBService };
