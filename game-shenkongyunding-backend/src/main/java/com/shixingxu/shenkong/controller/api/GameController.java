package com.shixingxu.shenkong.controller.api;

import com.shixingxu.shenkong.common.Result;
import com.shixingxu.shenkong.entity.Game;
import com.shixingxu.shenkong.service.GameService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    /** 获取深空云顶主体作品信息 */
    @GetMapping("/game")
    public Result<Game> detail() {
        Game game = gameService.getFirst();
        if (game == null) {
            throw new IllegalArgumentException("作品尚未初始化");
        }
        return Result.success(game);
    }

    /** 获取所有已上线作品列表 */
    @GetMapping("/games")
    public Result<List<Game>> list() {
        return Result.success(gameService.listOnline());
    }
}
