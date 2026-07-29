package com.nlc.backend.service;

import com.nlc.backend.dto.membercard.MemberCardRequest;
import com.nlc.backend.dto.membercard.MemberCardResponse;
import java.util.List;

public interface MemberCardService {
    MemberCardResponse issueCard(MemberCardRequest request);
    MemberCardResponse updateCard(Long id, MemberCardRequest request);
    List<MemberCardResponse> getAllCards();
    MemberCardResponse getCardByUserId(Long userId);
}
