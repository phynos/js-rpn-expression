/*!
 * 逆波兰表达式库--全功能版本
 * RPN-expression JavaScript Library
 *
 *
 * Copyright lupc-贺兰
 * Released under the MIT license
 *
 * Date: 2018-04-13
 */

var TOKEN_NUMBER = "number";
var TOKEN_OPERATOR = "operator";
var TOKEN_VARIABLE = "variable";
var TOKEN_IDENTIFIER = "identifier";

function isOperator(c) { return /[+\-*\/\^%=(),]/.test(c); };
function isDigit(c) { return /[0-9]/.test(c); };
function isAlphaOrLine(c) { return /[a-zA-Z_]/.test(c); };
function isAlphaOrLineOrNumber(c) { return /[0-9a-zA-Z_]/.test(c); };
function isWhiteSpace(c) { return /\s/.test(c); };

//获取运算符优先级，数值越大，优先级越低
function getPriority(op){
	var _op = op.value;
	if(_op == "(")
		return 0;
	else if(_op == ")")
		return 10;
	else if(_op == "*")
		return 30;
	else if(_op == "/")
		return 31;
	else if(_op == "%")
		return 32;
	else if(_op == "+")
		return 40;
	else if(_op == "-")
		return 41;	
	return 0;	
};

//比较运算符优先级
function comparePriority(opa,opb){
	var a = getPriority(opa);
	var b = getPriority(opb);
	if(a > b)
		return -1;
	else if(a == b)
		return 0;
	else
		return 1;
};

