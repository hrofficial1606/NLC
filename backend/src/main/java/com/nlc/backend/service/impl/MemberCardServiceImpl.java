package com.nlc.backend.service.impl;

import com.nlc.backend.dto.membercard.MemberCardRequest;
import com.nlc.backend.dto.membercard.MemberCardResponse;
import com.nlc.backend.entity.MemberCard;
import com.nlc.backend.entity.User;
import com.nlc.backend.exception.ResourceNotFoundException;
import com.nlc.backend.repository.MemberCardRepository;
import com.nlc.backend.repository.UserRepository;
import com.nlc.backend.service.MemberCardService;
import com.nlc.backend.service.NotificationService;
import com.nlc.backend.service.WhatsAppService;
import com.nlc.backend.util.MemberCardUtil;
import com.nlc.backend.util.QrCodeUtil;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MemberCardServiceImpl implements MemberCardService {

    private final MemberCardRepository memberCardRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final WhatsAppService whatsAppService;

    @Override
    @Transactional
    public MemberCardResponse issueCard(MemberCardRequest request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        MemberCard card = memberCardRepository.findByUserId(user.getId()).orElseGet(MemberCard::new);
        card.setUser(user);
        if (card.getCardNumber() == null || card.getCardNumber().isBlank()) {
            card.setCardNumber(generateCardNumber(user));
        }
        apply(card, request);
        card.setQrCodeUrl(QrCodeUtil.generateDataUri(card.getCardNumber()));
        card.setCardImageUrl(MemberCardUtil.generateCardImage(user, card));

        MemberCard saved = memberCardRepository.save(card);
        notificationService.notifyUser(user.getId(), "Member card issued",
                "Your member card " + saved.getCardNumber() + " is ready.", "MEMBER_CARD_ISSUED");
        whatsAppService.sendMemberCardIssued(user, saved);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public MemberCardResponse updateCard(Long id, MemberCardRequest request) {
        MemberCard card = memberCardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member card not found"));
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        card.setUser(user);
        apply(card, request);
        card.setQrCodeUrl(QrCodeUtil.generateDataUri(card.getCardNumber()));
        card.setCardImageUrl(MemberCardUtil.generateCardImage(user, card));
        return toResponse(memberCardRepository.save(card));
    }

    @Override
    public List<MemberCardResponse> getAllCards() {
        return memberCardRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toResponse).toList();
    }

    @Override
    public MemberCardResponse getCardByUserId(Long userId) {
        return memberCardRepository.findByUserId(userId).map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Member card not found"));
    }

    private void apply(MemberCard card, MemberCardRequest request) {
        card.setMembershipPlan(request.membershipPlan().trim());
        card.setDesignation(request.designation());
        card.setValidFrom(request.validFrom());
        card.setValidUntil(request.validUntil());
        card.setAccentColor(request.accentColor());
        card.setNotes(request.notes());
        card.setActive(request.active());
    }

    private String generateCardNumber(User user) {
        String compactName = user.getFullName()
                .replaceAll("[^A-Za-z0-9]", "")
                .toUpperCase(Locale.ROOT);
        String prefix = compactName.length() >= 3 ? compactName.substring(0, 3) : compactName;
        return "NLC-" + prefix + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
    }

    private MemberCardResponse toResponse(MemberCard card) {
        return new MemberCardResponse(
                card.getId(),
                card.getUser().getId(),
                card.getUser().getFullName(),
                card.getUser().getEmail(),
                card.getCardNumber(),
                card.getMembershipPlan(),
                card.getDesignation(),
                card.getValidFrom(),
                card.getValidUntil(),
                card.getQrCodeUrl(),
                card.getCardImageUrl(),
                card.getAccentColor(),
                card.getNotes(),
                card.isActive(),
                card.getCreatedAt()
        );
    }
}
