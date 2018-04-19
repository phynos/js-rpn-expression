/*!
 * 逆波兰表达式库--运算符和表达式拓展
 * 以函数的形式支持
 * RPN-expression JavaScript Library
 *
 *
 * Copyright lupc-贺兰
 * Released under the MIT license
 *
 * Date: 2018-04-19
 */

function addMathFunction(context){
	context.putFunction("condition",function(a,b,c,d){
		return a == b? c:d;
	});
	context.putFunction("equal",function(a,b,c,d){
		if(a == b)
			return c;
		else
			return d;
	});
}