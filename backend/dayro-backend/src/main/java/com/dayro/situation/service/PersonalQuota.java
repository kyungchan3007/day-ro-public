package com.dayro.situation.service;

import com.dayro.global.error.BusinessException;
import com.dayro.global.error.ErrorCode;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.data.redis.core.script.RedisScript;

import java.time.Duration;
import java.util.List;
import java.util.UUID;

// 사람 기준(회원 ID / 비회원 X-Device-Id) 사용 횟수 제한 - {keyPrefix}{member|guest}:{id}
// TTL은 첫 사용 시점에만 24시간을 걸고 이후엔 갱신하지 않는다(첫 사용 기준 24시간 뒤 초기화)
public abstract class PersonalQuota {

    private static final Duration WINDOW = Duration.ofHours(24);

    // INCR과 EXPIRE 사이에 장애가 나면 TTL 없는 키가 남아 영구 차단될 수 있어 한 번에 실행한다
    private static final RedisScript<Long> INCREMENT_SCRIPT = new DefaultRedisScript<>("""
            local count = redis.call('INCR', KEYS[1])
            if count == 1 then
                redis.call('EXPIRE', KEYS[1], ARGV[1])
            end
            return count
            """, Long.class);

    // 그 사이 키가 만료됐으면 되돌리지 않는다 - DECR이 TTL 없는 음수 키를 새로 만드는 것을 막는다
    private static final RedisScript<Long> REFUND_SCRIPT = new DefaultRedisScript<>("""
            if redis.call('EXISTS', KEYS[1]) == 1 then
                return redis.call('DECR', KEYS[1])
            end
            return 0
            """, Long.class);

    private final StringRedisTemplate redisTemplate;
    private final String keyPrefix;
    private final int limit;
    private final ErrorCode exceededError;

    protected PersonalQuota(StringRedisTemplate redisTemplate, String keyPrefix, int limit, ErrorCode exceededError) {
        this.redisTemplate = redisTemplate;
        this.keyPrefix = keyPrefix;
        this.limit = limit;
        this.exceededError = exceededError;
    }

    public int limit() {
        return limit;
    }

    // 회원이면 회원 ID, 비회원이면 UUID 형식의 X-Device-Id. 둘 다 없으면 null(셀 수 없음 - 호출부에서 처리)
    public static String subjectOf(UUID memberId, String deviceId) {
        if (memberId != null) {
            return "member:" + memberId;
        }
        if (deviceId == null || deviceId.isBlank()) {
            return null;
        }
        try {
            return "guest:" + UUID.fromString(deviceId.strip());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    public int remaining(String subject) {
        String count = redisTemplate.opsForValue().get(key(subject));
        int used = count == null ? 0 : Integer.parseInt(count);
        return Math.max(limit - used, 0);
    }

    // 1회 차감하고 남은 횟수를 돌려준다 - 확인과 증가를 INCR 하나로 해서 동시 요청이 한도를 넘지 못하게 한다
    public int consume(String subject) {
        Long count = redisTemplate.execute(INCREMENT_SCRIPT, List.of(key(subject)), String.valueOf(WINDOW.toSeconds()));
        if (count != null && count > limit) {
            refund(subject);
            throw new BusinessException(exceededError);
        }
        return count == null ? limit : Math.max(limit - count.intValue(), 0);
    }

    // 코스를 못 받고 실패한 경우(장소 없음, AI 장애 등) 차감한 1회를 돌려준다
    public void refund(String subject) {
        redisTemplate.execute(REFUND_SCRIPT, List.of(key(subject)));
    }

    private String key(String subject) {
        return keyPrefix + subject;
    }
}
