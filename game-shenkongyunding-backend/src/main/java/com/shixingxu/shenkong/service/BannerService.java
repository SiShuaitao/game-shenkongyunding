package com.shixingxu.shenkong.service;

import com.shixingxu.shenkong.entity.Banner;

import java.util.List;

public interface BannerService {

    /** 获取首页 Banner */
    List<Banner> listVisible();
}
