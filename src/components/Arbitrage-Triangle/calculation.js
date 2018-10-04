
export const calculation = (data) => {

  // Temp Values.
  let TargetCurrency = 'ETH';
  let feetaker = 0.1;

  let currecyArr = [];
  let ask = [];
  let bid = [];
  let initvolumes = [];
  let symbol_vdigit = [];

  data.forEach((element, index) => {
    if(index%2 === 0) {
      currecyArr.push(element.counterCoin);
      currecyArr.push(element.baseCoin);
      symbol_vdigit.push(Number(element.minvol));
    }
    
    if(element.side === 'ASK') {
      ask.push(Number(element.price));
      initvolumes.push(Number(element.volume));
    }
    else if(element.side === 'BID') {
      bid.push(Number(element.price));
      initvolumes.push(Number(element.volume));
    }

  });

  let cycle_currency = getCycleCurrency(currecyArr); // Currency1,2,3(string)
  let tgtcrryindex = cycle_currency.indexOf(TargetCurrency);//Targetcurrency 의 Index
  let total_currency_index = getCurrencyIndex(currecyArr); // 전체 Quotes, Base -> index 부여
  let cycle_currency_index = getCycleCurrency(total_currency_index); // Currency 1,2,3(index)

  let cycle_alpha = alphamaker(cycle_currency_index,tgtcrryindex); // 알파 싸이클(index)
  let cycle_beta = betamaker(cycle_alpha);// 베타 싸이클(index)

  let cycle_drc_alpha = getDirection(cycle_alpha,total_currency_index); // 알파 싸이클 방향(true/false)
  let cycle_drc_beta = getbetadrc(cycle_drc_alpha);// 베타 싸이클 방향(true/false)


  let currency_digit = [];
  const ref_currency = ["BTC","ETH","USD","KRW"];
  const ref_currency_digit = [-8,-8,-2,0];
  for(let i = 0 ; i<cycle_currency_index.length; i++){
    currency_digit[i] = ref_currency_digit[ref_currency.indexOf(cycle_currency[i])]
  }

  let CycleForTX = getProperCycle_Taker(ask, bid, cycle_drc_alpha, cycle_drc_beta); //맞는 방향과 이격도
  let cycleloss = [];

  let Values = getProperVolumes(CycleForTX, cycleloss, cycle_drc_alpha, cycle_drc_beta, total_currency_index, tgtcrryindex, 
    symbol_vdigit, currency_digit, initvolumes, ask, bid, feetaker);

  return {
    values : Values,
    cycleloss : cycleloss
  }

}




function getCycleCurrency(array)  {
  let total_currency_temp = [];
  for(let i = 0; i < array.length; i++) {
    if(total_currency_temp.includes(array[i])==true) {
      continue;
    } else {
      total_currency_temp.push(array[i]);
    }
  }
  return total_currency_temp;
} //[전체 Quotes,Base(string/index,6)] -> [currency1,2,3(string/index,3)] 

function getCurrencyIndex(array){
  let arraytemp = getCycleCurrency(array);
  let arraytemp2 = []; 
  for(let i = 0 ; i < array.length ; i++) {
    for(let k = 0; k < arraytemp.length ; k++) {
      if(array[i] == arraytemp[k]) {
        arraytemp2[i] = arraytemp.indexOf(array[i])
      }
    }
    
  }
  return arraytemp2;
} //[전체 Quotes,Base(string,6)] -> [전체 Quotes,Base(index,6)]

function alphamaker(array,key){
  // let key ;
  let arraytemp = [];
  for(let k = 0; k < array.length;k++){
    arraytemp[k] = array[k]; 
  }
  for(let i = 0; i < arraytemp.length; i++){
    if(arraytemp[i] == key ){ 
        arraytemp.splice(i, 1);
        break;
      }
  }
  arraytemp.unshift(key);
  // arraytemp.push(key);
  return arraytemp;
}//[currency123(index,3)], key:Targetcurrency(index) -> Targetcurrency를 시작으로 하는 싸이클1(알파)

function betamaker(array){
  let arraytemp = [];
  arraytemp[0] = array[0];
  arraytemp[1] = array[2];
  arraytemp[2] = array[1];
  
  return arraytemp;
}//알파를 입력해서 베타로 바꿔줌

