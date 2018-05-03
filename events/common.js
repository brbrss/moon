"use strict";

{
    let _myEvent = [
        {
            id: 0,
            name: "sample0",
            type: "turnStart",
            condition: function (game) {
                let result = (game.data.misc.turn == 2
                    && game.data.misc.hasTurn == game.data.misc.playerId);
                return result;
            },
            effect: function (game) {
                let fid = game.data.misc.hasTurn;
             
                evtSpeak(game, 0, "欢迎来到辣鸡游戏demo。");                
                evtSpeak(game, 0, "我的名字是" + escCharName(0) + "。");
                evtSpeak(game, 0, "我军的名字是" + escFactionName(fid) + "。");
                evtSpeak(game, 0, "我军的最终目标是占领所有的城。");
                evtSpeak(game, 0, "那么，现在先把城外的敌人打到吧。");
            }
        },
        {
            id: 1,
            name: "sample1",
            type: "turnStart",
            condition: function (game) {
                let result = !evtHasFlag(game, "has_k");
                return false;
            },
            effect: function (game) {
                evtAddFlag(game, "has_k");
                evtBgm(game, "bgm02");
                evtCaption(game, "Happens once.");
            }
        },
        {
            id: 2,
            name: "oreimo",
            type: "turnStart",
            condition: function (game) {
                // 5 kirino
                // 6 manami
                // 7 kyusuke
                let c1 = game.data.misc.hasTurn == game.data.misc.playerId;
                let c2 = !evtHasFlag(game, "flag_evt_2");
                let fid = game.data.misc.playerId;
                let c3 = game.data.charList.find(e => e.id == 5).factionId == fid;
                let c4 = game.data.charList.find(e => e.id == 6).factionId == fid;
                let c5 = game.data.charList.find(e => e.id == 7).factionId == fid;
                let c6 = game.data.misc.turn >= 40;
                let result = c1 && c2 && c3 && c4 && c5 && c6;
                return result;
            },
            effect: function (game) {
                let fid = game.data.misc.playerId;

                evtBgm(game, "bgm02");
                evtSpeak(game, 0, escFactionName(fid) + "正在开会。");

                evtSpeak(game, 6, "……");
                evtSpeak(game, 5, "……");
                evtSpeak(game, 7, "……");
                evtSpeak(game, 6, "决战开始吧。");
                evtSpeak(game, 5, "你在说什么？");
                evtSpeak(game, 6, "应该听得懂我在说什么吧？");
                evtSpeak(game, 5, "噗，不说清楚的话我怎么会知道呢。啊哈哈哈哈哈！");
                evtSpeak(game, 5, "我就跟你说了吧，我正在跟京介交往哟！");
                evtSpeak(game, 5, "现在是什么心情啊？麻奈实小姐，京介被我抢走了，你现在有什么心情啊？");
                evtSpeak(game, 6, "……");
                evtSpeak(game, 5, "小桐桐大胜利——！");
                evtShowCg(game, "cg01");
                evtSound(game, "punch");
                evtSpeak(game, 6, "……");
                evtSpeak(game, 5, "田村村姑，你竟敢……");
                evtSpeak(game, 6, "就是这种心情。");
                evtSpeak(game, 5, "可恶。");
                evtSpeak(game, 5, "看招。");
                evtSound(game, "multipunch");
                evtSpeak(game, 6, "～～～～～～唔！");
                evtSpeak(game, 7, "不要打架，不要打架。");
                evtSound(game, "punch");
                evtSpeak(game, 5, "喝");
                evtSound(game, "multipunch");
                evtSpeak(game, 6, "喝");
                evtSpeak(game, 7, "（好痛……）");

                evtSpeak(game, 5, "你一直一直一直都在阻挠我吧！我可是看你不爽很久了！");
                evtSpeak(game, 6, "是你一直在阻挠我吧！");
                evtSpeak(game, 6, "如果……如果没有你的话……");
                evtSpeak(game, 5, "别怪到别人头上！");
                evtSpeak(game, 6, "我在小京身边已经超过十年以上了！绝对不会输给桐乃。");
                evtSpeak(game, 5, "我从出生就跟他在一起了！妹妹才不会输给青梅竹马。");
                evtSound(game, "multipunch");
                evtSpeak(game, 0, "就这样不停地战啊不停地战啊不停地战啊持续了很久。");
                evtSpeak(game, 6, "兄妹之间的恋爱感情很恶心的喔。");

                evtCaption(game, escFactionName(fid) + "今天也很和平。");
                evtAddPoint(game, 5, "mil", 10);
                evtAddPoint(game, 6, "mil", 10);

                evtAddFlag(game, "flag_evt_2");
            }
        }, {
            id: 3,
            name: "",
            type: "trigger",
            condition: function (game) {
                return false;
            },
            effect: function (game, charId, targetCharId) {
                let char1 = game.data.charList.find(e => e.id == charId);
                let char2 = game.data.charList.find(e => e.id == targetCharId);
                char2.factionId = char1.factionId;
                char1.status = "finished";
                char2.status = "finished";
                evtSpeak(game, char2.id, `能加入${escFactionName(char1.factionId)}是在下的光荣。`);
            }
        }, {
            id: 4,
            name: "rin",
            type: "turnStart",
            condition: function (game) {
                let c1 = game.data.misc.turn == 10;
                let c2 = game.data.misc.hasTurn == 1;
                let c3 = getCity(game, 1).factionId == 1;
                let c4 = getChar(game, 11).factionId == 1;
                let c5 = getChar(game, 10).factionId == 1;
                let c6 = getChar(game, 9).factionId == 1;
                let c7 = !evtHasFlag(game, "flag_evt_4");
                return c1 && c2 && c3 && c4 && c5 && c6 && c7;
            },
            effect: function (game) {
                evtAddFlag(game, "flag_evt_4");
                // 11 
                // 29
                let city = getCity(game, 1);
                city.manpower += 2000;
                city.supplies += 3000;
                city.spear += 800;
                city.sword += 800;
                city.horse += 800;

                evtBgm(game, "bgm03");
                evtShowCg(game, "cg04");
                evtCaption(game, "远坂凛是家住冬木市的一名16岁少女。");
                evtCaption(game, "远坂凛的父亲长年从事玉石珠宝生意，是当地小有名气的乡镇企业家。");
                evtCaption(game, "然而，好景不长，几年前父母因不明原因相继去世。“大表哥”成了远坂凛的监护人。");
                evtShowCg(game, "cg03");
                evtCaption(game, "在“大表哥”的影响下，远坂凛逐渐迷上一款名为《辛亥战争》的集换式卡牌对战游戏。");
                evtCaption(game, "为了抽到一张好牌，远坂凛经常修仙到深夜。");
                evtSpeak(game, 11, "凌晨2点正是适合抽卡的好时辰。");
                evtCaption(game, "几年时间，远坂凛将父亲留下的宝石全部投入了充值中。");
                evtShowCg(game, "cg02");
                evtSpeak(game, 29, "凛，限时活动已经开始了，你还没出货吗？");
                evtSpeak(game, 11, "最近手头有点紧，没有宝石打活动。");
                evtSpeak(game, 29, "凛，人的道路是由自己选择的。");
                evtSpeak(game, 29, "你是想浑浑噩噩，作一辈子咸鱼；还是奋起氪金，像我一样成为一名大佬？");
                evtSpeak(game, 11, "作大佬，我要作大佬。");
                evtSpeak(game, 29, "你真的有成为大佬的觉悟吗？");
                evtSpeak(game, 11, "当然有。");
                evtShowCg(game, "cg06");
                evtSpeak(game, 11, "这就是我的觉悟。");
                evtSpeak(game, 11, "为了贯彻氪金出货的理想。");
                evtSpeak(game, 11, "为了牢记成为大佬的心愿。");
                evtSpeak(game, 11, "我把手机电源纹在手上了！");
                evtSpeak(game, 11, "人在手在！手亡人亡！");
                evtShowCg(game, "cg02");
                evtSpeak(game, 29, "你的决心我已经感受到了。");
                evtSpeak(game, 29, "看你如此心诚，我给你个介绍贷款的地方。出率up的机会不常有，一定要好好珍惜。");

                evtHideCg(game);
                evtCaption(game, `就这样，${escCharName(11)}走上了小额贷款的不归路。`);

                evtShowCg(game, "cg05");
                evtCaption(game, `数月后`);
                evtCaption(game, "月势力会议中。");
                evtSpeak(game, 9, "我军已经借了10家公司的贷款，500年内是还不清了。是否要缩小氪金规模？");
                evtSpeak(game, 11, "不要慌，要优雅。");
                evtSpeak(game, 11, "为了弥补赤字，我决定天下布月，向全地球宣战。");
                evtSpeak(game, 11, "攻占城池，用地球的钱粮保证月球great。");
                evtSpeak(game, 11, "从此以后，我们月出而作，月落而息，坚定不移地推进修仙。");
                evtSpeak(game, 11, "谁支持，谁反对？");
                evtSpeak(game, 9, "（这个败家娘们。）");
                evtSpeak(game, 10, `坚决支持${escCharName(11)}大大的修仙计划。`);
                evtSpeak(game, 9, "支持。");
                evtSpeak(game, 11, "很好，全票通过。");
                evtHideCg(game);

                evtSpeak(game, 0, `要警惕${escFactionName(1)}的动向。`);
            }
        }, {
            id: 5,
            name: "fall",
            type: "cityFall",
            condition: function (game, cityId, oldOwnerId) {
                return true;
            },
            effect: function (game, cityId, oldOwnerId) {
                let city = getCity(game, cityId);
                let faction = getFaction(game, city.factionId);

                let cityChars = game.data.charList.filter(e => e.factionId == oldOwnerId && e.location == cityId);
                let otherCities = game.data.cityList.filter(e => e.factionId == oldOwnerId);
                if (otherCities.length > 0) {
                    for (let char of cityChars) {
                        char.location = otherCities[0].id;
                        char.status = "finished";
                    }
                }

                evtCaption(game, `${escFactionName(faction.id)}攻陷了${escCityName(city.id)}。`);
            }
        }, {
            id: 6,
            name: "factionFall",
            type: "cityFall",
            condition: function (game, cityId, oldOwnerId) {
                let n = game.data.cityList.filter(e => e.factionId == oldOwnerId).length;
                return n == 0;
            },
            effect: function (game, cityId, oldOwnerId) {
                let tarr = game.data.troopList.filter(e => e.factionId == oldOwnerId);
                for (let troop of tarr) {
                    Model.destroyTroop(game, troop);
                }
                let carr = game.data.charList.filter(e => e.factionId == oldOwnerId);
                for (let char of carr) {
                    char.factionId = null;
                    char.status = "unemployed";
                }
                getFaction(game, oldOwnerId).exists = false;
                let city = getCity(game, cityId);
                let faction = getFaction(game, city.factionId);
                evtCaption(game, `${escFactionName(oldOwnerId)}灭亡了。`);
            }
        },
        {
            id: 7,
            name: "kousaka",
            type: "troopDestroyed",
            condition: function (game, troop) {
                let c1 = troop.leaderId == 3;
                let c2 = !evtHasFlag(game, "kousaka_lost");
                let c3 = getChar(game, troop.leaderId).factionId == game.data.misc.playerId;
                return c1 && c2 && c3;
            },
            effect: function (game, troop) {
                let char = getChar(game, troop.leaderId);
                char.img = "char3a";
                evtAddFlag(game, "kousaka_lost");
                evtSpeak(game, 0, `不好了，我军的${escCharName(char.id)}大人败了。`);
                evtSpeak(game, 3, `败了败了。`);
            }
        }, {
            id: 8,
            name: "gameOver",
            type: "cityFall",
            condition: function (game, cityId, oldOwnerId) {
                let n = game.data.cityList.filter(e => e.factionId == oldOwnerId).length;
                let c1 = n == 0;
                let c2 = oldOwnerId == 0;
                return c1 && c2;
            },
            effect: function (game, cityId, oldOwnerId) {
                evtSpeak(game, 0, "战败死国矣!");
                evtSpeak(game, 0, "赶快读档吧!");
                evtQuit(game);
            }
        }, {
            id: 9,
            name: "gameWon",
            type: "cityFall",
            condition: function (game, cityId, oldOwnerId) {

                let c1 = game.data.factionList.filter(e => e.exists).length == 1;
                let c2 = getFaction(game, 0).exists;
                return c1 && c2;
            },
            effect: function (game, cityId, oldOwnerId) {
                evtSpeak(game, 0, `经过不懈努力，${escFactionName(0)}终于取得了抗月战争的伟大胜利！`);
                evtSpeak(game, 0, "可喜可贺，可喜可贺。");
                evtSpeak(game, 0, "作者没做片尾，所以通关也算game over的一种。");
                evtQuit(game);
            }
        },
        {
            id: 10,
            name: "summoning",
            type: "turnStart",
            condition: function (game) {
                let c1 = game.data.misc.turn == 20;
                let c2 = game.data.misc.hasTurn == 1;
                let c3 = getCity(game, 1).factionId == 1;
                let c4 = getChar(game, 11).factionId == 1;
                let c5 = getChar(game, 10).factionId == 1;
                let c6 = getChar(game, 9).factionId == 1;
                let c7 = evtHasFlag(game, "flag_evt_4");
                let c8 = !evtHasFlag(game, "flag_evt_10");
                return c1 && c2 && c3 && c4 && c5 && c6 && c7 && c8;
            },
            effect: function (game) {
                evtAddFlag(game, "flag_evt_10");

                evtShowCg(game, "cg05");
                evtBgm(game, "bgm03");
                evtSpeak(game, 11, "我军起兵已有多时，占领地球的目标仍未达成。");
                evtSpeak(game, 11, "究其原因，是我军缺乏可用之才。");
                evtSpeak(game, 10, "大人言之有理。");
                evtSpeak(game, 11, "我决定召唤冬木魔君，以助军威。");
                evtSpeak(game, 10, `坚决支持${escCharName(11)}大大的决定。`);
                evtShowCg(game, "cardback");
                evtCaption(game, `相传${escCityName(1)}地下镇着七个魔君。`);
                evtCaption(game, `每一个都有万夫不当之勇。`);

                evtShowCg(game, "saber");
                evtCaption(game, `拿剑的傻吧。`);
                evtShowCg(game, "lancer");
                evtCaption(game, `使枪的蓝色。`);
                evtShowCg(game, "archer");
                evtCaption(game, `射箭的阿扯。`);
                evtShowCg(game, "rider");
                evtCaption(game, `开车的莱德。`);
                evtShowCg(game, "assassin");
                evtCaption(game, `下黑手的阿萨辛。`);
                evtShowCg(game, "caster");
                evtCaption(game, `变戏法的卡斯特。`);
                evtShowCg(game, "berserker");
                evtCaption(game, `能打的巴萨卡。`);
                evtShowCg(game, "cardback");
                evtCaption(game, `五百年前这七路魔君作乱，所到之处化作焦土寸草不生。`);
                evtCaption(game, `彼时恰有一云游仙人至此，在柳洞寺掘一地洞，困住了七路魔君。`);
                evtCaption(game, `倘若有人砸开柳洞寺的地砖，便有魔君现世，危害地球。`);

                evtShowCg(game, "cg05");
                evtSpeak(game, 11, "来人啊，兵发柳洞寺。");
                evtSpeak(game, 10, `起——驾——`);

                evtHideCg(game);
                evtSpeak(game, 0, `${escCityName(1)}有怪人出没。`);

                for (let kk = 30; kk < 37; kk++) {
                    getChar(game, kk).factionId = 1;
                    getChar(game, kk).location = 1;
                    getChar(game, kk).status = "finished";
                }

            }
        },
        {
            id: 11,
            name: "nipa",
            type: "stepOn",
            condition: function (game, troop) {
                let c1 = (troop.xy.x == 15) && (troop.xy.y == 6);
                let c2 = (troop.leaderId != 14);
                let c3 = !evtHasFlag(game, "nipa_done");                
                return c1 && c2 && c3;
            },
            effect: function (game, troop) {
                evtSound(game, "nipa");
                evtSpeak(game, 12, "咪啪～☆");
                evtSpeak(game, troop.leaderId, "这是何等强大的咪啪之力。");
            }
        },
        {
            id: 12,
            name: "nipa2",
            type: "stepOn",
            condition: function (game, troop) {
                let c1 = (troop.xy.x == 15) && (troop.xy.y == 6);
                let c2 = (troop.leaderId == 14);
                let c3 = !evtHasFlag(game, "nipa_done");
                return c1 && c2 && c3;
            },
            effect: function (game, troop) {
                evtAddFlag(game, "nipa_done");
                evtSound(game, "nipa");
                evtSpeak(game, 12, "咪啪～☆");
                evtSound(game, "tuturu");
                evtSpeak(game, troop.leaderId, "嘟～嘟噜～");
                evtSpeak(game, 12, "不可能，我的咪啪之力不可能败的。");
                evtCaption(game, `获得了金钱2500。`);
                getFaction(game,troop.factionId).money += 2500;
            }
        }
    ];


    gameEvent = gameEvent.concat(_myEvent);
}
