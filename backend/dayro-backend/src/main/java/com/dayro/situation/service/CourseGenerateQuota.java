package com.dayro.situation.service;

import com.dayro.global.error.ErrorCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

// 처음 코스 만들기 횟수 - quota:course-generate:{member|guest}:{id}. "다른 코스 보기"는 CourseRetryQuota가 따로 센다
// 정책(10-19 FE 합의): 사람당 24시간에 처음 생성 3회 + 다른 코스 보기 3회(따로 센다)
@Component
public class CourseGenerateQuota extends PersonalQuota {

    public CourseGenerateQuota(StringRedisTemplate redisTemplate, @Value("${quota.course.generate-limit:3}") int generateLimit) {
        super(redisTemplate, "quota:course-generate:", generateLimit, ErrorCode.COURSE_GENERATE_LIMIT_EXCEEDED);
    }
}
