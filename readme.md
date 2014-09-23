[TOC]

#前端自动化测试Jasmine+Karma+TravisCI实践
  
  &emsp;&emsp;单元测试在软件开发过程中是一个很重要的环节， 不仅因为它能减少后续代码修改造成错误的风险， 
  而且它还是开发者理解需求， 协助自己开发的有力助手。 随着Javascript的发展， 它的测试工具也已经非常完善，
 开发者可以很轻松的借助这些工具完成单元测试。
 
 &emsp;&emsp;本文适用于刚了解单元测试以及手动执行测试的读者， 所以先从文章中涉及的一些测试概念说起。
  
 &emsp;&emsp;单元测试（Unit Testing）是针对程序模块（软件设计的最小单位）来进行正确性检验的测试工作，程序单元是应用的
 最小可测试部件。在面向过程的编程中， 一个单元就是单个程序、函数、过程等， 在面向对象的编程中， 最小单元
 就是方法。[[1]](http://zh.wikipedia.org/wiki/%E5%8D%95%E5%85%83%E6%B5%8B%E8%AF%95)。 单元测试具有适应变更、简化集成、
 文档记录、表达设计的特性， 其中对于前端开发者来说最突出的优点就是适应变更以及文档记录，编写单元测试可以让开发者
 摆脱编码的惯性思维，从使用者角度重新审视已有代码， 并记录代码使用方法、正确运行条件以及潜在异常与错误。它的表达设计的
 特性体现在TDD测试驱动开发中， 在编码前编写测试，可以确保开发者正确理解应用需求，避免因错误理解需求造成的无效编码。
 
 &emsp;&emsp;持续集成CI（Continuous Integration）是一种实践，可以让团队在持续的基础上收到反馈并进行改进，不必等到开发
 周期后期才寻找和修复缺陷。通俗一点儿说：就是指对于开发人员的每一次代码提交，都自动地把Repository中所有代码Check out到
 一个空目录，并且自动运行所有Test Case。如果成功则接受这次提交，否则告诉所有人，这是一个失败的Revision[[2]](http://blog.csdn.net/cnbird2008/article/details/8745043)。
更具体的解释可以参考Martin fowler的[Continuous Integration](http://www.martinfowler.com/articles/continuousIntegration.html)。

##1.工具介绍
&emsp;&emsp;单元测试以及持续集成的工具有很多的选择，本文使用Jasmine做单元测试， Karma自动化完成单元测试并执行代码覆盖率检测， 
Travis完成基于github平台的CI持续集成。

###1.1 单元测试工具
&emsp;&emsp;[Jasmine](http://jasmine.github.io/)是一种独立的行为驱动开发（[BDD](http://www.iteye.com/topic/417899)）框架,
它的语法非常接近自然语言， 非常容易理解， 它能很方便的和Grunt以及Karma等工具集成完成自动化测试。与其他测试框架相比，最
突出的优势是它支持在已有API的基础上进行扩展， 实现更多的功能。Jasmine不仅可以测试前端程序， 还支持nodejs等后端测试， 它的语法很
简单， 如下图， 首先使用`describe`函数封装一个测试集合， 这个测试集合被称为`Suite`；一个测试集合中包含了多个测试用例（`Spec`），
每个测试用例使用`it`函数封装；程序通过`expect`函数实现断言判断，在每个测试用例执行前，可以使用`beforeEach`执行一些setup逻辑，
同样地可以使用`afterEach`完成测试恢复restore逻辑。
```javascript
describe("A suite", function() {
  var foo = 0;
  beforeEach(function() {
    foo = 1;
  });

  afterEach(function() {
    foo = 0;
  });

  it("contains a spec with an expectation", function() {
    expect(foo).toBe(true);
  });
});
```

###1.2 测试自动化工具
&emsp;&emsp;[Karma](http://karma-runner.github.io/0.12/index.html)是基于NodeJs的测试执行过程管理工具。它可以用于测试所有
主流Web浏览器， 也可集成到CI工具[[3]](http://blog.fens.me/nodejs-karma-jasmine/)。Karma支持Chrome、ChromeCanary、 Safari、Firefox、IE、Opera、PhantomJS，有专门针对Jamsine
、Mocha和AngularJS的适配器，它也可以与Jenkins和Travis整合，用于执行CI持续集成测试。 它最实用的功能就是autoWatch， 它会监控
源码文件的变化自动执行测试脚本。Karma的使用也非常简单， 只需要一个配置文件告诉Karma待测试文件的路径、需要忽略的文件，测试的浏览器、
使用的测试框架等基本信息。下面是一个基本的配置：
```javascript
module.exports = function (config) {
    config.set({
        basePath: '.',
        frameworks: ['jasmine'],
        files: ['*.js'],
        exclude: ['karma.conf.js','Gruntfile.js'],
        reporters: ['progress'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['PhantomJS'],
        captureTimeout: 60000,
        singleRun: false
    });
};
```

###1.3 CI持续集成服务
&emsp;&emsp;[Travis CI](https://travis-ci.org/)不同于[CruiseControl](http://cruisecontrol.sourceforge.net/)和[Jenkins](http://jenkins-ci.org/)
，Travis提供了已经配置好， 可直接使用的免费CI系统， 如果你的项目是搭建在github上且开源，那么直接使用TravisCI系统可以省去搭建配置CI服务器的成本和时间。
类似的工具还有[gitlab-ci](https://about.gitlab.com/gitlab-ci/)。

##2.自动化测试环境搭建
&emsp;&emsp;在进行下面工具安装前， 请先安装好[NodeJS](http://www.nodejs.org/)和[Grunt](http://gruntjs.com/)。

     源码可在https://github.com/nupthale/jasmine_karma_travis下载

###2.1 创建项目
&emsp;&emsp;`1` 在`github`上新建一个空repo， 然后clone到本地目录， 在目录中创建如下目录结构：

&emsp;&nbsp;![初始目录结构](http://gtms04.alicdn.com/tps/i4/TB1PtIjGXXXXXczXFXXP.4SKFXX-677-174.jpg)

&emsp;&emsp;其中package.json的初始内容如下：

```javascript
{
    "name":"test",
    "version":"0.0.1"
}
```

&emsp;&emsp;`2` src目录下的`index.js`为我们的源码文件，indexSpec.js为对应的测试文件， 在index.js中写入一个简单的函数：

```javascript
function add(a, b) {
    return a + b;
}
```

&emsp;&emsp;`3` 对应地， 在`indexSpec.js`中写好add函数的测试用例：

```javascript
describe("A suite of add function", function() {
    it("add two numbers",function(){
        expect(add(1,2)).toEqual(3);
    });
});
```


###2.2 工具的安装
####2.2.1 安装grunt
```
$ npm install -D grunt
-D 参数同--save-dev
```

####2.2.2 安装Karma

```
$ npm install -D karma
```
&emsp;&emsp;安装好后, 在cmd中执行karma命令， 如果有问题， 请参考Q&A一节。如果提示如下， 则表示安装成功：
```
Command not specified.
Karma - Spectacular  Test Runner for Javascript.

Usage: ...
```

####2.2.3 安装karma-jasmine

```
$ npm install -D　karma-jasmine
```

&emsp;&emsp;[karma-jasmine](https://www.npmjs.org/package/karma-jasmine)是Karma针对jasmine的`适配器`， 使用jasmine框架， 则必须安装这个适配器， 并且
在karma的配置文件中，声明使用了这个适配器。声明方法是在配置文件中将`karma-jasmine`加入plugins属性的数组中。

####2.2.4 安装karma-phantomjs-launcher
&emsp;&emsp;如果不集成Travis CI， 那么这个是不需要安装的。 由于Travis CI自带浏览器中没有`Chrome`，只能使用`Firefox`或者`PhantomJS`，而`Karma`使用这两个
浏览器是需要独立安装并声明的， 声明方法如上面的`karma-jasmine`， 如果需求必须使用`Chrome`， 那么解决方法可见Q&A一节。
这里使用`PhantomJS`， 首先安装, 插件的声明详见`配置Karma`一节。
```
$ npm install -D karma-phantomjs-launcher
```

####2.2.5 Travis CI
&emsp;&emsp;正如1.3节的描述， Travis CI是已经搭建好的一个服务平台， 这里不需要我们自己搭建， 使用github账号登录Travis系统即可。

###2.3. 搭建实验环境

####2.3.1 配置karma
&emsp;&emsp;新建`karma.conf.js`文件（这个文件也可通过`karma init`命令来生成）， 配置如下, karma的配置也可以通过
使用grunt插件[grunt-karma](https://github.com/karma-runner/grunt-karma)来实现， 这个插件可以管理多个karma配置文件， 也可以使用插件中的配置运行karma。
```javascript
module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    // list of files / patterns to load in the browser
    files: [
      'src/*.js',
      'test/specs/*Spec.js'
    ],
    plugins: [
          'karma-jasmine',
          'karma-phantomjs-launcher'
    ],
    exclude: [],
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['PhantomJS'],
    singleRun: true
  });
};
```
&emsp;&emsp;Karma会将`files`属性设置的值加载到浏览器中， 所以无需我们手动将`jasmine`文件、源码文件、测试文件引入测试页面, 实现了自动化。通常在编码环境下， 我们会将`autoWatch`设置为`true`， 一旦我们
修改源码点击保存， 测试就会自动运行。参数的含义详见[karma配置参数](http://karma-runner.github.io/0.8/config/configuration-file.html)

&emsp;&emsp;由于要和Travis CI集成， 所以对Karma的功能会有一些限制， 如Travis CI中无法直接使用`Chrome浏览器`， 如果想使用， 需要配置`.travis.yml`, 在测试前预先安装chrome浏览器，
解决方法可参考Q&A一节。 这里使用`PhantomJS`， 目前已经安装完毕，
然后还需要在配置中声明这个plugin， 如上在`plugins`中加入`karma-phantomjs-lancher`。因为我们使用的是`jasmine`测试框架， 所以还要声明`karma-jasmine`。在远端Travis服务上， 我们不需要`autoWatch`， 否则任务无法结束， 设置`autoWatch`为`false`， 
浏览器测试完毕后需要关闭， 所以设置`singleRun`为`true`。

&emsp;&emsp;如果你不需要集成CI， 那么到这步，本地测试的自动化已经实现。

&emsp;&emsp;现在可以运行`karma start`或者`karma start karma.conf.js`就会看到测试结果。至于Karma是如何找到本地浏览器位置的， 请参见[Correct path to browser binary](http://karma-runner.github.io/0.8/config/browsers.html);
上面的配置针对集成CI做了调整， 可以根据自己需要修改Karma的配置。

####2.3.2 配置Travis CI
&emsp;&emsp;要使用Travis CI， 需要在git repo首级目录中增加一个`.travis.yml`文件， 在这个文件中配置项目所使用的语言、运行环境、构建工具、构建脚本等。最重要的是设置语言， 
因为其他配置都有默认值， 详细的配置参数可见：[travis配置参数](http://about.travis-ci.org/docs/user/build-configuration/)。 下面是我们示例的配置文件：
```
language: node_js
node_js:
  - 0.10
```
&emsp;&emsp;language指明使用的语言是node_js， node_js下面列出使用的node版本，- 0.10意思是0.10.x中的最新版， 可指定多个版本， Travis CI会将程序在每个版本下运行一遍， 在用户界面中， 可以看到每个版本运行的情况。

####2.3.3 配置package.json
&emsp;&emsp;最后， 需要告诉CI如何运行Karma， 在package.json中加入如下片段:
```
"scripts":{
    "test":"./node_modules/karma/bin/karma start karma.conf.js"
}
```


##3.测试实践

&emsp;&emsp;在集成CI前， 确保文件结构如下， 并且文件内容与上面一致。

![最终目录结构](http://gtms04.alicdn.com/tps/i4/TB1CRZlGXXXXXbzXFXXl1R8KFXX-677-284.jpg)

&emsp;&emsp;`1` 使用github登录[Travis CI](https://travis-ci.org/), 登录后在`Account->Repositories`中， 将之前新建的repo设置为`On`状态， 如下图：
如果没有看到新建的repo， 那么可以点击`Sync now`进行同步。

![打开repoCI功能](http://gtms03.alicdn.com/tps/i3/TB1C6owGXXXXXaKXXXXsxCUTXXX-623-289.png)

&emsp;&emsp;`2` 将当前的状态提交至github后， 再次进入Travis CI可以看到测试记录以及运行结果。在上一步打开/关闭的checkbox旁边有一个`设置图标`， 点击它可以看到和这个repo相关的build记录， 在build history的tab
中， 点击build序号， 就可以查看到运行的详细信息， 如travis都执行了哪些命令， 哪些命令出错等。如果执行失败， Commiter会收到一封来自Travis CI的通知邮件。 如果没有收到邮件， 解决办法参见Q&A一节。
![build history](http://gtms04.alicdn.com/tps/i4/TB1tqZvGXXXXXbsXXXXrCd6KFXX-677-275.jpg)

##4.Extra Stuff
&emsp;&emsp;Karma还可以用来自动化代码测试覆盖率Coverage， 遗憾的是暂时没有发现将它集成到Travis CI中的方法， 只发现[Code Climate](http://docs.travis-ci.com/user/code-climate/)这个收费的平台。

&emsp;&emsp;要集成代码测试覆盖率这个功能到Karma， 需要先安装`karma-coverage`, 安装方法如下：
```
$ npm install -D karma-coverage
```

&emsp;&emsp;安装完毕后， 在`karma.conf.js`配置文件中, 加入如下配置：
```javascript
plugins: [
  'karma-jasmine',
  'karma-coverage',
  'karma-phantomjs-launcher',
],
reporters: ['progress','coverage'],
preprocessors:{'./src/index.js':['coverage']},
coverageReporter:{
    type:'html',
    dir:'coverage/'
},
```
&emsp;&emsp;当下次运行`karma start`后， 就可以看到在首级目录中多了一个`coverage`目录， 在里面生成了对源码测试覆盖率的`html`文件， 
打开后，如果成功， 则显示绿色背景， 各项参数都是100%， 如果没有完全覆盖的话， 例如在index.js的add函数中加入一个分支， 如下：
```javascript
function add(a, b) {
    if(a === 100) { return 0; }
    return a + b;
}
```
&emsp;&emsp;结果如下图：

&emsp;![coverage测试结果](http://gtms03.alicdn.com/tps/i3/TB1CnUqGXXXXXczXFXX_xdTKFXX-677-176.jpg)

&emsp;&emsp;点击`./src/`链接， 进入后可以查看更详细的信息， 如哪行没有测试到：

&emsp;![coverage详细信息](http://gtms04.alicdn.com/tps/i4/TB1717rGXXXXXbCXFXXak0SKFXX-677-173.jpg)


##5.Q&A
Q: 安装Karma运行失败， 提示Karma不是内部或外部命令， 也不是可运行的程序或批处理文件？

A: 

如果全局安装(-g)Karma，可能会提示`'karma'不是内部或外部命令， 也不是可运行的程序或批处理文件。`
解决方法参考[Karma安装后找不到指令](http://blog.csdn.net/cqwshanfeng/article/details/24767045), 在nodejs的安装目录下新建
一个karma.cmd， 添加内容：（IF-ELSE中的路径需要根据自己安装karma的路径进行修改。）

```
:: Created by npm, please don't edit manually.  
@IF EXIST "%~dp0\node.exe" (  
  "%~dp0\node.exe" "C:\Users\Administrator\AppData\Roaming\npm\node_modules\karma\bin\karma" %*  
) ELSE (  
  node "C:\Users\Administrator\AppData\Roaming\npm\node_modules\karma\bin\karma" %*  
) 
```
*****
Q: Travis CI build失败， 可是没有收到通知邮件？

A:

遇到这种情况， 需要检查github上的邮件是否验证通过。 如果使用的是公司内部的@alibaba-inc.com邮件， 则收不到通知， 可使用
下面的命令修改提交用户的email地址， 经测163与qq邮箱都可以。
```
git config user.email xxxx@xxx.com
```
*****
Q: Travis CI有什么方法可以使用Chrome浏览器？

A:

Travis CI中无法直接使用`Chrome浏览器`， 如果想使用， 需要配置`.travis.yml`, 在测试前预先安装chrome浏览器，
解决方法可参考：[TravisCI安装Chrome浏览器](https://github.com/karma-runner/karma/issues/1144#issuecomment-53633076)。 
*****
Q: Karma报错， 提示：“No Provider for 'framework:jasmine'”？

A:

需要安装karma-jasmine， 并且在karma.conf.js配置文件的plugin中声明这个插件。
*****
Q: Travis CI中提示`karma-jasmine`支持的最大版本为`0.2.2`？

A: 如果直接使用`npm install -D karma-jasmine`安装， 安装的版本可能大于`0.2.2`， 在`package.json`中设置karma-jasmine的版本不要大于0.2.2即可， 可以设置为`~0.2.2`。
*****
Q: Travis CI网站提示证书错误， 无法登陆？

A:

可以在[完整代码]()上下载`travis-ci.cer.p7b`文件， 然后将其导入到`Chrome`浏览器的受信任的根证书颁发机构中，重启浏览器即可正常访问了。导入证书方法：设置->高级->管理证书->切换到受信任的根证书颁发机构->导入->选择`travis-ci.cer..p7b`文件， 下一步直到导入成功。
