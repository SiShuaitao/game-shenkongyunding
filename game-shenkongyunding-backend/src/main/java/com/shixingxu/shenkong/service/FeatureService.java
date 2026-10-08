package com.shixingxu.shenkong.service;

import com.shixingxu.shenkong.entity.Feature;

import java.util.List;

public interface FeatureService {

    /** 获取所有上线玩法特色，按 sort 升序 */
    List<Feature> listOnline();
}
