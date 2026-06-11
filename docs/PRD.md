# Product Requirements Document (PRD)

# AI-Powered Alcohol Label Verification App: Phase 1 (Proof of concept version)

## Executive Summary

The Alcohol and Tobacco Tax and Trade Bureau (TTB) reviews approximately 150,000 alcohol label applications annually. A significant part of the review process is manually comparing information on the label artwork against submitted application data.

This project is a standalone prototype designed to evaluate whether AI-assisted extraction and comparison can reduce manual review effort while preserving human oversight. The prototype helps compliance agents quickly identify matching fields, discrepancies, missing information, and government warning issues.

The system is intended as a decision-support tool, not an automated approval engine.

## Business Context

Current challenges include high manual effort, limited staff capacity, repetitive verification work.

## Inputs from Stakeholders

### Sarah Chen – Deputy Director of Label Compliance
- Wants faster processing and simple workflows.
- Requires results in a few seconds.
- Interested in future batch processing.

### Marcus Williams – IT Systems Administrator
- Wants a standalone proof of concept.
- Concerned with future deployment constraints.
- Notes security and integration considerations.

### Dave Morrison – Senior Compliance Agent
- Wants human judgment preserved.
- Believes exact string matching is insufficient.
- Needs likely-match and review workflows.

### Jenny Park – Junior Compliance Agent
- Focused on government warning compliance.
- Requires exact warning validation.
- Requires uppercase GOVERNMENT WARNING validation.


## Problem Statement

Compliance agents spend significant time manually verifying application data against label artwork. Much of this work is repetitive and suitable for AI-assisted review while retaining human oversight.

## Product Vision

Provide a fast, intuitive review tool that extracts label information, compares it against application data, highlights discrepancies.

### User Workflow for this Proof of concept version of the App:

1. User uploads a label image.
2. User enters **application data** for comparison.
3. System extracts text from the uploaded label (extracted values).
4. System compares **extracted values** against **application data**.
5. System displays field-level comparison results.
6. User reviews flagged discrepancies and makes the final determination.

### The App produce this Output Results
An example of what the output results look like.  Users can review and make final decision per this table.

| Field                  | Application value  | Extracted value      | Result   | Confidence |
| ---------------------- | ------------------ | -------------------- | -------- | ---------- |
| Brand name             | Solara             | STONE'S THROW        | Mismatch | 89%        |
| Class/type designation | Red table Wine     | Red table wine       | Match    | 97%        |
| Alcohol content        | 40                 | 13.5% alc vol        | Mismatch | 89%        |
| Net contents           | 750 ML             | 750ML                | Match    | 99%        |
| Producer/bottler name  | Solara Spirits CO. | Stones Throw Cellars | Mismatch | 86%        |
| Country of origin      | Anytown, CA        | USA                  | Mismatch | 84%        |


## Functional Requirements

- Upload a label image.
- Enter application data manually.
- Extract label fields.
- Compare extracted values against application values.
- Display Match, Likely Match, Mismatch, Missing, and Needs Human Review outcomes.
- Validate government warning separately.
- Display confidence indicators.


### Required Extraction Fields
Brand Name
Class/Type Designation
Alcohol Content
Net Contents
Producer/Bottler Name
Producer/Bottler Address
Country of Origin
Government Warning Statement

### Comparison Rules
Match: values are equivalent after normalization.
Likely Match: differences are limited to capitalization, punctuation, or spacing.
Mismatch: values are materially different.
Missing: a required value is not detected.
Needs Human Review: confidence is insufficient for automated classification.

Examples:
"STONE'S THROW" vs "Stone's Throw" → Likely Match
"45% Alc./Vol." vs "45% Alc./Vol." → Match
"45%" vs "40%" → Mismatch

### Government Warning Validation
The system shall validate the Government Health Warning Statement independently from other fields.

Validation shall include:

* Presence of the warning statement.
* Exact text matching against the required warning language.
* Verification that "GOVERNMENT WARNING:" appears in uppercase.
* Identification of missing, altered, or incomplete warning text.

Any deviation shall be flagged for reviewer attention.

## Non-Functional Requirements

- Simple to use UI.  People can understand and access the UI easily without so much effort looking for them.
- Clear explanations of outcomes.
- Human reviewer remains final decision maker.
- Performance: fast response time, target under 5 seconds to evaluate a single image.
    
## Acceptance Criteria

* The system processes a valid label image and returns results within 5 seconds under normal conditions.
* The system extracts supported label fields and displays extracted values.
* The system identifies matching and mismatching values between application data and label content.
* The system validates the Government Health Warning Statement.
* The system displays confidence indicators for extracted information.
* The user remains the final decision maker for all review outcomes.

## Scope

### In Scope
- Single image upload
- AI extraction
- Comparison engine
- Government warning validation
- Confidence indicators

### Out of Scope
- Authentication
- Database
- Camera to take picture, or automatic image enhancement and correction are out of scope for this prototype.
- No batch upload/processing in phase 1
- Production deployment
- Audit trails, COLA integration, FedRAMP details

## Future Enhancements

- Batch processing (upload many images and compare them)
- Workflow queues
- Supervisor dashboards
- COLA integration
- FedRAMP-aligned deployment

## Requirements Traceability Matrix

| Stakeholder Insight            | Product Requirement       | Feature                 |
|--------------------------------|---------------------------|-------------------------|
| Manual review is repetitive    | Automated comparison      | Comparison Engine       |
| Slow processing not acceptable | Response within 5 sec     | Optimized AI processing |
| Human judgement is required    | User=final decision maker | Human in the loop       |
| Users vary in technical ability| Simple UI                 | Single-page workflow    |
| Exact matching is insufficient | Normalization             | Likely Match            |
| Government warning is critical | Dedicated validation      | Warning Validation      |
| Large batch submissions exist  | Future batch support      | Roadmap                 |
