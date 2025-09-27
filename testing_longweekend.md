# Long Weekend Visualizer Testing (Gherkin Scenarios)

These scenarios validate the long-weekend detection and rendering logic for the Visualizer, based on API data and PHT timezone rules.

## Assumptions
- Timezone: Asia/Manila (PHT). All comparisons are at midnight PHT.
- API shape:
  - GET /api/holidays?year=YYYY → array of Holiday objects with at least { dateISO: "YYYY-MM-DD", name, type }
- Long weekend logic:
  - Natural: Friday or Monday holiday → 3-day weekend (Fri–Sun or Sat–Mon)
  - Suggested: Tuesday or Thursday holiday → 4-day weekend with 1 day of leave (Sat–Tue or Thu–Sun)

---

Feature: Detect natural long weekends (Fri/Mon)
  As a user
  I want natural long weekends (Fri/Mon holidays) to be identified
  So that I can plan 3-day weekends without taking leave

  Scenario: Friday holiday creates a Fri–Sun long weekend
    Given the API returns a holiday with dateISO "2025-08-29" and name "National Heroes Day (Observed)"
      And the weekday of 2025-08-29 in PHT is "Fri"
    When the visualizer computes long weekends
    Then a long weekend entry should exist with type "natural"
      And its startDate should be 2025-08-29T00:00:00+08:00
      And its endDate should be 2025-08-31T00:00:00+08:00
      And its duration should be "3-day weekend"

  Scenario: Monday holiday creates a Sat–Mon long weekend
    Given the API returns a holiday with dateISO "2025-06-16" and name "Eid al-Adha"
      And the weekday of 2025-06-16 in PHT is "Mon"
    When the visualizer computes long weekends
    Then a long weekend entry should exist with type "natural"
      And its startDate should be 2025-06-14T00:00:00+08:00
      And its endDate should be 2025-06-16T00:00:00+08:00
      And its duration should be "3-day weekend"

---

Feature: Detect suggested long weekends (Tue/Thu) with full 4-day span
  As a user
  I want suggested long weekends (Tue/Thu holidays) to include all 4 off-days
  So that I can see the complete opportunity when taking one day of leave

  Scenario: Tuesday holiday suggests Monday off, creates Sat–Tue long weekend
    Given the API returns a holiday with dateISO "2025-12-30" and name "Rizal Day"
      And the weekday of 2025-12-30 in PHT is "Tue"
    When the visualizer computes long weekends
    Then a long weekend entry should exist with type "suggested"
      And its startDate should be 2025-12-27T00:00:00+08:00
      And its endDate should be 2025-12-30T00:00:00+08:00
      And it should include a suggestedLeave day of 2025-12-29T00:00:00+08:00 (Monday)
      And its duration should be "4-day weekend"

  Scenario: Thursday holiday suggests Friday off, creates Thu–Sun long weekend
    Given the API returns a holiday with dateISO "2025-12-25" and name "Christmas Day"
      And the weekday of 2025-12-25 in PHT is "Thu"
    When the visualizer computes long weekends
    Then a long weekend entry should exist with type "suggested"
      And its startDate should be 2025-12-25T00:00:00+08:00
      And its endDate should be 2025-12-28T00:00:00+08:00
      And it should include a suggestedLeave day of 2025-12-26T00:00:00+08:00 (Friday)
      And its duration should be "4-day weekend"

---

Feature: Handle month/year boundaries
  As a user
  I want long weekends that span months or years to render all affected months
  So that I can see the full range without confusion

  Scenario: Tuesday holiday on Jan 1 (Tue) includes preceding year’s weekend
    Given the API returns a holiday with dateISO "2024-01-02" and name "Special Holiday"
      And the weekday of 2024-01-02 in PHT is "Tue"
    When the visualizer computes long weekends
    Then the long weekend range should start on 2023-12-30T00:00:00+08:00 (Saturday)
      And end on 2024-01-02T00:00:00+08:00 (Tuesday)
      And the visualizer should render calendars for both December 2023 and January 2024

---

Feature: Sorting and de-duplication of results
  As a user
  I want long weekends sorted chronologically without duplicates
  So that navigation is predictable and clean

  Scenario: Overlapping suggestions are merged or ordered by start date
    Given the API returns two holidays on the same week that produce overlapping ranges
    When the visualizer computes long weekends
    Then the visualizer should display entries sorted by startDate ascending
      And should not display identical duplicate ranges

---

Feature: Day styling in calendar grid
  As a user
  I want visual cues for holiday, weekend, suggested leave, and the long weekend range
  So that the reason for the long weekend is clear

  Scenario: Correct styling applied to off-days inside the range
    Given a computed long weekend with startDate and endDate
    When the visualizer renders month calendars
    Then each day within the range that is a weekend, holiday, or suggested leave should have the class "long-weekend-range"
      And the holiday should have the class "holiday"
      And the suggested leave should have the class "suggested-leave" with a star indicator
      And Sat/Sun should have the class "weekend"
