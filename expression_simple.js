/*!
 * 逆波兰表达式库--简易版本
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

function isOperator(c) { return /[+\-*\/\^%=(),]/.test(c); };
function isDigit(c) { return /[0-9]/.test(c); };
function isAlphaOrLine(c) { return /[a-zA-Z_]/.test(c); };
function isAlphaOrLineOrNumber(c) { return /[0-9a-zA-Z_]/.test(c); };
function isWhiteSpace(c) { return /\s/.test(c); };
function isLeftBrackets(c) { return c == "(";};
function isRightBrackets(c) { return c == ")";};

//按优先级排列：(,),*,/,+,-
//获取运算符优先级，数值越大，优先级越低
function getPriority(op){
	var _op = op.value;
	if(_op == "(")
		return 0;
	else if(_op == ")")
		return 10;
	else if(_op == "*")
		return 30;
	else if(_op == "%")
		return 32;
	else if(_op == "/")
		return 31;
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
	} else {
		throw new "你必须用new关键字调用构造函数";
	}
};
CalContext.prototype.calc = function(expression){
	//词法分析
	this.parse(expression);
	//表达式转换
	this.expr();
	//执行
	var result = this.excecute();
	return result;
};
//词法分析
CalContext.prototype.parse = function(expression){
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
			var num = this.dataMap[varName];
			addToken(TOKEN_NUMBER,num);			
		} else {
			throw "非法字符" + c;
		}
	}
	this.tokens = tokens;
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
CalContext.prototype.expr = function(){
	var operandStack = [];//操作数堆栈
	var addOperand = function(operand){
		operandStack.push({
		    type: operand.type,
		    value: operand.value
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
	var i = 0,curToken,curOperand,curOperator;
	for (var i = 0; i < this.tokens.length; i++) {
		curToken = this.tokens[i];
		if(curToken.type == TOKEN_NUMBER){
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
		} else {
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
	this.finalTokens = finalTokens;
};
/*
  逆波兰表达式求值算法：
  1、循环扫描语法单元的项目。
  2、如果扫描的项目是操作数，则将其压入操作数堆栈，并扫描下一个项目。
  3、如果扫描的项目是一个二元运算符，则对栈的顶上两个操作数执行该运算。
  4、如果扫描的项目是一个一元运算符，则对栈的最顶上操作数执行该运算。
  5、将运算结果重新压入堆栈。
  6、重复步骤2-5，堆栈中即为结果值。
*/
CalContext.prototype.excecute = function(){
	var value;
	var opa,opb;
	var opds = [];
	for (var i = 0; i < this.finalTokens.length; i++) {
		var token = this.finalTokens[i];

		if(token.type == TOKEN_NUMBER){
			//如果为操作数则压入操作数堆栈
			opds.push(token.value);
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
};
//打印tokens
CalContext.prototype.getTokens = function(){
	return this.tokens;
};
CalContext.prototype.getFinalTokens = function(){
	return this.finalTokens;
};
//在值栈中添加数据，只支持变量
CalContext.prototype.putData = function(name,data){
	this.dataMap[name] = data;
};
//清楚值栈中所有的自定义数据
CalContext.prototype.clearAll = function(){
	this.dataMap = {};
};
CalContext.prototype.test = function(expr,result){   
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