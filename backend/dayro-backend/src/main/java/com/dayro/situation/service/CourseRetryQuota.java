package com.dayro.situation.service;

import com.dayro.global.error.ErrorCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

// "다른 코스 보기" 횟수 - quota:course-retry:{member|guest}:{id}. 처음 코스 만들기는 CourseGenerateQuota가 따로 센다
@Component
public class CourseRetryQuota extends PersonalQuota {

    public CourseRetryQuota(StringRedisTemplate redisTemplate, @Value("${quota.course.retry-limit:3}") int retryLimit) {
        super(redisTemplate, "quota:course-retry:", retryLimit, ErrorCode.COURSE_RETRY_LIMIT_EXCEEDED);
    }
}
