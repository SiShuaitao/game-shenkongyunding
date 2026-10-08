package com.shixingxu.shenkong;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 深空云顶官网后端 API 服务启动入口。
 */
@SpringBootApplication
@MapperScan("com.shixingxu.shenkong.mapper")
public class ShenkongApplication {

    public static void main(String[] args) {
        SpringApplication.run(ShenkongApplication.class, args);
    }
}