function CalContext(){
	if(this instanceof CalContext){
		this.dataMap = {};
		this.functionMap = {};
	} else {
		throw new "你必须用new关键字调用构造函数";
	}
};
CalContext.prototype.calc = function(expression){
	//词法分析
	var tokens = this._parse(expression);
	this.tokens = tokens;
	//表达式转换
	var finalTokens = this._expr(this.tokens,0,this.tokens.length);
	this.finalTokens = finalTokens;
	//执行
	var result = this._execute(finalTokens);
	return result;
};
//词法分析
CalContext.prototype._parse = function(expression){
	var tokens = [],i = 0,c;
	var addToken = function (type, value) {
	  tokens.push({
	    type: type,
	    value: value
	 });
	};
	while(i < expression.length){
		c = expression[i];
		if(isDigit(c)){
			var num = parseInt(c);
			var num2 = 0;//如果是浮点数，先用此数记录小数后的部分
			var isFloat = false;
			i++;		
			while(i < expression.length){				
				c = expression[i];
				if(isFloat) {
					if(isDigit(expression[i])){
						i++;
						if(num2 == 0){
							num2 = parseInt(c);
						} else {
							num2 = num2*10 + parseInt(c);
						}
						if(i == expression.length){
							num = parseFloat(num + "." + num2);	
						}
					} else {
						num = parseFloat(num + "." + num2);
						break;
					}
				} else {
					if(isDigit(expression[i])){
						i++;
						num = num * 10 + parseInt(c);				
					} else if(c == "."){
						i++;
						isFloat = true;
					} else {
						break;
					}
				}			
			}
			addToken(TOKEN_NUMBER,num);
		} else if(isOperator(c)){
			addToken(TOKEN_OPERATOR,c);
			i++;
		} else if(isWhiteSpace(c)){
			i++;
		} else if(c == "$"){//变量
			var varName = "$";//最终变量名称
			i++;
			while(i < expression.length){
				c = expression[i];
				if(isAlphaOrLineOrNumber(c)){
					i++;
					varName = varName + c;
				} else {
					break;
				}
			}			
			addToken(TOKEN_VARIABLE,varName);			
		} else if(isAlphaOrLine(c)){//函数或对象
			var name = c;
			i++;
			while(i < expression.length){
				c = expression[i];
				if(isAlphaOrLineOrNumber(c)){
					i++;
					name = name + c;
				} else if(c == "("){//函数
					addToken(TOKEN_IDENTIFIER,name);
					addToken(TOKEN_OPERATOR,c);
					i++;
					break;
				} else if(c == ".") {//对象
					addToken(TOKEN_IDENTIFIER,name);
					name = "";
					i++;
				} else {
					if(name != "") {
						addToken(TOKEN_IDENTIFIER,name);
					}
					break;
				}
			}						
		} else {
			throw "非法字符" + c;
		}
	}
	return tokens;	
};
/*
中缀表达式转化为逆波兰表达式算法：
//1、从左至右扫描一中缀表达式。
//2、若读取的是操作数，则判断该操作数的类型，并将该操作数存入操作数堆栈
//3、若读取的是运算符
// (1) 该运算符为左括号"("，则直接存入运算符堆栈。
// (2) 该运算符为右括号")"，则输出运算符堆栈中的运算符到操作数堆栈，直到遇到左括号为止。
// (3) 该运算符为非括号运算符：
// (a) 若运算符堆栈栈顶的运算符为括号，则直接存入运算符堆栈。
// (b) 若比运算符堆栈栈顶的运算符优先级高，则直接存入运算符堆栈。
// (c) 若比运算符堆栈栈顶的运算符优先级低或相等，则输出栈顶运算符到操作数堆栈，并将当前运算符压入运算符堆栈
//4、当表达式读取完成后运算符堆栈中尚有运算符时，则依序取出运算符到操作数堆栈，直到运算符堆栈为空。

*/
CalContext.prototype._expr = function(tokens,offset,count){
	var operandStack = [];//操作数堆栈
	var addOperand = function(operand){
		operandStack.push({
		    type: operand.type,
		    value: operand.value,
		    callee: operand.callee,
			args: operand.args  //函数参数列表
		});
	};
	var operatorStack = [];//操作符堆栈
	var addOperator = function(operator){
		operatorStack.push({
	    	type: operator.type,
	    	value: operator.value			
		});
	};
	//
	var curToken,curOperand,curOperator;
	for (var i = offset; i < (offset + count); i++) {
		curToken = tokens[i];
		if(curToken.type == TOKEN_NUMBER
			|| curToken.type == TOKEN_VARIABLE){
			curOperand = curToken;
			addOperand(curOperand);
			continue;
		} else if(curToken.value == "("){
			curOperator = curToken;
			addOperator(curOperator);
			continue;
		} else if(curToken.value == ")"){
			//若当前运算符为右括号,则依次弹出运算符堆栈中的运算符并存入到操作数堆栈,直到遇到左括号为止,此时抛弃该左括号.
			while(true){
				var last = operatorStack[operatorStack.length - 1];
				if(last.value == "("){
					operatorStack.pop();
					break;
				} else {
					addOperand(operatorStack.pop());
				}
			}
			continue;
		} else if(curToken.type == TOKEN_IDENTIFIER){//标识符
			//如果是调用，则维护一个成员列表 + 一个函数【可选】
			curOperand = curToken;
			curOperand.callee = [];//调用者链
			curOperand.args = [];//参数列表
			curOperand.callee.push(curToken.value);
			//
			var j = i + 1;
			while(true) {
				var nextToken = tokens[j];
				j++;
				if(nextToken.type == TOKEN_IDENTIFIER) {
					curOperand.callee.push(nextToken.value);
				} else if(nextToken.value == "(") {
					//处理参数列表（参数列表相当于几个新的表达式）
					var info = this._exprFunctionArgs(tokens,j - 2);
					var _paraCount = info._paraCount,
						paraInfo = info.argsLocationInfo;
					//将每个函数参数当作一个独立表达式处理（递归处理）
					for (var k = 0; k < _paraCount; k++) {
						var _fpTokens = this._expr(tokens,paraInfo[k].offset,paraInfo[k].count);
						curOperand.args.push(_fpTokens);
					}	
					i = info.lastIndex;//i移位到函数的反括号			
					break;
				} else {
					i = j - 2;//恢复到函数末尾
					break;
				}
			}
			addOperand(curOperand);//当作一个特殊的操作数			
		} else { //处理操作符（包含括号）
			curOperator = curToken;
			if(operatorStack.length == 0){
				addOperator(curOperator);
				continue;
			} else {
				//取得操作符栈的最顶层操作符
				var last = operatorStack[operatorStack.length - 1];
				//对比操作符优先级
				if(comparePriority(curOperator,last) == 1){
					addOperator(curOperator);
					continue;
				} else {
					//若当前运算符若比运算符堆栈栈顶的运算符优先级低或相等，则输出栈顶运算符到操作数堆栈，直至运算符栈栈顶运算符低于（不包括等于）该运算符优先级，
                    //或运算符栈栈顶运算符为左括号
                    //并将当前运算符压入运算符堆栈。
					while(operatorStack.length > 0){
						if(comparePriority(curOperator,operatorStack[operatorStack.length - 1]) < 1
							&& operatorStack[operatorStack.length - 1].value != "("){
							//
							addOperand(operatorStack.pop());
							//
							if(operatorStack.length == 0){
								addOperator(curOperator);
								break;
							}
						} else {
							addOperator(curOperator);
							break;
						}
					}
				}
			}
		}		
	}
	//转换完成,若运算符堆栈中尚有运算符时,
    //则依序取出运算符到操作数堆栈,直到运算符堆栈为空
	while(operatorStack.length > 0){
		addOperand(operatorStack.pop());
	}
	//调整操作数栈中对象的顺序并输出到最终栈
	var finalTokens = [];
    while (operandStack.length > 0)
    {
        finalTokens.push(operandStack.shift());
    }
    return finalTokens;
};

