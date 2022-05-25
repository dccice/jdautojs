// 判断停留时间
var JUDGE_TIME = 0;
var appName = "com.jingdong.app.mall";
init();
/**
 * 初始化
 */
function init() {
    // 子线程监听脚本
    threads.start(function () {
        events.setKeyInterceptionEnabled("volume_up", true);
        //启用按键监听
        events.observeKey();
        //监听音量上键按下
        events.onKeyDown("volume_up", function (event) {
            console.log("脚本退出!")
            exit();
        });
    });

    console.show();
    while (true) {

        enterActivity();
        recoverApp();

        getNeedSelector();
     

    }
}
/**
 * 进入做任务界面
 */
function enterActivity() {
    if (!launch(appName)) {
        console.log('可能未安装京东App')
    }
    // console.info("准备进入任务界面");
    if (!textContains("累计任务奖励").exists()) {
        sleep(1000);
        if (textContains("累计任务奖励").exists()) {
            console.info("已经在任务界面");
            sleep(1000);
            headerXY = id("a96").findOne().bounds();
        } else {
            if (desc("浮层活动").exists()) {
                console.info("点击浮层活动");
                var huodong = desc("浮层活动").findOne().bounds();
                randomClick(huodong.centerX(), huodong.centerY());
                sleep(1000);

            }
                // 获取进入做任务界面的控件
                var button = className('android.view.View')
                    .depth(15)
                    .indexInParent(5)
                    .drawingOrder(0)
                    .clickable();
                
                if (button.exists()) {
                    console.info("点击进入做任务界面")
                    var rect = button.findOne().click();
                    sleep(1000);
                } else {
                    console.info("无法进入做任务界面,请手动点入")
                }

        }
    }
}

/**
 * 加入购物车
 */
function addMarketCar() {
    if (textContains('当前页点击浏览4个').exists() || textContains('当前页浏览加购').exists()) {
        console.info("在加购页面");
        const productList = textContains('¥').find()//desc("￥").find();
        console.info(productList.length);
        // }
        //const productList = className('android.widget.Button').depth(19).clickable().find()
        var count = 0;
        for (index = 0; index < productList.length; index++) {
            if (count == 4) {
                if (back()) {
                    sleep(3000)
                    count = 0;
                    break;
                }
            }
            if (productList[index].parent().parent().children()[4].click()) {
                // 重置计时
                JUDGE_TIME = 0;
                log("加购浏览任务:正在添加第" + (index + 1) + "个商品");
                sleep(2000);
                while (true) {
                    if (back()) {
                        count = count + 1;
                        sleep(2000);
                        if (textContains("当前页").exists()) {
                            break;
                        }
                    }
                }
            }
        }
    }

}
/**
 * 获取需要进行的控件
 * @returns 
 */
function getNeedSelector() {
        sleep(2000)
        var allSelector,parent=null
        allSelector = className('android.view.View')
        .depth(19)
        .indexInParent(3)
        .drawingOrder(0)
        .clickable()
        .find();
        var flag = false
          for (let index = 0; index < allSelector.length; index++) {
            var parent = allSelector[index].parent()
              if (parent != null && parent.parent() != null && parent.parent().childCount() >= 3) {
                    var r = parent.child(1).text().match(/(\d)\/(\d*)/)
                    if(r[2]-r[1] > 0){
                        if (parent.child(2).text().match(/每邀1个好友/)) continue
                        if (parent.child(2).text().match(/入会/)) continue
                        if (parent.child(2).text().match(/下单/)) continue
                        flag = goTask(parent.child(2).text(),parent,r[2]-r[1]);
                        
                    }
                }
        }
        if(!flag){
            console.error("没有可以做的任务了")
            // exit()
        }
}
function goTask(text,parent,count) {
    console.log('需要进行' + count + '次“' + text + '”类任务')
        // 获取去完成按钮
        var button = parent.child(3);
        for(index =0;index <count;index++){
            button.click();
            console.info('正在进行第%s次任务',index+1)
             if(text.indexOf("8s") > -1){
                 //需要浏览8s的任务
                 timeTask()
                }else if(text.indexOf("累计浏览")> -1){
                    while(true){
                        if (textContains("当前页点击浏览").exists() && textStartsWith("¥").find().length > 0) {
                            var product = textStartsWith("¥").find()[0].parent().parent().parent().childCount();
                            if (product >= 4) {
                                log("进入浏览任务")
                                for (var i = 0; i <= 3; i++) {
                                    if (textStartsWith("¥").find()[i].parent().parent().children()[4].click()) {
                                        sleep(1000);
                                        log("加购并返回");
                                        while (!textContains("当前页点击浏览").exists() && back()) {
                                            sleep(1000 * 2);
                                        }
                                    }
                                }
                                if (back()) {
                                    sleep(1000);
                                    break;
                                }
                            }
                        }else if (textContains("当前页浏览加购").exists() && textStartsWith("¥").find().length > 0) {
                            addMarketCar();
                           break;
                        }
                    }
                    
                    viewAndFollow();
                }else if(parent.child(1).text().indexOf("种草") > -1){
                    if (textContains("品牌种草城").exists()) {
                        for (var j = 0; j < 4; j++) {
                            if (textContains("喜欢").exists() && textContains("喜欢").click()) {
                                while(!textContains("喜欢").click() && back()) {
                                    sleep(1000);
                                }
                                
                            }
                        }
                      
                    }
                }else{
                    console.log('看下就完成')
                    sleep(1000);
                    viewAndFollow();
                }
            
                
        }
        console.info("进行下一个任务")
        return true;

    }
    

// 浏览n秒的任务
function timeTask() {
    console.log('等待浏览任务完成...')
    JUDGE_TIME = 0
    while (true) { 
        let finish_reg = /获得.*?金币|已达上限/
        if ((textMatches(finish_reg).exists() || descMatches(finish_reg).exists())){
            // 等待已完成出现，有可能失败
            viewAndFollow();
            break
        } 
        sleep(1000)
        JUDGE_TIME++;
        recoverApp()
    }
    
}
/**
 * 返回
 */
function viewAndFollow() {
    console.info("回到任务首页")
    trytime = 0;
    while (!textContains("累计任务奖励").exists() && trytime < 10) {
        back();
        sleep(1000);
        trytime++;
    }
}
/**
 * 自动判断程序是否卡顿，恢复方法
 * 判断依据：1.不在活动界面 2.停留某个界面长达30s
 * @returns 
 */
function recoverApp() {
    if (!text("累计任务奖励").exists() && JUDGE_TIME > 30) {
        if (back()) {
            // 计时器重置
            JUDGE_TIME = 0;
            console.warn("停留某个页面超过30s,自动返回，重置定时器。");
            
        }
    }
}
/**
 * 点击
 * @param {横坐标} x 
 * @param {纵坐标} y 
 */
 function randomClick(x, y) {
    var rx = random(0, 5);
    var ry = random(0, 5);

    click(x + rx, y + ry);
    sleep(2000);
    return true;
}    
