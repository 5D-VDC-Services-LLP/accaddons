const dayjs = require('dayjs');

function mapWorkflowFiltersToIssueAPI(filters = []) {
  const params = {};

  for (const filter of filters) {
    const { filterBy, attribute } = filter;

    switch (filterBy) {
      case 'Created On':
        params['filter[createdAt]'] = mapDateRange(attribute);
        break;

      case 'Due Date':
        params['filter[dueDate]'] = mapDueDateRange(attribute);
        break;

      case 'Status':
        if (Array.isArray(attribute)) {
          params['filter[status]'] = attribute.join(',');
        } else {
          params['filter[status]'] = attribute;
        }
        break;

      case 'Issue Types':
        if (Array.isArray(attribute)) {
          params['filter[issueTypeId]'] = attribute.join(',');
        }
        break;

      case 'Root Cause Categories':
        if (Array.isArray(attribute)) {
          params['filter[rootCauseId]'] = attribute.join(',');
        }
        break;

      case 'Assigned To User':
        if (Array.isArray(attribute)) {
          params['filter[assignedTo]'] = attribute.join(',');
        }
        break;

      default:
        console.warn(`[IssueFilterMapper] Unhandled filter: ${filterBy}`);
    }
  }

  return params;
}

// Translate "last_14_days" etc. to date ranges
function mapDateRange(key) {
  const today = dayjs();
  switch (key) {
    case 'yesterday':
      return today.subtract(1, 'day').format('YYYY-MM-DD');
    case 'last_7_days':
      return `${today.subtract(7, 'day').format('YYYY-MM-DD')}..${today.format('YYYY-MM-DD')}`;
    case 'last_14_days':
      return `${today.subtract(14, 'day').format('YYYY-MM-DD')}..${today.format('YYYY-MM-DD')}`;
    case 'last_30_days':
      return `${today.subtract(30, 'day').format('YYYY-MM-DD')}..${today.format('YYYY-MM-DD')}`;
    default:
      return null;
  }
}

// Translate due date filters
function mapDueDateRange(key) {
  const today = dayjs();

  switch (key) {
    case 'critical_overdue_7':
      return `..${today.subtract(7, 'day').format('YYYY-MM-DD')}`;
    case 'overdue_less_7':
      return `${today.subtract(7, 'day').format('YYYY-MM-DD')}..${today.format('YYYY-MM-DD')}`;
    case 'today':
      return today.format('YYYY-MM-DD');
    case 'next_7_days':
      return `${today.format('YYYY-MM-DD')}..${today.add(7, 'day').format('YYYY-MM-DD')}`;
    case 'next_14_days':
      return `${today.format('YYYY-MM-DD')}..${today.add(14, 'day').format('YYYY-MM-DD')}`;
    default:
      return null;
  }
}

module.exports = { mapWorkflowFiltersToIssueAPI };
