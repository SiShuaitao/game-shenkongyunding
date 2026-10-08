package com.shixingxu.shenkong.controller.api;

import com.shixingxu.shenkong.common.Result;
import com.shixingxu.shenkong.entity.Feature;
import com.shixingxu.shenkong.service.FeatureService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/features")
@RequiredArgsConstructor
public class FeatureController {

    private final FeatureService featureService;

    @GetMapping
    public Result<List<Feature>> list() {
        return Result.success(featureService.listOnline());
    }
}
