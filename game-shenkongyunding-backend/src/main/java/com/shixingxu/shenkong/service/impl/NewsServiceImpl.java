package com.shixingxu.shenkong.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shixingxu.shenkong.entity.News;
import com.shixingxu.shenkong.mapper.NewsMapper;
import com.shixingxu.shenkong.service.NewsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NewsServiceImpl implements NewsService {

    private final NewsMapper newsMapper;

    @Override
    public List<News> getLatestNews(int limit) {
        Page<News> page = new Page<>(1, limit);
        return newsMapper.selectPage(page, new LambdaQueryWrapper<News>()
                .eq(News::getStatus, 1)
                .orderByDesc(News::getPublishTime)
                .orderByDesc(News::getId))
                .getRecords();
    }

    @Override
    public News getById(Long id) {
        return newsMapper.selectById(id);
    }
}
