package com.shixingxu.shenkong.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 角色实体（character 为 MySQL 保留字，表名以反引号转义）。
 */
@Data
@TableName("`character`")
public class Character implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 角色名 */
    private String name;

    /** 称号 / 头衔 */
    private String title;

    /** 所属势力 / 国度 */
    private String faction;

    /** 定位：法师 / 战士 / 辅助 / 坦克 / 射手 */
    private String role;

    /** 操作难度：低 / 中 / 高 */
    private String difficulty;

    /** 角色描述 */
    private String description;

    /** 封面渐变 */
    private String cover;

    /** 排序值 */
    private Integer sort;

    /** 1 上线 0 下线 */
    private Integer status;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