/**
* 获取函数调用 参数信息
* offset：函数括号之前的索引
*/
CalContext.prototype._exprFunctionArgs = function(tokens,offset){
	// 参数信息：参数在单词流的位置信息
	var paraInfo = [];
	//将函数2个括号之间的内容作为几个独立表达式
	var _start = offset + 2, //函数所有参数单词流的起始位置（不包含括号）
		_paraCount = 0,		 //函数参数个数
		j = offset + 1,		 //开始扫描的位置
		_lb = 1;             //左括号的个数（1表示参数的开始括号）
	//扫描函数参数，计算出函数参数个数，每个参数的起始位置，token个数				
	while(true){
		j++;
		var _t = tokens[j].value;
		if(_t == ")" && _lb == 1){//当参数括号刚好匹配，表示2个括号之间的 内容为参数内容
			//最后一个参数或第一个参数（只有一个参数的时候）
			if(_paraCount > 0){
				paraInfo.push({
					offset: _start,
					count: j - _start
				});	
			}
			break;
		} else if(_t == "("){
			_lb++;
		} else if(_t == ")"){
			_lb--;
		} else if(_t == "," && _lb == 1){//参数分割
			_paraCount++;//参数个数+1
			paraInfo.push({
				offset: _start,
				count: j - _start
			});	//记录参数信息位置信息
			_start = j + 1;//下个参数的起始位置
		} else if(j == offset + 2){//如果参数的第一个字符不是以上字符，则表示函数起码有一个参数
			_paraCount = 1;
		}
	}
	return {
		_paraCount: _paraCount,
		argsLocationInfo: paraInfo,
		lastIndex: j // 最后一个括号后面的一个位置 的索引				
	};
}

