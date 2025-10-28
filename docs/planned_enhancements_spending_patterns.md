# Planned Enhancements: Spending Patterns Chart - Oct 3, 2025

This document outlines three actionable enhancement ideas for the `SpendingPatternsChart` component. The focus is on introducing new calculations and design improvements to enhance user understanding, ease of use, and the ability to interpret spending patterns effectively.

---

### 1. Predictive Spending Forecast

This feature moves from descriptive analytics (what you've spent) to predictive analytics (what you're likely to spend), allowing users to be proactive.

*   **Calculation:**
    *   **Linear Regression:** For each category, use the last 3 to 6 months of spending data to perform a simple linear regression. This calculates a trend line (`y = mx + b`).
    *   **Forecasting:** Project this trend line forward for the next 1-3 months to forecast future spending in that category.
    *   **Total Forecast:** Sum the forecasted amounts for all categories to provide a total forecasted spending for the upcoming months.

*   **How it Enhances User Information:**
    *   **Proactive Budgeting:** Users can see if their current trajectory will lead them to go over budget in the near future, giving them time to adjust their spending.
    *   **Goal-Oriented Insights:** It answers the question, "If I keep spending like this, where will I be next month?" This is highly actionable for users trying to hit a savings or budget target.

*   **Design & Interpretation:**
    *   **On the Chart:** Extend the existing solid lines for each category with **dotted or dashed lines** for the forecasted months. The area under the forecast could have a subtle, semi-transparent background to clearly separate it from historical data.
    *   **In the Tooltip:** When hovering over a future month, the tooltip would show "Forecasted: ~$X" instead of the historical amount.
    *   **In the Stat Cards:** Add a new metric: "**Next Month's Forecast**" with the projected amount (e.g., `~${formatCurrency(forecastedAmount)}`).

---

### 2. Volatility & Stability Score

This feature helps users identify which spending categories are predictable and which are erratic, helping them create more resilient budgets.

*   **Calculation:**
    *   **Coefficient of Variation (CV):** For each category with at least 3-4 months of data, calculate the standard deviation of spending and divide it by the average (mean) spending.
        *   `CV = (Standard Deviation / Average Spending) * 100`
    *   The CV is a standardized measure, meaning you can fairly compare the volatility of a high-cost category (like "Mortgage") with a low-cost one (like "Subscriptions").

*   **How it Enhances User Information:**
    *   **Identifies Unpredictability:** It highlights categories where spending is inconsistent, which are often the ones that break a budget. This is a different insight from the trend, which only shows the direction of spending, not its consistency.
    *   **Better Budget Buffers:** Users can see which categories might require a larger "buffer" in their budget to handle unexpected fluctuations.

*   **Design & Interpretation:**
    *   **In the Stat Cards:** Introduce a new "Stability" or "**Volatility**" metric. Translate the CV percentage into a simple, human-readable label:
        *   `0-15%`: **Very Stable** (e.g., rent, subscriptions)
        *   `15-30%`: **Mostly Stable** (e.g., groceries, utilities)
        *   `30-50%`: **Variable** (e.g., dining out, shopping)
        *   `>50%`: **Erratic** (e.g., one-off purchases, travel)
    *   **Visual Cue:** Display this label next to a simple icon, like a calm wave for "Stable" and a jagged, zig-zag line for "Erratic," providing an instant visual cue.

---

### 3. Personal vs. Average Benchmarking

This feature provides context by comparing the user's most recent spending habits against their own historical average, highlighting recent behavioral changes.

*   **Calculation:**
    *   **Historical Average Distribution:** Calculate the user's average spending distribution (as a percentage of total spending) for each category over the last 6 months.
    *   **Recent vs. Average:** For the most recent month, compare its spending distribution to the historical average. Calculate the variance for each category (e.g., "Dining Out: +5% vs. average," "Groceries: -3% vs. average").

*   **How it Enhances User Information:**
    *   **Contextualizes Spending:** It answers the question, "Is this month's spending normal for me?" Users can immediately see which categories they over- or under-spent in compared to their own typical behavior.
    *   **Highlights Lifestyle Creep:** A gradual increase in a category's percentage share over time, even if the dollar amount isn't alarming, can be a powerful indicator of "lifestyle creep."

*   **Design & Interpretation:**
    *   **New Chart Type:** Add a toggle to switch from the line chart to a "**Monthly Breakdown**" bar chart.
    *   **Visual Design:** For each category, display a single bar representing the current month's spending. Inside that bar, use a **thinner, darker bar or a simple line** to indicate what the 6-month average spending is for that category.
    *   **Color-Coding:** The portion of the bar that exceeds the average line can be colored in a warning color (yellow or light red) to instantly draw the user's attention to the overspend.
    *   **Summary Insight:** Include a dynamic summary sentence above the chart, such as: "This month, your spending on 'Wants' was **8% higher** than your average, while 'Needs' were **3% lower**."
