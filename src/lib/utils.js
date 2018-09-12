

export const convertFloatDigit = (number,digit) =>{

  return Math.floor(number * Math.pow(10,digit)) / Math.pow(10,digit);

}

export const paddingZero = (num,n) => {
  return parseFloat(Math.round(num * Math.pow(10, n)) /Math.pow(10,n)).toFixed(n);
}

export const removeDuplicateArray = (arr) => {
  let s = new Set(arr);
  let it = s.values();
  return Array.from(it);
}

export const expressKRW = (num) => {

  if(Number(num) < 1) {
    return Math.floor(num);
  }
  else {
    num = Math.floor(num);

    let len, point, str;  
  
    num = num + "";  
    point = num.length % 3 ;
    len = num.length;  
  
    str = num.substring(0, point);  
    while (point < len) {  
        if (str != "") str += ",";  
        str += num.substring(point, point + 3);  
        point += 3;  
    }  
  
    return str;
  }
}