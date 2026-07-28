---
layout: page
title: Reproducing 2 stage CMOS Op-Amp
description: TSMC 0.18 µm CMOS, reproducing a research paper for study purposes
img: /assets/img/projects/2stage_opamp/opamp_schematic.png
importance: 3
category: work
---

A two-stage, Miller-compensated CMOS op-amp in TSMC 0.18 µm (ADS, schematic level), designed as a reproduction of a published reference [1]. Applying the reference sizing directly produced a second stage that operated in triode mode, with the output pinned near the rail. Re-deriving the output-device sizing from the reference's own zero-offset condition returned the stage to saturation and improved gain, phase margin, and power. Final performance: **80.1 dB gain, 35.3 MHz GBW, 71° phase margin, 133 µW** at 1.8 V.

## Architecture

NMOS input pair (M4/M5) with PMOS mirror load (M1/M2), driving a PMOS common-source second stage (M3) with an NMOS current-source load (M6). Miller capacitor Cc with nulling resistor Rc compensates around the second stage; a diode-connected reference (M8) mirrors bias to the tail (M7) and load (M6). All signal devices use L = 1 µm; intrinsic gain collapses at minimum length in this process, so the target DC gain is unreachable otherwise.

{% include figure.liquid path="/assets/img/projects/2stage_opamp/opamp_schematic.png" class="img-fluid rounded z-depth-1" %}

_(Labels follow this schematic; the second-stage common-source device is M3 here, M6 in [1].)_

## Diagnosis

The reference specifies the second-stage device at minimum length (0.18 µm) while all others use 1 µm, to raise its transconductance. This conflicts with the systematic-offset condition stated elsewhere in the same paper. Applying the reference sizing, the DC output settled at **1.42 V** on a 1.8 V supply. The operating point:

| Quantity                       | Value                  |
| ------------------------------ | ---------------------- |
| \|V_DS\|                       | 1.8 − 1.42 = 0.38 V    |
| \|V_OV\| = \|V_GS\| − \|V_TH\| | 1.26 − ≈0.45 = ≈0.81 V |
| \|V_DS\| vs \|V_OV\|           | 0.38 V < 0.81 V        |

\|V_DS\| < \|V_OV\| is the textbook triode condition. \|V_TH\| here is an approximation rather than a direct measurement, so this points toward the second stage operating in triode rather than confirming it outright, but it lines up with the rest of the evidence: in triode the output device's r_o would collapse, which would explain why the second stage contributes little gain and Miller pole-splitting fails, matching the observed insensitivity of DC gain to bias and loss of Cc's authority over GBW. The fix re-sizes the device to L = 1 µm and re-derives W ≈ 85 µm from the zero-offset condition, returning the output to mid-rail with both output devices saturated. DC gain then rose from ~73 dB to ~80 dB and the amplifier responded to compensation as expected.

## Results

Open-loop gain and phase were measured with a DC-feedback / AC-open bench: 80.1 dB DC gain, 35.3 MHz GBW, 71° phase margin.

{% include figure.liquid path="/assets/img/projects/2stage_opamp/gain_gbw_phase.png" class="img-fluid rounded z-depth-1" %}

Slew rate and settling were measured in a unity-gain buffer. The response is slew-asymmetric: the output pulls up through the PMOS common-source device but pulls down only through the load's fixed bias current, so the falling edge slews at under half the rising rate (20.5 vs 9.3 V/µs) and overshoots before recovering, which also lengthens falling-edge settling (88 vs 170 ns).

<div class="row">
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid path="/assets/img/projects/2stage_opamp/rising_slew_rate.png" class="img-fluid rounded z-depth-1" %}
    <div class="caption">Rising edge — 20.5 V/µs</div>
  </div>
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid path="/assets/img/projects/2stage_opamp/falling_slew_rate.png" class="img-fluid rounded z-depth-1" %}
    <div class="caption">Falling edge — 9.3 V/µs</div>
  </div>
</div>

{% include figure.liquid path="/assets/img/projects/2stage_opamp/settling_time.png" class="img-fluid rounded z-depth-1" %}
<div class="caption">Settling to 1% — 88 ns rising, 170 ns falling.</div>

A DC input sweep in the buffer configuration gives the output swing and input common-mode range: 1.00 V_pp swing, ICMR 0.62–1.62 V.

{% include figure.liquid path="/assets/img/projects/2stage_opamp/outputswing.png" class="img-fluid rounded z-depth-1" %}
<div class="caption">Output swing and ICMR from the DC buffer sweep.</div>

Supply rejection was swept with AC injected on the rail. The measured value is dominated by the ideal current-source bias (infinite output impedance), so it is reported for completeness only and is not physically representative. A real reference would set it in practice.

{% include figure.liquid path="/assets/img/projects/2stage_opamp/psrr.png" class="img-fluid rounded z-depth-1" %}
<div class="caption">Supply-to-output rejection vs frequency (ideal bias — see limitations).</div>

### Measured performance

| Parameter                  | This design     | Reference [1]    |
| -------------------------- | --------------- | ---------------- |
| DC gain                    | 80.1 dB         | 67.5 dB          |
| GBW                        | 35.3 MHz        | 131.9 MHz        |
| Phase margin               | 71.1°           | 61.8°            |
| Slew rate (rise / fall)    | 20.5 / 9.3 V/µs | 29.7 / 12.6 V/µs |
| Settling, 1% (rise / fall) | 88 / 170 ns     | —                |
| CMRR                       | 87 dB           | 88.4 dB          |
| Output swing               | 1.00 V_pp       | 936 mV_pp        |
| ICMR                       | 0.62 – 1.62 V   | —                |
| Power                      | 133 µW          | 204 µW           |

Higher gain (+12.6 dB), phase margin (+9°), swing, and lower power (−35%) than the reference. GBW is lower: that figure comes from the minimum-length output device (the same sizing choice implicated in the triode condition above), so the design trades bandwidth for a fully-saturated operating point.

**Final sizing:** M1/M2 50/1, M3 85/1, M4/M5 20/1, M6 30/1, M7 39/1, M8 10/1 µm. Cc = 2 pF, Rc = 5.5 kΩ, I_ref = 10 µA, C_L = 1 pF, V_CM = 0.9 V.

## Limitations

- The triode result may depend partly on this PDK's device models; the operating point and saturation inequality are direct measurements, but their attribution to the reference sizing is an inference consistent with the paper's internal inconsistency, not an independently confirmed claim.
- Compensation used ideal Cc/Rc (real MIM/poly models gave negligible change; no parasitic extraction). The ideal current-source bias makes the measured PSRR non-physical.
- No corner or Monte-Carlo analysis yet. The 11° of phase-margin headroom leaves room for it. Corner/mismatch validation and post-layout extraction are the next steps.

## Reference

[1] T. Yuan and Q. Fan, "Design of Two Stage CMOS Operational Amplifier in 180nm Technology," arXiv:2012.15737, 2020.
