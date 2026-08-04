---
layout: page
title: StrongARM Latched Comparator
description: TSMC 0.18 µm CMOS, single-tail StrongARM latch with regeneration-time extraction
img: /assets/img/projects/comparator/schematic.png
importance: 4
category: work
---

A comparator is the circuit that converts a small analog voltage difference into a digital decision based on the reference voltage and internal circuitry. Because it is the fundamental decision element in ADCs and many mixed-signal systems, I chose the StrongARM latch as a starting point for studying high-speed dynamic comparator design.

To better understand these trade-offs, I designed and verified a single-tail StrongARM latched comparator in TSMC 0.18 µm CMOS using Cadence Virtuoso (schematic level). I confirmed correct reset, regeneration, and decision behavior in transient simulation, and interpreted the circuit using the framework described by Razavi [1].

## Project Summary

- Designed a single-tail StrongARM comparator in TSMC 0.18 µm CMOS.
- Verified reset behavior, regeneration, and decision polarity in transient simulation.
- Observed a systematic input-referred offset below 1 mV from the simulated switching point.

## Operating Principle

The StrongARM latch is a dynamic comparator that consumes virtually no static power. Current is drawn only during the clock edge that performs a comparison, making the architecture well suited for high-speed and low-power ADCs.

The circuit consists of a clocked tail transistor, a differential input pair, a cross-coupled regenerative latch, and PMOS precharge devices.

During reset (CLK low), the tail transistor is turned off while the precharge transistors charge both internal and output nodes to VDD. Because no conduction path exists between the supply and ground, the comparator draws essentially no static current and begins each cycle from a well-defined initial condition.

During evaluation (CLK high), the tail transistor turns on and the differential input pair begins discharging the internal nodes. Any voltage difference between the two inputs creates a small imbalance, which is rapidly amplified once the cross-coupled latch enters regeneration. Positive feedback then drives one output to VDD and the other to ground, producing a full-swing digital decision every clock cycle.

{% include figure.liquid path="/assets/img/projects/comparator/schematic.png" class="img-fluid rounded z-depth-1" %}

_Single-tail StrongARM comparator schematic._

## Functional Validation

To verify correct operation, I held VIP at a 1.0 V reference while ramping VIN from 975 mV using a piecewise-linear source. The comparator was clocked at 100 MHz using a 1.8 V clock.

During every reset phase, both outputs were correctly precharged to VDD. During evaluation, the outputs regenerated to full logic levels, and the output polarity inverted cleanly as VIN crossed the reference voltage. No metastable stalls or incomplete output transitions were observed, confirming correct reset behavior, polarity, and rail-to-rail regeneration.

The output switched within approximately **0.5 mV** of the 1.0 V reference, indicating a very small systematic input-referred offset. Because the input ramp advances by a few millivolts each clock cycle, this value should be treated as an upper bound rather than an exact measurement. A finer quasi-static input sweep would be needed to determine the true offset more accurately.


{% include figure.liquid path="/assets/img/projects/comparator/bringup.png" class="img-fluid rounded z-depth-1" %}

_Transient simulation showing VIN crossing the 1.0 V reference. The comparator produces one full-swing decision each clock cycle and cleanly reverses polarity at the crossing point._


## Measured Performance

| Parameter                        | Value    |
| -------------------------------- | -------- |
| Supply Voltage                   | 1.8 V    |
| Clock Frequency                  | 100 MHz  |
| Systematic Input-Referred Offset | < 1 mV  |
| Regeneration Time Constant       | 23.9 ps  |
| Fixed Delay                      | 75.6 ps  |
| Delay Fit (R²)                   | 0.988    |


### Device Dimensions

| Device           |   Function                   | Width |
| --------------   |   ------------------------   | ----- |
| NM0 / NM1        |   Differential input pair    | 20 µm |
| NM2              |   Clocked tail transistor    | 30 µm |
| NM3 / NM4        |   Cross-coupled NMOS latch   | 16 µm |
| PMOS latch       |   Cross-coupled PMOS         | 12 µm |
| PMOS precharge   |   Reset switches             | 4 µm  |


## Limitations and Future Work

Since this project was completed at the schematic level, mismatch, parasitic effects, and kickback have not yet been characterized.

Future work will therefore focus on Monte Carlo mismatch analysis, post-layout extraction, kickback characterization, and noise analysis to evaluate the comparator under more realistic operating conditions.


## Reference

[1] B. Razavi, "The StrongARM Latch," _IEEE Solid-State Circuits Magazine_, vol. 7, no. 2, pp. 12–17, Spring 2015.
