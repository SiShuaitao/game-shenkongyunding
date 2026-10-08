package com.shixingxu.shenkong.init;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.shixingxu.shenkong.entity.Banner;
import com.shixingxu.shenkong.entity.Character;
import com.shixingxu.shenkong.entity.Feature;
import com.shixingxu.shenkong.entity.Game;
import com.shixingxu.shenkong.entity.News;
import com.shixingxu.shenkong.entity.Sect;
import com.shixingxu.shenkong.mapper.BannerMapper;
import com.shixingxu.shenkong.mapper.CharacterMapper;
import com.shixingxu.shenkong.mapper.FeatureMapper;
import com.shixingxu.shenkong.mapper.GameMapper;
import com.shixingxu.shenkong.mapper.NewsMapper;
import com.shixingxu.shenkong.mapper.SectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 首次启动时初始化种子数据：深空云顶作品、Banner、资讯、角色、国度、玩法特色。
 * 深空云顶 —— 漂浮于云端的未来童话王国，空中飞船穿行，悬浮岛屿城堡全景动态。
 */
@Slf4j
@Component
@Order(10)
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final GameMapper gameMapper;
    private final NewsMapper newsMapper;
    private final BannerMapper bannerMapper;
    private final CharacterMapper characterMapper;
    private final SectMapper sectMapper;
    private final FeatureMapper featureMapper;

    @Override
    public void run(String... args) {
        seedGame();
        seedBanners();
        seedCharacters();
        seedSects();
        seedFeatures();
        seedNews();
    }

    private void seedGame() {
        Long count = gameMapper.selectCount(new QueryWrapper<>());
        if (count != null && count > 0) {
            log.info("游戏作品已存在 ({} 条), 跳过初始化", count);
            return;
        }
        Game game = buildGame(
                "shenkong", "深空云顶", "SKYLAND OF DEEP SPACE",
                "童话魔幻", "空中飞船 · 城堡全景 · 马卡龙色调",
                "欧式童话魔幻画风，蓝天白云、城堡全景动态，轻快治愈。",
                "《深空云顶》构筑一座漂浮于云端的未来童话王国。空中飞船穿行于云海，悬浮岛屿上城堡全景动态铺展，柔和马卡龙色调晕染出蓝天白云。轻快治愈的魔幻旅程，邀你驾驭飞舟启航云端，书写属于自己的童话史诗。",
                "http://shenkong.shixingxu.local",
                "linear-gradient(170deg,#9ed8ff 0%,#c8b6ff 50%,#ffd6f0 100%), radial-gradient(circle at 30% 70%, rgba(255,255,255,0.45), transparent 45%)",
                "fairytale",
                1, 10
        );
        gameMapper.insert(game);
        log.info("已初始化深空云顶作品");
    }

    private void seedBanners() {
        Long count = bannerMapper.selectCount(new QueryWrapper<>());
        if (count != null && count > 0) {
            log.info("Banner 已存在 ({} 条), 跳过初始化", count);
            return;
        }
        List<Banner> banners = new ArrayList<>();
        banners.add(buildBanner(
                "深空云顶 · 云端王国",
                "空中飞船与岛屿，欧式童话魔幻",
                "linear-gradient(170deg,#9ed8ff 0%,#c8b6ff 50%,#ffd6f0 100%), radial-gradient(circle at 30% 70%, rgba(255,255,255,0.45), transparent 45%)",
                "#features", 10
        ));
        banners.add(buildBanner(
                "星岚公主 · 云顶加冕",
                "艾莉娅归来，星岚觉醒",
                "linear-gradient(135deg,#c8b6ff 0%,#9ed8ff 100%), radial-gradient(circle at 70% 30%, rgba(255,255,255,0.5), transparent 50%)",
                "#characters", 20
        ));
        banners.add(buildBanner(
                "风行号 · 启航云海",
                "跟随风行商会，畅游云端",
                "linear-gradient(135deg,#9ed8ff 0%,#ffd6f0 100%), radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5), transparent 50%)",
                "#features", 30
        ));
        banners.forEach(bannerMapper::insert);
        log.info("已初始化 {} 条 Banner", banners.size());
    }

    private void seedCharacters() {
        Long count = characterMapper.selectCount(new QueryWrapper<>());
        if (count != null && count > 0) {
            log.info("角色已存在 ({} 条), 跳过初始化", count);
            return;
        }
        List<Character> characters = new ArrayList<>();
        characters.add(buildCharacter(
                "艾莉娅·星岚", "云顶公主", "云顶王国", "法师", "中",
                "云顶王国的王女，自幼与星岚共鸣。她的法杖能唤起漫天星辰，将星辉化作护佑云端的屏障。星岚觉醒之夜，她踏上了寻回云顶秩序的旅途。",
                "linear-gradient(135deg,#c8b6ff 0%,#9ed8ff 100%)", 10
        ));
        characters.add(buildCharacter(
                "凯尔·风行", "飞船船长", "风行商会", "战士", "中",
                "风行号船长，云海航者。他驾驭飞船穿梭于悬浮岛屿之间，以利刃斩开风暴。自由是他的信仰，云海是他的归宿，传说他从未在任何航线上迷失。",
                "linear-gradient(135deg,#9ed8ff 0%,#ffd6f0 100%)", 20
        ));
        characters.add(buildCharacter(
                "米娅·花语", "花语魔女", "花语森林", "辅助", "低",
                "与花对话的魔女，居于花语森林深处。她能用花语编织治愈的咒文，让凋零的花朵重新绽放。她知晓每一朵花的名字与心愿，是云顶最温柔的守护者。",
                "linear-gradient(135deg,#ffd6f0 0%,#c8b6ff 100%)", 30
        ));
        characters.add(buildCharacter(
                "雷恩·云骑", "云骑士长", "月华骑士团", "坦克", "中",
                "守护云顶的骑士长，身披月华铠甲。他以盾为誓，立于云端城墙之前，任何试图侵扰云顶的风暴都会被他的盾墙挡下。沉默而坚定，是王国最后的壁垒。",
                "linear-gradient(135deg,#c8b6ff 0%,#ffd6f0 100%)", 40
        ));
        characters.add(buildCharacter(
                "露娜·月华", "月华射手", "月华骑士团", "射手", "中",
                "承载月华之力的射手，箭矢如月光般精准。她能在云海的最远处锁定目标，一箭贯穿风暴。月光是她的眼，也是她的箭，传说她的箭从未射空。",
                "linear-gradient(135deg,#9ed8ff 0%,#c8b6ff 100%)", 50
        ));
        characters.add(buildCharacter(
                "诺亚·机械师", "机械工匠", "风行商会", "辅助", "高",
                "飞船机械天才，能把废铁改造成翱翔云端的飞舟。他的工具箱里藏着无数奇思妙想，齿轮与蒸汽在他手中化作奇迹。调皮爱捣鼓，却总能救船队于危难。",
                "linear-gradient(135deg,#ffd6f0 0%,#9ed8ff 100%)", 60
        ));
        characters.forEach(characterMapper::insert);
        log.info("已初始化 {} 个角色", characters.size());
    }

    private void seedSects() {
        Long count = sectMapper.selectCount(new QueryWrapper<>());
        if (count != null && count > 0) {
            log.info("国度已存在 ({} 条), 跳过初始化", count);
            return;
        }
        List<Sect> sects = new ArrayList<>();
        sects.add(buildSect(
                "云顶王国", "云端的中央王国", "守护云端秩序",
                "漂浮于云端最高处的中央王国，城堡全景在云海之上铺展。星岚公主的王座所在，历代国王守护着云端的秩序与安宁。这里是云顶文明的中心，也是所有航行者归航的灯塔。",
                "linear-gradient(170deg,#9ed8ff 0%,#c8b6ff 50%,#ffd6f0 100%)", 10
        ));
        sects.add(buildSect(
                "风行商会", "飞船商队联盟", "自由航行云端",
                "由无数飞船商队结成的联盟，主张自由航行于云端。他们的飞舟穿梭于悬浮岛屿之间，运载货物、传递消息，也带来远方的奇闻。风行号是他们最骄傲的旗舰，载着船长凯尔驰骋云海。",
                "linear-gradient(135deg,#9ed8ff 0%,#ffd6f0 100%)", 20
        ));
        sects.add(buildSect(
                "花语森林", "魔女的隐居之地", "万物有灵",
                "隐于云层深处的森林，由魔女米娅守护。这里的花朵会低语，藤蔓会歌唱，万物皆有灵性。踏入森林的旅人都会被花香治愈，却也容易在花海中迷失方向，忘记归途。",
                "linear-gradient(135deg,#ffd6f0 0%,#c8b6ff 100%)", 30
        ));
        sects.add(buildSect(
                "月华骑士团", "远古骑士传承", "以月光为誓",
                "传承自远古的骑士团，以月光为誓守护云顶。骑士长雷恩与射手露娜皆出于此。他们的铠甲在月夜下泛起银辉，盾与箭共同筑起云顶的防线。月光所至，誓言不灭。",
                "linear-gradient(135deg,#c8b6ff 0%,#9ed8ff 100%)", 40
        ));
        sects.forEach(sectMapper::insert);
        log.info("已初始化 {} 个国度", sects.size());
    }

    private void seedFeatures() {
        Long count = featureMapper.selectCount(new QueryWrapper<>());
        if (count != null && count > 0) {
            log.info("玩法特色已存在 ({} 条), 跳过初始化", count);
            return;
        }
        List<Feature> features = new ArrayList<>();
        features.add(buildFeature(
                "开放世界城堡全景", "空中城堡全景动态铺展",
                "站在云顶之巅，整座空中城堡的全景在你眼前动态铺展。塔楼、庭院、悬浮花园层层叠叠，云海在脚下流动。每一扇窗后都藏着故事，每一座塔尖都通向新的冒险。",
                "◈", 10
        ));
        features.add(buildFeature(
                "空中飞船自由航行", "玩家驾驭飞船穿行云端",
                "亲自驾驭飞船穿行于云端，掌舵、扬帆、调整航向。云海风暴、悬浮岛屿、远方灯塔，一切都在你的航线上。自由航行的每一刻，都是属于你的云端史诗。",
                "◆", 20
        ));
        features.add(buildFeature(
                "悬浮岛屿探索", "漂浮岛屿随机生成可登陆",
                "漂浮于云海的岛屿随机生成，每一座都独一无二。登陆探索，或许能发现古老的遗迹、隐居的魔女，或是埋藏的宝藏。岛屿之间藏着无数未知的奇遇等待启程。",
                "✦", 30
        ));
        features.add(buildFeature(
                "马卡龙色调治愈美术", "柔和色调与音乐共鸣",
                "柔和马卡龙色调晕染蓝天白云，配合轻快治愈的旋律，构筑出童话般的云端世界。视觉与听觉共鸣，让每一次航行都成为一场放松心灵的治愈之旅，抚平旅途的疲惫。",
                "❀", 40
        ));
        features.add(buildFeature(
                "飞船建造与改装", "UGC 飞船建造系统",
                "丰富的飞船建造系统，从船体到风帆，从引擎到装饰，一切由你定制。打造独一无二的专属飞舟，与好友组队启航，在云海上展示你的造船才华与冒险精神。",
                "✧", 50
        ));
        features.forEach(featureMapper::insert);
        log.info("已初始化 {} 个玩法特色", features.size());
    }

    private void seedNews() {
        Long count = newsMapper.selectCount(new QueryWrapper<>());
        if (count != null && count > 0) {
            log.info("资讯已存在 ({} 条), 跳过初始化", count);
            return;
        }
        List<News> newsList = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        newsList.add(buildNews(
                "《深空云顶》开放世界城堡全景首曝",
                "空中飞船穿行，悬浮岛屿上城堡全景动态铺展。",
                "《深空云顶》今日首次曝光开放世界城堡全景。玩家可驾驭空中飞船穿行云端，登陆悬浮岛屿探索童话王国。柔和马卡龙色调晕染蓝天白云，城堡全景动态铺展，轻快治愈的魔幻氛围呼之欲出。更多城堡内部场景与探索玩法将于近期陆续揭晓，敬请期待。",
                "notice", now.minusDays(2)
        ));
        newsList.add(buildNews(
                "《深空云顶》空中飞船系统详解",
                "自由航行、飞船建造与改装，UGC 云端造船。",
                "备受期待的空中飞船系统今日揭晓。玩家可亲自驾驭飞船穿行云端，掌舵扬帆，调整航向。更可自由建造与改装飞船，从船体到风帆，从引擎到装饰，打造专属飞舟。与好友组队启航，在云海上书写属于你的冒险篇章。",
                "news", now.minusDays(6)
        ));
        newsList.add(buildNews(
                "《深空云顶》首次测试正式开启",
                "云端王国大门开启，限定资格抢先体验。",
                "《深空云顶》首次测试今日正式开启！获得资格的玩家可抢先登陆云端王国，驾驭飞船航行云海，探索悬浮岛屿，结识艾莉娅、凯尔等角色。本次测试为限量删档测试，期待各位旅人的反馈，与我们一同完善这座漂浮于云端的童话王国。",
                "activity", now.minusDays(11)
        ));
        newsList.add(buildNews(
                "《深空云顶》角色首曝：艾莉娅·星岚",
                "云顶公主归来，星岚觉醒，法师之巅。",
                "今日首曝《深空云顶》核心角色——云顶公主艾莉娅·星岚。作为云顶王国的王女，她自幼与星岚共鸣，法杖能唤起漫天星辰。星岚觉醒之夜，她踏上了寻回云顶秩序的旅途。更多角色档案将在后续陆续公开，敬请关注。",
                "news", now.minusDays(16)
        ));
        newsList.add(buildNews(
                "《深空云顶》世界观：漂浮于云端的童话王国",
                "云顶王国、风行商会、花语森林、月华骑士团四势力登场。",
                "《深空云顶》世界观今日正式公开。游戏构筑了一座漂浮于云端的未来童话王国，云顶王国、风行商会、花语森林、月华骑士团四大势力各据一方。空中飞船穿行，悬浮岛屿星罗棋布，柔和马卡龙色调晕染出轻快治愈的童话氛围，邀你踏上这场云端之旅。",
                "notice", now.minusDays(22)
        ));
        newsList.add(buildNews(
                "《深空云顶》研发团队招募启事",
                "技术美术、服务端、剧情策划多岗位开放招募。",
                "《深空云顶》研发团队持续扩张中！技术美术、服务端工程师、剧情策划、关卡策划多岗位开放招募。我们寻找热爱童话魔幻题材、相信云端世界仍有无限可能的伙伴。简历请投递至 hr@shixingxu.com，期待与你一同构筑这座漂浮的童话王国。",
                "activity", now.minusDays(30)
        ));
        newsList.forEach(newsMapper::insert);
        log.info("已初始化 {} 条资讯", newsList.size());
    }

    private Game buildGame(String gameId, String name, String subtitle, String category, String tagline,
                           String summary, String description, String url, String cover, String style,
                           int featured, int sort) {
        Game game = new Game();
        game.setGameId(gameId);
        game.setName(name);
        game.setSubtitle(subtitle);
        game.setCategory(category);
        game.setTagline(tagline);
        game.setSummary(summary);
        game.setDescription(description);
        game.setUrl(url);
        game.setCover(cover);
        game.setStyle(style);
        game.setFeatured(featured);
        game.setSort(sort);
        game.setStatus(1);
        return game;
    }

    private Banner buildBanner(String title, String subtitle, String cover, String link, int sort) {
        Banner banner = new Banner();
        banner.setTitle(title);
        banner.setSubtitle(subtitle);
        banner.setCover(cover);
        banner.setLink(link);
        banner.setSort(sort);
        banner.setStatus(1);
        return banner;
    }

    private Character buildCharacter(String name, String title, String faction, String role,
                                     String difficulty, String description, String cover, int sort) {
        Character c = new Character();
        c.setName(name);
        c.setTitle(title);
        c.setFaction(faction);
        c.setRole(role);
        c.setDifficulty(difficulty);
        c.setDescription(description);
        c.setCover(cover);
        c.setSort(sort);
        c.setStatus(1);
        return c;
    }

    private Sect buildSect(String name, String subtitle, String philosophy, String description,
                           String cover, int sort) {
        Sect sect = new Sect();
        sect.setName(name);
        sect.setSubtitle(subtitle);
        sect.setPhilosophy(philosophy);
        sect.setDescription(description);
        sect.setCover(cover);
        sect.setSort(sort);
        sect.setStatus(1);
        return sect;
    }

    private Feature buildFeature(String title, String summary, String description, String icon, int sort) {
        Feature feature = new Feature();
        feature.setTitle(title);
        feature.setSummary(summary);
        feature.setDescription(description);
        feature.setIcon(icon);
        feature.setSort(sort);
        feature.setStatus(1);
        return feature;
    }

    private News buildNews(String title, String summary, String content, String category, LocalDateTime publishTime) {
        News news = new News();
        news.setTitle(title);
        news.setSummary(summary);
        news.setContent(content);
        news.setCategory(category);
        news.setPublishTime(publishTime);
        news.setStatus(1);
        return news;
    }
}
