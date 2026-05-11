package com.nlc.backend.config;

import com.razorpay.RazorpayClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RazorpayConfig {

    @Bean
    public RazorpayClient razorpayClient(AppProperties appProperties) throws Exception {
        return new RazorpayClient(
                appProperties.getPayment().getRazorpay().getKeyId(),
                appProperties.getPayment().getRazorpay().getKeySecret()
        );
    }
}
