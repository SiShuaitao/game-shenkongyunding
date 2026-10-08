package com.shixingxu.shenkong.service;

import com.shixingxu.shenkong.entity.Game;

import java.util.List;

public interface GameService {

    /** 获取所有已上线作品，按 sort 升序 */
    List<Game> listOnline();

    /** 获取首个上线作品（深空云顶官网主体） */
    Game getFirst();
}
