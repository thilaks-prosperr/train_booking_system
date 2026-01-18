/*
 * Copyright (c) 2026 Thilaks. All Rights Reserved.
 *
 * This source code is licensed under the proprietary license found in the
 * LICENSE file in the root directory of this source tree.
 */

package com.example.tbs.dto;

import lombok.Data;
import java.util.List;

@Data
public class CompositeBookingRequest {
    private List<BookingRequestDTO> bookings;
}
