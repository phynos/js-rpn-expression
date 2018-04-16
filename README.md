## 运算表达式类库
采用逆波兰表达式的实现

## 主要功能
- [x] 支持四则运算
- [x] 支持浮点数
- [x] 支持自定义变量
- [ ] 支持自定义函数
- [ ] 支持自定义对象以及对象变量和函数访问
- [ ] 支持常用数学函数

## 使用举例
  <pre>
     var context = new CalContext();
     //增加值栈——变量
     context.putData("$a",5);
     //增加值栈——无参数函数
     context.putData("fun0",function(){return 1000;});
     //增加值栈——单参数函数
     context.putData("fun1",function(a){return Math.tan(a);});
     //增加值栈——多参数函数
     context.putData("fun2",function(a,b){return Math.tan(a) + Math.tan(b);});
     //增加值栈——对象
     context.putData("people",{
        year: 28,
        fun1: function(){
          return this.year + 2;
        },
        fun2: function(a){
          return this.year + Math.tan(a);
        },
        fun3: function(a,b){
          return this.year + Math.tan(a) + Math.tan(b);
        }
     });

     //获取值
     //var result = context.calc(expr);

     //下面是测试用例

     context.test("40+8*2",56);

     context.test("40*8+2",322);

     context.test("40/8+2",7);

     context.test("40+8/2",44);

     context.test("(40+8)/2",24);

     context.test("40*(8-2)",240);

     context.test("0.1 + 1 + 0.3",1.4);

     context.test("0.1 *10 + 6.3",7.3);

     context.test("$a + 5",10);

     context.test("($a + 1)/2 + 1",4);  
  </pre>

