package com.nlc.backend.service.impl;

import com.nlc.backend.dto.contact.ContactInquiryRequest;
import com.nlc.backend.dto.contact.ContactInquiryResponse;
import com.nlc.backend.entity.ContactInquiry;
import com.nlc.backend.entity.enums.InquiryStatus;
import com.nlc.backend.exception.ResourceNotFoundException;
import com.nlc.backend.repository.ContactInquiryRepository;
import com.nlc.backend.service.ContactService;
import com.nlc.backend.service.EmailService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ContactServiceImpl implements ContactService {

    private final ContactInquiryRepository contactInquiryRepository;
    private final EmailService emailService;

    @Override
    public ContactInquiryResponse create(ContactInquiryRequest request) {
        ContactInquiry inquiry = new ContactInquiry();
        inquiry.setName(request.name());
        inquiry.setEmail(request.email());
        inquiry.setPhoneNumber(request.phoneNumber());
        inquiry.setSubject(request.subject());
        inquiry.setMessage(request.message());
        ContactInquiry saved = contactInquiryRepository.save(inquiry);
        emailService.sendContactNotification(saved.getSubject(), saved.getMessage());
        return toResponse(saved);
    }

    @Override
    public List<ContactInquiryResponse> getAll() {
        return contactInquiryRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public void markResolved(Long id) {
        ContactInquiry inquiry = contactInquiryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inquiry not found"));
        inquiry.setStatus(InquiryStatus.RESOLVED);
        contactInquiryRepository.save(inquiry);
    }

    private ContactInquiryResponse toResponse(ContactInquiry inquiry) {
        return new ContactInquiryResponse(
                inquiry.getId(),
                inquiry.getName(),
                inquiry.getEmail(),
                inquiry.getPhoneNumber(),
                inquiry.getSubject(),
                inquiry.getMessage(),
                inquiry.getStatus().name(),
                inquiry.getCreatedAt()
        );
    }
}
