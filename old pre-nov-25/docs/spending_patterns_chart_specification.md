# Specification: SpendingPatternsChart Component

This document details the calculations, data processing, and interpretation of the metrics displayed in the `SpendingPatternsChart` component.

## 1. Overview

The `SpendingPatternsChart` is designed to provide users with insights into their spending habits over time. It visualizes monthly spending per category and calculates key metrics like trends, data confidence, and month-over-month changes.

## 2. Data Processing

The component receives a `patterns` prop, which is an object where keys are category names and values are objects containing an array of monthly spending data.

### Initial Processing Steps:

1.  **Data Validation:** The component first checks if the `patterns` data is a valid object.
2.  **Data Sorting:** For each category, the monthly data is sorted chronologically.
3.  **Data Formatting:** The date for each data point is formatted to a "Month Year" format (e.g., "Jan '23") for display on the X-axis of the chart.

The processed data for each category is stored in the `processedPatterns` state and includes the formatted data array, calculated trends, and the last month's spending amount.

## 3. Key Calculations

Several key metrics are calculated to provide deeper insights into spending patterns.

### 3.1. Standard Trend

The standard trend measures the percentage change in spending from the very first month of data to the most recent month.

-   **Formula:**
    ```
    ((lastAmount - firstAmount) / |firstAmount|) * 100
    ```
-   **Interpretation:** This gives a long-term view of how spending in a category has evolved since tracking began. A positive value indicates an increase in spending, while a negative value indicates a decrease.

### 3.2. Enhanced Trend (Recent Trend)

The enhanced trend focuses on more recent spending activity to provide a more current momentum indicator. It calculates the percentage change over the last three months of available data.

-   **Formula:**
    ```
    ((lastRecentAmount - firstRecentAmount) / |firstRecentAmount|) * 100
    ```
    Where `firstRecentAmount` is the amount from three months ago and `lastRecentAmount` is the amount from the most recent month.
-   **Interpretation:** This metric is more sensitive to recent changes in spending habits. It helps identify short-term trends that might be masked by the long-term standard trend. The component prioritizes this value for displaying the trend indicator.

### 3.3. Total Spending & Month-over-Month Change

The chart can optionally display the total spending across all visible categories for each month.

-   **Total Spending:** For each month, this is the sum of spending across the top 4-6 categories displayed in the chart.
-   **Month-over-Month (MoM) Change:** This is the percentage change in `totalSpending` from the previous month to the current month.
    -   **Formula:**
        ```
        ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100
        ```
    -   **Interpretation:** This is shown in the tooltip and helps users understand the monthly volatility of their overall spending.

### 3.4. Average Spending

When the "Averages" toggle is enabled, a reference line appears on the chart.

-   **Calculation:** This is the average of `totalSpending` across all months displayed in the chart.
-   **Interpretation:** This line provides a quick visual benchmark, allowing users to see which months were above or below their average spending.

## 4. Interpreting the Visuals

### 4.1. Trend Indicator

Each category card displays a trend indicator based on its `enhancedTrend` (or `standardTrend` if not enough data exists for the enhanced calculation).

| Label            | Trend Value        | Meaning                               |
| ---------------- | ------------------ | ------------------------------------- |
| **Sharp Increase** | > 15%              | A significant, rapid increase.        |
| **Increasing**     | > 5% to 15%        | A moderate, steady increase.          |
| **Stable**         | -5% to 5%          | Spending is relatively consistent.    |
| **Decreasing**     | -15% to -5%        | A moderate, steady decrease.          |
| **Sharp Decrease** | < -15%             | A significant, rapid decrease.        |

### 4.2. Statistical Card Metrics

Each category has a detailed card with the following metrics:

-   **Strength:** This represents the magnitude (or volatility) of the spending change, regardless of direction.
    -   **Calculation:** It is the absolute value of the trend (`|enhancedTrend|`).
    -   **Interpretation:** A high strength value indicates a significant change (either an increase or a decrease), while a low value indicates stability.

-   **Change:** This is the raw percentage value of the `enhancedTrend` (or `standardTrend`).
    -   **Interpretation:** It shows both the direction (positive/negative) and the magnitude of the spending trend.

### 4.3. Confidence Score

The confidence score assesses the quality and reliability of the trend calculation based on the amount and recency of data.

-   **Calculation:**
    -   A score (0-100) is assigned based on the number of data points (months) and whether there is data from the last 3 months.
-   **Interpretation:**
    -   **High Confidence (e.g., 85%):** Indicates a reliable trend based on sufficient and recent data (e.g., >= 6 months of data with recent activity).
    -   **Moderate Confidence (e.g., 65%):** The trend is based on a moderate amount of data (e.g., 3-5 months with recent activity).
    -   **Low Confidence (e.g., 45% or less):** The trend is based on limited data (e.g., <= 2 months) and should be interpreted with caution. An accompanying message clarifies the data limitation.

This score is visualized as a progress bar on each category card, giving users a quick understanding of how much weight they should give to the calculated trend.
