## 四则运算表达式实现
采用逆波兰表达式的实现

## 主要功能
- [x]支持四则运算
- [x]支持自定义变量
- [ ]支持自定义函数
- [ ]支持自定义对象以及对象变量和函数访问
- [ ]支持常用数学函数

## 使用举例
  <pre>
     var context = new CalContext();
     context.putData("$a",5);//增加值栈——变量
     context.putData("tan",function(a){return Math.tan(a);});//增加值栈——函数
     context.putData("people",{
        year: 28,
        getRealYear: function(){
          return this.year + 2;
        }
     });//增加值栈——对象

     context.test("40+8*2",56);

     context.test("40*8+2",322);

     context.test("40/8+2",7);

     context.test("40+8/2",44);

     context.test("(40+8)/2",24);

     context.test("40*(8-2)",240);

     context.test("$a + 5",10);  
  </pre>

