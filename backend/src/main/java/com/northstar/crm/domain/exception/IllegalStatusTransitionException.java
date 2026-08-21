package com.northstar.crm.domain.exception;

import com.northstar.crm.domain.CustomerStatus;

public class IllegalStatusTransitionException extends RuntimeException {

    public IllegalStatusTransitionException(CustomerStatus from, CustomerStatus to) {
        super("Illegal status transition: " + from + " -> " + to);
    }
}