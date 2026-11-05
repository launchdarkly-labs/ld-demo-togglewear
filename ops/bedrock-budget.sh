#!/usr/bin/env bash
# Creates (or updates) an AWS Budgets alert on Amazon Bedrock spend in the
# solutions engineering account, which every ToggleWear store's pod bills to
# through its EKS Pod Identity role. The store's API routes are rate limited
# (lib/apiGuard.ts); this is the backstop that says so if that is not enough.
#
# Alerts go out at 50%, 80% and 100% of the month's actual spend, and when
# the forecast for the month passes 100%.
#
#   aws sso login --profile launchdarkly-solutions-engineering
#   ops/bedrock-budget.sh <monthly USD limit> <email> [more emails...]
#
# Rerunnable: an existing budget of the same name is replaced.
set -euo pipefail

LIMIT="${1:?monthly limit in USD, for example 500}"
shift
[ "$#" -ge 1 ] || { echo "at least one email to notify" >&2; exit 1; }
NAME="bedrock-demos-monthly"
export AWS_PROFILE="${AWS_PROFILE:-launchdarkly-solutions-engineering}"
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)

subscribers=()
for email in "$@"; do
  subscribers+=("{\"SubscriptionType\":\"EMAIL\",\"Address\":\"$email\"}")
done
SUBS="[$(IFS=,; echo "${subscribers[*]}")]"

notification() {  # type threshold-type threshold
  jq -cn --arg t "$1" --arg tt "$2" --argjson th "$3" --argjson subs "$SUBS" '{
    Notification: {NotificationType: $t, ComparisonOperator: "GREATER_THAN",
                   Threshold: $th, ThresholdType: $tt},
    Subscribers: $subs }'
}
NOTIFICATIONS=$(jq -cn --argjson a "$(notification ACTUAL PERCENTAGE 50)" \
                       --argjson b "$(notification ACTUAL PERCENTAGE 80)" \
                       --argjson c "$(notification ACTUAL PERCENTAGE 100)" \
                       --argjson d "$(notification FORECASTED PERCENTAGE 100)" '[$a,$b,$c,$d]')

BUDGET=$(jq -cn --arg name "$NAME" --arg limit "$LIMIT" '{
  BudgetName: $name, BudgetType: "COST", TimeUnit: "MONTHLY",
  BudgetLimit: {Amount: $limit, Unit: "USD"},
  CostFilters: {Service: ["Amazon Bedrock"]},
  CostTypes: {IncludeCredit: false, IncludeRefund: false, UseAmortized: false} }')

aws budgets delete-budget --account-id "$ACCOUNT" --budget-name "$NAME" 2>/dev/null || true
aws budgets create-budget --account-id "$ACCOUNT" --budget "$BUDGET" \
  --notifications-with-subscribers "$NOTIFICATIONS"
echo "Budget $NAME: \$$LIMIT a month on Amazon Bedrock in account $ACCOUNT, alerting $*"
aws budgets describe-budget --account-id "$ACCOUNT" --budget-name "$NAME" \
  --query 'Budget.{Name:BudgetName,Limit:BudgetLimit,Filters:CostFilters}' --output table