function getDirection(array1,array2){
  let arraytemp = []; 
  let arraytemp2 = [];
  for( let i = 0 ; i < array2.length ; i++){
    arraytemp[i] = array1.indexOf(array2[i]);
  }

  for( let k = 0 ; k < 3 ; k++){
    if(arraytemp[(k * 2)] - arraytemp[(k*2)+1] == -1 || arraytemp[(k*2)] - arraytemp[(k*2)+1] == 2){
      arraytemp2[k] = false;
    }
    else if (arraytemp[(k * 2)] - arraytemp[(k*2)+1] == 1 || arraytemp[(k*2)] - arraytemp[(k*2)+1] == -2){
      arraytemp2[k] = true;
    }
  }
  
  return arraytemp2;

}//[알파 currency 순서(index,3)], [전체 Quotes,Base(index,6)] -> 사이클 방향(sell:false, buy:true)
  
function betamaker(array){
  let arraytemp = [];
  arraytemp[0] = array[0];
  arraytemp[1] = array[2];
  arraytemp[2] = array[1];
  
  return arraytemp;
}//알파를 입력해서 베타로 바꿔줌

function getbetadrc(array){
  let arraytemp = [];
  for(let i = 0; i < array.length; i++){
    if(array[i]==true){
      arraytemp[i] = false;
    }
    else arraytemp[i] = true;
  }
  return arraytemp;
    
} //알파[true/false(index,3)] -> 베타[true/false(index,3)]


function getProperCycle_Taker(ask, bid, cycle_drc_alpha, cycle_drc_beta){
  let x = 1;
  let k = 0;
  let p = [];
  for(let i = 0 ; i<cycle_drc_alpha.length ; i++){
    if(cycle_drc_alpha[i]==true) k=1/ask[i];
    else k= bid[i];
    x = x * k ;
  }

  if(x>1) {
    p[0] = 1;
    p.push(x) ;
    return p;
  }
  else{
    x = 1;
    for(let j = 0 ; j<cycle_drc_beta.length ; j++){
      if(cycle_drc_beta[j]) k=1/ask[j];
      else k = bid[j];
      x = x * k ;
    }
    
    if(x>1){
      p[0] = 2;
      p.push(x);
      return p;
    }
    else{
      p = [0,-1];
      return p;
    } 
  }
} // position이 Taker일 때 (알파[방향,3],베타[방향,3]) -> [알파:1 OR 베타:2,이격도], 알파/베타 모두 손해일 경우 [0,-1]



