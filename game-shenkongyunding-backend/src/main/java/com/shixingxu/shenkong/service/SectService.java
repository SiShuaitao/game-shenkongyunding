package com.shixingxu.shenkong.service;

import com.shixingxu.shenkong.entity.Sect;

import java.util.List;

public interface SectService {

    /** 获取所有上线国度，按 sort 升序 */
    List<Sect> listOnline();
}
