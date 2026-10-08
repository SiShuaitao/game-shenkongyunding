package com.shixingxu.shenkong.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 云顶国度 / 势力实体。
 */
@Data
@TableName("sect")
public class Sect implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 国度名称 */
    private String name;

    /** 副标题 */
    private String subtitle;

    /** 国度理念 */
    private String philosophy;

    /** 国度描述 */
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
