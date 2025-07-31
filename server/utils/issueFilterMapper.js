const dayjs = require('dayjs');

function mapWorkflowFiltersToIssueAPI(filters = []) {
  const defaultStatuses = [
    'draft',
    'open',
    'pending',
    'in_progress',
    'completed',
    'in_review',
    'not_approved',
    'in_dispute'
  ];
  
  const params = {
    'filter[status]': defaultStatuses.join(',') // Set the default status filter
  };
  let assignedToList = [];

  for (const filter of filters) {
    const { filterBy, attribute } = filter;

    switch (filterBy) {
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
          params['filter[issueSubtypeId]'] = attribute.join(',');
        }
        break;

      case 'Assigned To User':
      case 'Assigned To Role':
      case 'Assigned To Company':
        if (Array.isArray(attribute)) {
          assignedToList.push(...attribute);
        }
        break;

      default:
        console.warn(`[IssueFilterMapper] Unhandled filter: ${filterBy}`);
    }
  }

  if (assignedToList.length > 0) {
    // Deduplicate in case the same ID appears under multiple types
    const uniqueAssignedTo = [...new Set(assignedToList)];
    params['filter[assignedTo]'] = uniqueAssignedTo.join(',');
  }

  return params;
}

// Translate due date filters
function mapDueDateRange(key) {
  const today = dayjs();

  switch (key) {
    case 'overdue_critical':
      return `..${today.subtract(7, 'day').format('YYYY-MM-DD')}`;
    case 'overdue_7':
      return `${today.subtract(7, 'day').format('YYYY-MM-DD')}..${today.subtract(3, 'day').format('YYYY-MM-DD')}`;
    case 'overdue_3':
      return `${today.subtract(3, 'day').format('YYYY-MM-DD')}..${today.subtract(1, 'day').format('YYYY-MM-DD')}`;
    case 'overdue_7':
      return `${today.subtract(1, 'day').format('YYYY-MM-DD')}..${today.format('YYYY-MM-DD')}`;
    default:
      return null;
  }
}

module.exports = { mapWorkflowFiltersToIssueAPI };