function getProperVolumes(CycleForTX, cycleloss, cycle_drc_alpha, cycle_drc_beta,total_currency_index, tgtcrryindex, 
  symbol_vdigit, currency_digit, initvolumes, ask, bid, feetaker) {
  let cycle_prices =[];
  let fee = 1 - feetaker; 

  let drcarray = CycleForTX[0]===1?cycle_drc_alpha.slice():CycleForTX[0]===2?cycle_drc_beta.slice():[-1,-1,-1];
  // console.log(drcarray);
  let inidrcarray = [];
  let drcarray2 = [];
  let inivaluearray = [];
  let indexframe = [-1,-1,-1,-1,-1,-1];
  let p = total_currency_index.indexOf(tgtcrryindex);
  let q = total_currency_index.lastIndexOf(tgtcrryindex);
  let valuearray = [];
  let tempcurrency =[];
  let digitarray = [];
  let digittemp = [];
  let cycle_prices_seq = [];
  let ordvlum =[];
  let ordvlum2 =[];
  

  for(let i = 0 ; i < 3 ; i++){
    
    digittemp[i*2] = symbol_vdigit[total_currency_index[i*2]];
    digittemp[(i*2) + 1] = currency_digit[total_currency_index[(i*2) + 1]]
    //허용 digit 저장
    if(drcarray[i]==true){//buy
      inidrcarray[i*2] = true;
      inidrcarray[(i*2) + 1] = false;
      
      inivaluearray[i*2] = initvolumes[i*2];
      inivaluearray[(i*2) + 1] = digitkill(initvolumes[i*2],ask[i],0);
      // initvolumes[i*2] * getdigits(initvolumes[i*2]) * ask[i] * getdigits(ask[i]) /  (getdigits(initvolumes[i*2]) *getdigits(ask[i]));
      
      cycle_prices[i] = ask[i];
    }
    else{//sell
      inidrcarray[i*2] = false;
      inidrcarray[(i*2)+1] = true;

      inivaluearray[i*2] = initvolumes[(i*2) + 1];
      inivaluearray[(i*2) + 1] = digitkill(initvolumes[(i*2)+1],bid[i],0)
      // initvolumes[(i*2) + 1] * getdigits(initvolumes[(i*2) + 1]) * bid[i] * getdigits(ask[i]) / (getdigits(initvolumes[(i*2) + 1]) *getdigits(bid[i]));
    
      cycle_prices[i] = bid[i];
    } 
  }//in(true),out(false),수량 계산
  

  if(inidrcarray[p]==true){
    indexframe[p] = 5 ;
    indexframe[q] = 0 ;

    if(evenOrOdd(p)==true){
      indexframe[p - 1] = 4 ;
    }
    else indexframe[p + 1] = 4 ;

    if(evenOrOdd(q)==true){
      indexframe[q - 1] = 1 ;
    }
    else indexframe[q + 1] = 1 ;
  }
  else{
    indexframe[p] = 0 ;
    indexframe[q] = 5 ;
    
    if(evenOrOdd(p)==true){
      indexframe[p - 1] = 1 ;
    }
    else indexframe[p + 1] = 1 ;

    if(evenOrOdd(q)==true){
      indexframe[q - 1] = 4 ;
    }
    else indexframe[q + 1] = 4 ;
  }//수량을 순서대로 정렬했을 때 인덱스(1)
  if(total_currency_index[indexframe.indexOf(1)] == total_currency_index[indexframe.indexOf(-1)]){
    indexframe[indexframe.indexOf(-1)] = 2;
    indexframe[indexframe.indexOf(-1)] = 3;
  }
  else if(total_currency_index[indexframe.indexOf(1)] == total_currency_index[indexframe.lastIndexOf(-1)]){
    indexframe[indexframe.indexOf(-1)] = 3;
    indexframe[indexframe.indexOf(-1)] = 2;
  }//수량을 순서대로 정렬했을 때 인덱스(2)

  for(let k = 0; k < 6; k++){
    valuearray[indexframe[k]] = inivaluearray[k];
    digitarray[indexframe[k]] = digittemp[k];
    
    tempcurrency[indexframe[k]] = total_currency_index[k];
    // drcarray2[indexframe[k]] = inidrcarray[k];
  } 
  // 정렬 정렬 정렬 정렬 정렬 정렬 정렬 정렬 정렬 정렬 정렬 정렬 정렬 정렬 정렬 정렬 정렬 정렬 정렬 정렬 정렬 정렬 정렬 정렬 정렬 정렬 정렬 정렬
  // console.log(valuearray);
  // console.log(digitarray);

  function symbolsort(){
    let temp = [indexframe[0],indexframe[2],indexframe[4]];//2,5,0
    let temp2 = temp.slice(); 
    let temp3 = [];
    temp2.sort();// 0,2,5
    for(let i = 0 ; i<3 ; i++){
      temp3[i] = temp.indexOf(temp2[i]);
    }
    return temp3;
  }//symbol 순서(index)

  let symbolsequence = symbolsort();
  let symboldrcseq = [];
  for(let i = 0 ; i<3 ; i++){
    let temp = drcarray.slice();
    symboldrcseq[i] = temp[symbolsequence[i]];
    cycle_prices_seq[i] = cycle_prices[symbolsequence[i]];
  } //cycle 진행 순서에 따른 symbol 방향(t/f)
  // console.log(symboldrcseq);
  // console.log(cycle_prices_seq);

  

  if(valuearray[2] < digitkill(valuearray[1],fee,0)){
    if(symboldrcseq[0]==true){
      valuearray[1] = (Math.ceil(valuearray[2] * Math.pow(10,-digitarray[1]) /fee))  / Math.pow(10,-digitarray[1]) ;
      valuearray[0] = digitkill(valuearray[1],cycle_prices_seq[0],0);
      
    }
    else if(symboldrcseq[0]==false){
      valuearray[0] = Math.ceil((valuearray[2] / (fee * cycle_prices_seq[0])) * Math.pow(10,-digitarray[0])) / Math.pow(10,-digitarray[0]);
      valuearray[1] = digitkill(valuearray[0],cycle_prices_seq[0],0);
      
    }
  }
  else if(valuearray[2] > digitkill(valuearray[1],fee,0)){
    if(symboldrcseq[1]==true){
      valuearray[3] = Math.floor(Math.pow(10,-digitarray[3])*valuearray[1]*fee/cycle_prices_seq[1])/Math.pow(10,-digitarray[3]);
      valuearray[2] = digitkill(valuearray[3],cycle_prices_seq[1],0);
      
    }
    else if(symboldrcseq[1]==false){
      valuearray[2] = Math.floor(valuearray[1]*fee * Math.pow(10,-digitarray[2])) / Math.pow(10,-digitarray[2]);
      valuearray[3] = digitkill(valuearray[2],cycle_prices_seq[1],0) 
    }
  }

  if(valuearray[4] < digitkill(valuearray[3],fee,0)){
    if(symboldrcseq[1]==true){
      valuearray[3] = (Math.ceil(valuearray[4] * Math.pow(10,-digitarray[3]) /fee))  / Math.pow(10,-digitarray[3]) ;
      valuearray[2] = digitkill(valuearray[3],cycle_prices_seq[1],0);
   
    }
    else if(symboldrcseq[1]==false){
      valuearray[2] = Math.ceil((valuearray[4] / (fee * cycle_prices_seq[1])) * Math.pow(10,-digitarray[2])) / Math.pow(10,-digitarray[2]);
      valuearray[3] = digitkill(valuearray[2],cycle_prices_seq[1],0);
    }

    if(symboldrcseq[0]==true){
      valuearray[1] = (Math.ceil(valuearray[2] * Math.pow(10,-digitarray[1]) /fee))  / Math.pow(10,-digitarray[1]) ;
      valuearray[0] = digitkill(valuearray[1],cycle_prices_seq[0],0);
    }
    else if(symboldrcseq[0]==false){
      valuearray[0] = Math.ceil((valuearray[2] / (fee * cycle_prices_seq[0])) * Math.pow(10,-digitarray[0])) / Math.pow(10,-digitarray[0]);
      
      valuearray[1] = digitkill(valuearray[0],cycle_prices_seq[0],0);
    }

  }
  else if(valuearray[4] > digitkill(valuearray[3],fee,0)){
    if(symboldrcseq[2]==true){
      valuearray[5] = Math.floor(Math.pow(10,-digitarray[5])*valuearray[3]*fee/cycle_prices_seq[2])/Math.pow(10,-digitarray[5]);
      valuearray[4] = digitkill(valuearray[5],cycle_prices_seq[2],0);
    }
    else if(symboldrcseq[2]==false){
      valuearray[4] = Math.floor(valuearray[3]* fee * Math.pow(10,-digitarray[4])) / Math.pow(10,-digitarray[4]);
      valuearray[5] = digitkill(valuearray[4],cycle_prices_seq[2],0) 
    }
  }
  // console.log(valuearray);
  // console.log(symboldrcseq);
  for(let i=0;i<3;i++){
    if(symboldrcseq[i]==true) 
    ordvlum[i] = valuearray[(i*2)+1]
    else ordvlum[i] = valuearray[i*2]    
  }//오더 쏠 수량
  // console.log(symbolsequence);

  for(let i=0;i<3;i++){
    ordvlum2[2*i] = ordvlum[symbolsequence[i]];
    ordvlum2[(2*i)+1] = drcarray[i];
  }
  // console.log(ordvlum2);

  for(let i=0;i<3;i++){
    let tempdigit = [];
    tempdigit[i] = currency_digit[tempcurrency[(i*2)+1]]
    let feedigit = Number.isInteger(fee)==true?0:String(fee).split('.')[1].length ;
    // valuearray[(i*2)+1] = digitkill(valuearray[(i*2)+1],fee,0) ;
    valuearray[(i*2)+1] = Math.floor(valuearray[(i*2)+1] * fee * Math.pow(10, -tempdigit[i])) / Math.pow(10, -tempdigit[i]);
  }//짜투리 계산 및 수익률 계산을 위한 수수료 차감
  // console.log(valuearray);

  // console.log(tempcurrency);
  // console.log(currency_digit);
  for(let i=0;i<3;i++){
    cycleloss[2*i] = tempcurrency[(2*i)];
    if(i==0){
    
      cycleloss[(2*i)+1] = (100000000*valuearray[5] - 100000000*valuearray[0])/100000000;
    }
    else{
      cycleloss[(2*i)+1] = (100000000*valuearray[(2*i)-1] - 100000000*valuearray[(2*i)])/100000000
    }
  }//loss계산
  // console.log(cycleloss);
  return ordvlum2;
  
}//Taker만 고려됨

function digitkill(number1,number2,number3){
  number1 = Number(number1);
  number2 = Number(number2);
  number3 = Number(number3);

  var temp1 = Math.pow(10,Number.isInteger(number1)==true?0:String(number1).split('.')[1].length);
  var temp2 = Math.pow(10,Number.isInteger(number2)==true?0:String(number2).split('.')[1].length);

  if(number3==0){
    return (Math.floor(number1 * temp1) * Math.floor( number2 * temp2)) / (temp1 * temp2) ; 
  }
  else if(number3==1){
    return ( Math.floor(number1 * temp1) / Math.floor( number2 * temp2) ) * (temp2 / temp1) ; 
  }
}

function evenOrOdd(num){
  return (num % 2)? true:false; 
}// 짝수이면false, 홀수이면 true

