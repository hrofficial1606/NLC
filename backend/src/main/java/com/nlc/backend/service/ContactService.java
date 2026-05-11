package com.nlc.backend.service;

import com.nlc.backend.dto.contact.ContactInquiryRequest;
import com.nlc.backend.dto.contact.ContactInquiryResponse;
import java.util.List;

public interface ContactService {
    ContactInquiryResponse create(ContactInquiryRequest request);
    List<ContactInquiryResponse> getAll();
    void markResolved(Long id);
}
