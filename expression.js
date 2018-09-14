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
var TOKEN_IDENTIFIER = "identifier";
var TOKEN_EOF = "eof";

function isOperator(c) { return /[+\-*\/\^%=()]/.test(c); };
function isDigit(c) { return /[0-9]/.test(c); };
function isAlphaOrLine(c) { return /[a-zA-Z_\$]/.test(c); };
function isAlphaOrLineOrNumber(c) { return /[0-9a-zA-Z_\$]/.test(c); };
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
	} else {
		throw new "你必须用new关键字调用构造函数";
	}
};
CalContext.prototype.calc = function(expression){
	//
	this.charIndex = 0;
	//表达式转换
	var finalTokens = this._expr(expression);
	this.finalTokens = finalTokens;
	//执行
	var result = this._execute(finalTokens);
	return result;
};

//
CalContext.prototype._next = function(expression){
	var c,that = this;
	var createToken = function(type,value){
		var token =  {
			type: type,
	    	value: value
		};
		that.currentToken = token;//记录当前的token
		return token;
	};
	while(this.charIndex < expression.length){
		c = expression[this.charIndex];
		if(isDigit(c)){
			var num = parseInt(c);
			var num2 = 0;//如果是浮点数，先用此数记录小数后的部分
			var isFloat = false;
			this.charIndex++;		
			while(this.charIndex < expression.length){				
				c = expression[this.charIndex];
				if(isFloat) {
					if(isDigit(expression[this.charIndex])){
						this.charIndex++;
						if(num2 == 0){
							num2 = parseInt(c);
						} else {
							num2 = num2*10 + parseInt(c);
						}
						if(this.charIndex == expression.length){
							num = parseFloat(num + "." + num2);	
						}
					} else {
						num = parseFloat(num + "." + num2);
						break;
					}
				} else {
					if(isDigit(expression[this.charIndex])){
						this.charIndex++;
						num = num * 10 + parseInt(c);				
					} else if(c == "."){
						this.charIndex++;
						isFloat = true;
					} else {
						break;
					}
				}			
			}
			return createToken(TOKEN_NUMBER,num);
		} else if(c == ",") {
			this.charIndex++;
			return createToken(TOKEN_EOF,0);//逗号也作为终结符（2个表达式之间的分隔符）
		} else if(isOperator(c)){
			this.charIndex++;
			return createToken(TOKEN_OPERATOR,c);
		} else if(isWhiteSpace(c)){
			this.charIndex++;
		} else if(isAlphaOrLine(c)){//标识符（变量，函数，对象属性，对象方法）
			var name = c;
			this.charIndex++;
			while(this.charIndex < expression.length){
				c = expression[this.charIndex];
				if(isAlphaOrLineOrNumber(c)){
					this.charIndex++;
					name = name + c;
				} else if(c == "("){//函数
					return createToken(TOKEN_IDENTIFIER,name);
				} else if(c == ".") {//对象
					this.charIndex++;//忽略对象属性直接的 点号
					return createToken(TOKEN_IDENTIFIER,name);
				} else {
					return createToken(TOKEN_IDENTIFIER,name);
				}
			}
		} else {
			throw "非法字符" + c;
		}
	}
	return createToken(TOKEN_EOF,0);
}
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
CalContext.prototype._expr = function(expression){
	var qcount = 0;//正括号的个数
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
	var curToken = null,curOperand,curOperator;	
	while( (curToken = this._next(expression)).type != TOKEN_EOF){
		if(curToken.type == TOKEN_NUMBER){
			curOperand = curToken;
			addOperand(curOperand);
			continue;
		} else if(curToken.value == "("){
			qcount++;//运算符括号计数
			curOperator = curToken;
			addOperator(curOperator);
			continue;
		} else if(qcount == 0 && curToken.value == ")") {//处理函数的括号（函数的正括号已经处理过）
			break;
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
			//循环处理属性调用
			while(true) {
				var cIndex = this.charIndex;// 记录当前字符位置	
				var nextToken = this._next(expression);
				if(nextToken.type == TOKEN_IDENTIFIER) {
					curOperand.callee.push(nextToken.value);
				} else if(nextToken.value == "(") {	
					//循环处理 函数参数（每个参数都是一个独立的表达式）
					while(true){
						//参数表达式						
						var _fpTokens = this._expr(expression);
						curOperand.args.push(_fpTokens);
						//参数处理完毕则 退出循环
						if(this.currentToken.value == ")")
							break;
					}
					break;
				} else {
					this.charIndex = cIndex;//还原
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
							qcount--;//运算符括号计数
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

CalContext.prototype.assertEqualChrome = function(expr,result){ 
	var context = this;  
    console.group("测试样例：" + expr);
    console.time("编译和执行");
    var _result = context.calc(expr);     
    console.timeEnd("编译和执行");
    if(result == _result)
       console.log("计算结果%c[%s]：%s=%f","font-size:20px; color:green;","成功",expr,_result);
    else
       console.log("计算结果%c[%s]：%s=%f","font-size:20px; color:red;","失败",expr,_result);
    console.log("语法栈：");
    console.log(context.getFinalTokens());     
    console.assert(result == _result,"测试失败");     
    console.groupEnd();
}
CalContext.prototype.assertEqualBrower = function(expr,result){ 
	var context = this;  
    console.log("测试样例：" + expr);
    var _result = context.calc(expr);     
    if(result == _result)
       console.log("计算结果[成功]：" + expr + "=" + _result);
    else
       console.log("计算结果[失败]：" + expr + "，实际值：" + _result + "，期望值：" + result);
    console.log("语法栈：");
    console.log(context.getFinalTokens());     
    console.assert(result == _result,"测试失败");     
    console.log("----------------------------");
}
CalContext.prototype.assertEqual = function(expr,result){   
	if(console == undefined && print == undefined) {
		throw "当前环境不支持打印，请直接调用";
	} else if(console && (console.group == undefined || console.time == undefined)) {
		this.assertEqualBrower(expr,result);
	} else if(console){
		this.assertEqualChrome(expr,result);
	} else {
		throw "当前环境不支持打印，请直接调用";
	}
};

//导出
if(typeof module === "undefined") {
	
} else {	
	module.exports = CalContext;
}
