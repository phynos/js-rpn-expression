/*!
 * 逆波兰表达式库--数学拓展库
 * RPN-expression JavaScript Library
 *
 *
 * Copyright lupc-贺兰
 * Released under the MIT license
 *
 * Date: 2018-04-18
 */

function addMathFunction(context){
	context.putData("tan",function(a){
		return Math.tan(a);
	});
	context.putData("sin",function(b){
		return Math.sin(b)
	});
}