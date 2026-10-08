package com.shixingxu.shenkong.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.shixingxu.shenkong.entity.Character;
import com.shixingxu.shenkong.mapper.CharacterMapper;
import com.shixingxu.shenkong.service.CharacterService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CharacterServiceImpl implements CharacterService {

    private final CharacterMapper characterMapper;

    @Override
    public List<Character> listOnline() {
        return characterMapper.selectList(new LambdaQueryWrapper<Character>()
                .eq(Character::getStatus, 1)
                .orderByAsc(Character::getSort)
                .orderByAsc(Character::getId));
    }
}
