## 运算表达式类库
采用逆波兰表达式的实现，未打勾表示暂时还没实现但是计划会实现。  
实现过程中参考了一些其他资源，就不一一列举了。  

## 测试截图
### Chrome浏览器环境测试截图
![结果图片](/demo1.jpg)
### JS标准内核环境测试截图
![结果图片](/demo2.jpg)


## 更新说明
[更新说明](UPDATE.md "更新说明")

## 文件说明
- expression.js,index.html是完整版本
- expression_simple.js,index_simple.html是简易版本（只支持四则运算和变量）

## 主要功能
- [x] 支持四则运算
- [x] 支持浮点数
- [x] 支持自定义变量
- [x] 支持自定义函数
- [x] 支持自定义函数参数嵌套
- [x] 支持自定义对象之对象变量访问（包括嵌套）
- [x] 支持自定义对象之函数调用（包括嵌套）
- [ ] 浮点数精度问题
- [ ] 对象方法连续调用（比如：obj.fun1(1).eda.fun2(1,2)）
- [x] 标准JS语法，除了测试函数，核心功能不依赖浏览器环境（比如window,dom,console等）

## 使用举例
  <pre>
    var context = new CalContext();
    //增加值栈——变量
    context.putData("$a",5);
    //增加值栈——变量
    context.putData("PI",3);
    //增加值栈——无参数函数
    context.putData("fun0",function(){ return 1000;});
    //增加值栈——单参数函数
    context.putData("fun1",function(a){ return 10 * a;});
    //增加值栈——多参数函数
    context.putData("fun2",function(a,b){ return 10 * a + b;});
    //增加值栈——对象方法（如果使用了浏览器window对象的方法或属性，则必须传入window作为上下文）
    var t = {
      year: 28,
      fun: function(a) {
        return a + this.year;
      }
    };
    context.putData("fun3",t.fun,t);//这里需要将对象传入，作为回调上下文
    //增加值栈——对象
    context.putData("people",{
       age: 28,
       bat: 3,
       fun1: function(){
         return this.age + 2;
       },
       fun2: function(a){
         return this.age + 10 * a;
       },
       fun3: function(a,b){
         return this.age + 10 * a + b;
       },
       skill: {
          lang : function(a){
              return a + this.bat;
          }
       }
    });

    //获取值
    //var result = context.calc(expr);

    //下面是测试用例

    context.assertEqual("40+8*2",56);

    context.assertEqual("40*8+2",322);

    context.assertEqual("40/8+2",7);

    context.assertEqual("40+8/2",44);

    context.assertEqual("(40+8)/2",24);

    context.assertEqual("40*(8-2)",240);

    context.assertEqual("10%3 + 1",2);

    context.assertEqual("0.1 + 1 + 0.3",1.4);

    context.assertEqual("0.1 *10 + 6.3",7.3);

    context.assertEqual("$a + 5",10);

    context.assertEqual("$a + fun0()",1005);

    context.assertEqual("$a + fun0() + 100",1105);

    context.assertEqual("$a + fun1(1)",15);

    context.assertEqual("$a + fun2(2,1)",26);

    context.assertEqual("$a + fun2(3+7,3)",108);

    context.assertEqual("$a + fun2(fun1(2),3) + 20",228);

    context.assertEqual("11 + people.age / 2 + 6",31);

    context.assertEqual("11 + people.age / 2 + fun1(1)",35);

    context.assertEqual("11 + fun1(people.age / 2)/2 + 1",82);

    context.assertEqual("$a + fun3(2) + people.fun1(1)",65);

    context.assertEqual("$a + fun3(2) + people.skill.lang(1)",39);

    //10 + (28+2) + 106 * 2 + 24 = 276
    context.assertEqual("10 + fun3(2) + people.skill.lang(fun2(3+7,3)) * 2 + 24",276);

    context.assertEqual("PI * 2 + 3",9);
  </pre>

