---
layout: page
title: StrongARM Latched Comparator
description: TSMC 0.18 µm CMOS — design, verification, and regeneration-time extraction
img: assets/img/projects/comparator/comparator_schematic.png
importance: 2
category: Analog / Mixed-Signal IC Design
---

A comparator is the circuit that converts a small analog voltage difference into a digital decision. It is a fundamental building block of analog-to-digital converters (ADCs), sensing interfaces, and mixed-signal systems, where its speed, offset, and energy consumption directly influence overall performance.

To better understand these trade-offs, I designed and characterized a single-tail StrongARM latched comparator in TSMC 0.18 µm CMOS using Cadence Virtuoso (schematic level). Beyond verifying functional operation, I measured its systematic input-referred offset, extracted the latch regeneration time constant from transient simulations using Python, and interpreted the measured behavior using the framework described by Razavi [1].

## Project Summary

- Designed a single-tail StrongARM comparator in TSMC 0.18 µm CMOS.
- Verified reset behavior, regeneration, and decision polarity in transient simulation.
- Extracted a regeneration time constant of 23.9 ps from logarithmic delay measurements.
- Confirmed exponential regeneration behavior (R² = 0.988).

## Operating Principle

The StrongARM latch is a dynamic comparator that consumes virtually no static power. Current is drawn only during the clock edge that performs a comparison, making the architecture well suited for high-speed and low-power ADCs.

The circuit consists of a clocked tail transistor, a differential input pair, a cross-coupled regenerative latch, and PMOS precharge devices.

During reset (CLK low), the tail transistor is turned off while the precharge transistors charge both internal and output nodes to VDD. Because no conduction path exists between the supply and ground, the comparator draws essentially no static current and begins each cycle from a well-defined initial condition.

During evaluation (CLK high), the tail transistor turns on and the differential input pair begins discharging the internal nodes. Any voltage difference between the two inputs creates a small imbalance, which is rapidly amplified once the cross-coupled latch enters regeneration. Positive feedback then drives one output to VDD and the other to ground, producing a full-swing digital decision every clock cycle.

{% include figure.liquid path="assets/img/projects/comparator/comparator_schematic.png" class="img-fluid" %}
*Single-tail StrongARM comparator schematic.*

## Measuring the Regeneration Time Constant

One of the most important dynamic characteristics of a StrongARM comparator is how quickly the regenerative latch amplifies a small voltage difference.

During regeneration, the differential output grows exponentially, meaning that smaller input differences require longer decision times. Consequently, the clock-to-output delay varies approximately linearly with the logarithm of the differential input voltage. This relationship allows the regeneration time constant to be extracted directly from simulation.

To characterize the latch, I swept the differential input (vid) logarithmically from 1 mV to 100 mV over 30 simulation points, measured the clock-to-output delay, and fitted the resulting data using least-squares regression in Python. The delay was measured using the differential output (VOP − VON), since single-ended measurements include common-mode motion and do not accurately represent the regenerative behavior.

The extracted parameters are:

| Quantity | Value |
| --- | --- |
| Regeneration time constant (τ_reg) | 23.9 ps |
| Fixed delay (t₀) | 75.6 ps |
| Fit quality (R²) | 0.988 |

The excellent fit (R² = 0.988) confirms that the simulated comparator follows the expected exponential regeneration model described by Razavi.

## Functional Verification

To verify correct operation, I held VIP at a 1.0 V reference while ramping VIN from 975 mV using a piecewise-linear source. The comparator was clocked at 100 MHz using a 1.8 V clock.

During every reset phase, both outputs were correctly precharged to VDD. During evaluation, the outputs regenerated to full logic levels, and the output polarity inverted cleanly as VIN crossed the reference voltage. No metastable stalls or incomplete output transitions were observed, confirming correct reset behavior, polarity, and rail-to-rail regeneration.

{% include figure.liquid path="assets/img/projects/comparator/comparator_bringup.png" class="img-fluid" %}
*Transient simulation showing VIN crossing the 1.0 V reference. The comparator produces one full-swing decision each clock cycle and cleanly reverses polarity at the crossing point.*

## Measured Performance

| Parameter | Value |
| --- | --- |
| Supply Voltage | 1.8 V |
| Clock Frequency | 100 MHz |
| Systematic Input-Referred Offset | < 2.5 mV |
| Regeneration Time Constant | 23.9 ps |
| Fixed Delay | 75.6 ps |
| Delay Fit (R²) | 0.988 |

### Device Dimensions

| Device | Function | Width |
| --- | --- | --- |
| NM0 / NM1 | Differential input pair | 20 µm |
| NM2 | Clocked tail transistor | 30 µm |
| NM3 / NM4 | Cross-coupled NMOS latch | 16 µm |
| PMOS latch | Cross-coupled PMOS | 12 µm |
| PMOS precharge | Reset switches | 4 µm |

## Limitations and Future Work

This project was completed at the schematic level, so several practical non-idealities remain to be investigated.

Future work will therefore focus on Monte Carlo mismatch analysis, post-layout extraction, kickback characterization, and noise analysis to evaluate the comparator under more realistic operating conditions.

## Reference

[1] B. Razavi, "The StrongARM Latch," *IEEE Solid-State Circuits Magazine*, vol. 7, no. 2, pp. 12–17, Spring 2015.

© Copyright 2026 Min Aung Thu.