/*
  逆波兰表达式求值算法：
  1、循环扫描语法单元的项目。
  2、如果扫描的项目是操作数，则将其压入操作数堆栈，并扫描下一个项目。
  3、如果扫描的项目是一个二元运算符，则对栈的顶上两个操作数执行该运算。
  4、如果扫描的项目是一个一元运算符，则对栈的最顶上操作数执行该运算。
  5、将运算结果重新压入堆栈。
  6、重复步骤2-5，堆栈中即为结果值。
*/
CalContext.prototype._execute = function(exprTokens){
	var value;
	var opa,opb;
	var opds = [];
	for (var i = 0; i < exprTokens.length; i++) {
		var token = exprTokens[i];

		if(token.type == TOKEN_NUMBER){
			//如果为操作数则压入操作数堆栈
			opds.push(token.value);
		} else if(token.type == TOKEN_VARIABLE){
			var result = this._getVarValue(token);
			opds.push(result);
		} else if(token.type == TOKEN_IDENTIFIER){
			var result = this._getCallExpressionResult(token);
			opds.push(result);
		} else if(token.type == TOKEN_OPERATOR){//二目操作符
			switch (token.value) {
				case "+":
					opa = opds.pop();
					opb = opds.pop();
					opds.push(opa + opb);
				break;
				case "-":
					opa = opds.pop();
					opb = opds.pop();
					opds.push(opb - opa);
				break;
				case "*":
					opa = opds.pop();
					opb = opds.pop();
					opds.push(opa * opb);
				break;
				case "/":
					opa = opds.pop();
					opb = opds.pop();
					opds.push(opb / opa);
				break;
				case "%":
					opa = opds.pop();
					opb = opds.pop();
					opds.push(opb % opa);
				break;
				default:
					console.warn("不支持的操作符：" + token.value);
				break;
			}
		}
	}
	if(opds.length == 1){
		value = opds.pop();
	}
	return value;
}

CalContext.prototype._getCallExpressionResult = function(callToken){
	var tail = null,obj = null;
	for (var i = 0; i < callToken.callee.length; i ++) {
		var name = callToken.callee[i];
		if(i == 0) {
			obj = this.dataMap[name];
			tail = obj.data;
			continue;
		}
		tail = tail[name];			
	}
	//判断tail是变量，函数，对象属性，对象方法
	if(typeof tail == "function") {
		var args = [];
		//计算参数
		for (var i = 0; i < callToken.args.length; i++) {
			var arg = this._execute(callToken.args[i]);
			args.push(arg);
		}
		//执行
		if(obj.data === tail) {//函数
			//执行 函数
			var result = tail.apply(obj.context || {},args);
			return result;
		} else {//对象方法
			//执行 对象方法
			var result = tail.apply(obj.data,args);
			return result;
		}
	} else {
		return tail;//变量 或 对象属性
	}
}

CalContext.prototype._getVarValue = function(exprToken){
	var varName = exprToken.value;
	var val = this.dataMap[varName].data;
	return val;
}
//词法分析后的单词流
CalContext.prototype.getTokens = function(){
	return this.tokens;
};
//最终的语法栈
CalContext.prototype.getFinalTokens = function(){
	return this.finalTokens;
};
//在值栈中添加变量，函数，对象（支持对象方法）
CalContext.prototype.putData = function(name,data,context){
	this.dataMap[name] = {
		data:data,
		context:context
	};	
};
//清除值栈中所有的自定义数据——若不再使用表达式，最好调用此方法清理数据
CalContext.prototype.clearAll = function(){
	this.dataMap = {};
};
CalContext.prototype.assertEqual = function(expr,result){   
	context = this;  
    console.group("测试样例：" + expr);
    console.time("编译和执行");
    var _result = context.calc(expr);     
    console.timeEnd("编译和执行");
    if(result == _result)
       console.log("计算结果%c[%s]：%s=%f","font-size:20px; color:green;","成功",expr,_result);
    else
       console.log("计算结果%c[%s]：%s=%f","font-size:20px; color:red;","失败",expr,_result);
    console.log("单词流：");
    console.log(context.tokens);
    console.log("语法栈：");
    console.log(context.getFinalTokens());     
    console.assert(result == _result,"测试失败");     
    console.groupEnd();
};