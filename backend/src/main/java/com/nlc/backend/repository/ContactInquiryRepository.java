package com.nlc.backend.repository;

import com.nlc.backend.entity.ContactInquiry;
import com.nlc.backend.entity.enums.InquiryStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactInquiryRepository extends JpaRepository<ContactInquiry, Long> {
    long countByStatus(InquiryStatus status);
}
