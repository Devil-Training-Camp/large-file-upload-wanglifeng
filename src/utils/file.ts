/**
 * @description: 把字节转换成正常文件大小
 * @return {*}  返回文件正常大小带单位
 */
export function getFileSize(size:number) {
  if (!size)  return "";
  var num = 1024.00; //byte
  if (size < num)
      return size + "B";
  if (size < Math.pow(num, 2))
      return (size / num).toFixed(2) + "KB"; //kb
  if (size < Math.pow(num, 3))
      return (size / Math.pow(num, 2)).toFixed(2) + "MB"; //M
  if (size < Math.pow(num, 4))
      return (size / Math.pow(num, 3)).toFixed(2) + "G"; //G
  return (size / Math.pow(num, 4)).toFixed(2) + "T"; //T
}