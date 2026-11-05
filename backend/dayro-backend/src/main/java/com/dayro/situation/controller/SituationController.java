package com.dayro.situation.controller;

import com.dayro.global.response.ApiResponse;
import com.dayro.situation.dto.request.SituationInputRequest;
import com.dayro.situation.dto.response.CourseCandidateResponse;
import com.dayro.situation.service.CourseRecommendationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/situations")
@RequiredArgsConstructor
public class SituationController {

    // 비회원 식별값 - 프론트(BFF)가 첫 방문 때 쿠키로 발급한 UUID를 넘긴다. "다른 코스 보기" 횟수를 사람 기준으로 세는 데 쓴다
    private static final String DEVICE_ID_HEADER = "X-Device-Id";

    private final CourseRecommendationService courseRecommendationService;

    @PostMapping
    public ResponseEntity<ApiResponse<CourseCandidateResponse>> submit(@Valid @RequestBody SituationInputRequest request,
                                                                       @RequestHeader(value = DEVICE_ID_HEADER, required = false) String deviceId) {
        return ResponseEntity.ok(ApiResponse.success(courseRecommendationService.recommend(request, deviceId)));
    }

    @PostMapping("/{requestId}/retry")
    public ResponseEntity<ApiResponse<CourseCandidateResponse>> retry(@PathVariable String requestId,
                                                                      @RequestHeader(value = DEVICE_ID_HEADER, required = false) String deviceId) {
        return ResponseEntity.ok(ApiResponse.success(courseRecommendationService.retry(requestId, deviceId)));
    }
}
